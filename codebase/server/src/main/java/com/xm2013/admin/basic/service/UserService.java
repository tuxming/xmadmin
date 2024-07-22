package com.xm2013.admin.basic.service;

import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.redis.Redis;
import com.xm2013.admin.common.CacheKey;
import com.xm2013.admin.common.Kit;
import com.xm2013.admin.common.SqlKit;
import com.xm2013.admin.domain.dto.PageInfo;
import com.xm2013.admin.domain.dto.user.UserListQuery;
import com.xm2013.admin.domain.model.User;
import com.xm2013.admin.domain.model.UserData;
import com.xm2013.admin.shiro.dto.ShiroUser;

public class UserService {

	/**
	 * 根据用户名查找用户
	 * @param username
	 * @return
	 */
	public User findByUsername(String username) {
		User user = User.dao.findFirstByCache(CacheKey.USER_NAME, username, "select * from sys_user where username=?", username);
		return user;
	}
	
	/**
	 * 根据id查找用户的数据权限
	 * @param userId
	 * @return
	 */
	public List<UserData> findDataPathByUser(Integer userId) {
		return UserData.dao.findByCache(CacheKey.USER_ID, userId, "select * from sys_user_data where user_id=?", userId);
	}

	public User findById(int id) {
		User user = User.dao.findFirstByCache(CacheKey.USER_NAME, id, "select * from sys_user where id=?", id);
		return user;
	}

	public User findByPhone(String phone) {
		User user = User.dao.findFirstByCache(CacheKey.USER_EMAIL, phone, "select * from sys_user where phone=?", phone);
		return user;
	}
	
	public User findByEmail(String email) {
		User user = User.dao.findFirstByCache(CacheKey.USER_PHONE, email, "select * from sys_user where email=?", email);
		return user;
	}

	/**
	 * 移除缓存
	 * @param user
	 */
	public void removeUserCache(User user) {
		if(user == null) {
			return;
		}
		Redis.use().hdel(CacheKey.USER_ID, user.getId());
		Redis.use().hdel(CacheKey.USER_NAME, user.getUsername());
		Redis.use().hdel(CacheKey.USER_NAME, user.getPhone());
		Redis.use().hdel(CacheKey.USER_EMAIL, user.getEmail());
		Redis.use().hdel(CacheKey.USER_PHONE, user.getPhone());
	}
	
	/**
	 * 根据类型更新密码
	 * @param type	1-电话号码，2-邮箱地址，3-账号，4-id
	 * @param account 账号
	 * @param password 未加密的密码
	 * @return
	 */
	public boolean updatePassword(int type, String account, String password) {
		
		String name = "";
		switch (type) {
		case 1:
			name="phone";
			break;
		case 2:
			name="email";
			break;
		case 3:
			name="username";
			break;
		default:
			name="id";
			break;
		}
		
		User user = User.dao.findFirst("select * from sys_user where "+name+"=?", account);
		if(user == null) 
			return false;
		
		removeUserCache(user);
		
		int row = Db.update("update sys_user set password=? where "+name+"=?", Kit.doubleMd5WidthSalt(password), account);
		
		
		return row>0;
	}
	
	/**
	 * 分页获取用户列表
	 * @param query
	 * @return
	 */
	public PageInfo<User> pageList(UserListQuery query, ShiroUser user) {
		
		PageInfo<User> page = new PageInfo<User>();
		
		List<User> users = list(query, user);
		page.setList(users);
		
		
		if(query.getStart() == 0) {
			int total = total(query, user);
			page.setTotal(total);
		}
		
		return page;
	}
	
	/**
	 * 查询列表
	 * @param query
	 * @param user
	 * @return
	 */
	public List<User> list(UserListQuery query, ShiroUser user) {
		
		String sql = "select t.* from sys_user as t "
				+ " left join sys_user_role as t1 on t1.user_id = t.id"
				+ " where 1=1 ";
		
		String where = buildWhere(query, user);
		sql += where + " group by t.id order by t.id desc limit "
				+query.getStart() + " , " + query.getLength();
		
//		System.out.println(query);
		
		return User.dao.find(sql);
	}
	
	/**
	 * 查询总数
	 * @param query
	 * @param user
	 * @return
	 */
	public int total(UserListQuery query, ShiroUser user) {
		
		String sql = "select count(t.id) as total from sys_user as t"
				+ " left join sys_user_role as t1 on t1.user_id = t.id "
				+ " where 1=1 ";
		
		sql += buildWhere(query, user);
		
		sql += "group by t.id ";
		
		sql = "select sum(total) from ("+sql+") as f ";
//		System.out.println(sql);
		Integer total = Db.queryInt(sql);
		return total == null?0: total;
	}
	
	private String buildWhere(UserListQuery query, ShiroUser user) {
		String where = "";
		if(!user.isAdmin()) {
			String users = user.getUsers();
			if(Kit.isNotNull(users)) {
				where += "and t.id in ("+users+")";
			}
			where += " and t.dept_path ("+String.join("|", user.getDataPath())+")";
		}
		
		String basicValue = SqlKit.getSafeValue(query.getBasicValue());
		if(Kit.isNotNull(basicValue)) {
			where += " and ("
					+ " t.username like '"+basicValue+"%' "
					+ " or t.fullname like '"+basicValue+"%' "
//					+ " or email like '"+basicValue+"%' "
//					+ " or phone like '"+basicValue+"%'"
					+ ")";
			return where;
		}
		
		where += SqlKit.eq("t.username", query.getUsername());
		where += SqlKit.eq("t.id", query.getUserId());
		where += SqlKit.eq("t.fullname", query.getFullname());
		where += SqlKit.eq("t.email", query.getEmail());
		where += SqlKit.eq("t.phone", query.getPhone());
		
		where += SqlKit.inNo("t1.role_id", query.getRoleIds());
		
		where += SqlKit.eq("t.dept_id", query.getDeptId());
		where += SqlKit.buildDateRange("t.created", query.getStartDate(), query.getEndDate());
		
		return where;
	}

	/**
	 * 根据datapath获取指定的datapath所有的用户id
	 * @param userDatas
	 * @return
	 */
	public String getUserIdsByDatapath(List<String> userDatas) {
		return Db.queryStr("select group_concat(id) from sys_user where dept_path regexp '"+String.join("|", userDatas)+"'");
	}

	/**
	 * @param key
	 * @param user
	 * @return
	 */
	public List<User> search(String key, ShiroUser user) {

		key = SqlKit.getSafeValue(key);
		
		String sql = "select id, username, fullname from sys_user where (username like '%"+key+"%' or fullname like '%"+key+"%') limit 50";
		if(!user.isAdmin()) {
			if(Kit.isNotNull(user.getUsers())) {
				sql += " and creater in ("+user.getUsers()+")";
			}else {
				sql += " and creater="+user.getId();
			}
		}
		
		List<User> users = User.dao.find(sql);
		return users;
	}


	
	
}
