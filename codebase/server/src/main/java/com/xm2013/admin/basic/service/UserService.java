package com.xm2013.admin.basic.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.redis.Redis;
import com.xm2013.admin.common.CacheKey;
import com.xm2013.admin.common.Kit;
import com.xm2013.admin.common.SqlKit;
import com.xm2013.admin.domain.dto.PageInfo;
import com.xm2013.admin.domain.dto.user.UserListQuery;
import com.xm2013.admin.domain.model.Dept;
import com.xm2013.admin.domain.model.User;
import com.xm2013.admin.domain.model.UserData;
import com.xm2013.admin.shiro.dto.ShiroUser;
import com.xm2013.admin.shiro.dto.ShiroUserData;

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
		
		where += user.buildAuthCondition("t");
		
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
		
		String sql = "select id, username, fullname from sys_user where"
				+ user.buildAuthCondition("")
				+ " and (username like '%"+key+"%' or fullname like '%"+key+"%') limit 50";
		
		List<User> users = User.dao.find(sql);
		return users;
	}



	/**
	 * 获取用户的数据权限，
	 * 所有授权的用户id,
	 * 所有授权的节点权限
	 * @param userId
	 * @return
	 */
	public List<ShiroUserData> findUserDataByUser(Integer userId) {
		
		List<UserData> userDatas = UserData.dao.find("select * from sys_user_data where user_id=?");
		if(!userDatas.isEmpty()) {
			Map<Integer, List<UserData>> mapByType = userDatas.stream().collect(Collectors.groupingBy(s -> s.getType()));
			
			List<UserData> users = mapByType.get(1);
			List<UserData> depts = mapByType.get(2);
			
			if(users!=null && !users.isEmpty()) {
				String[] userIds = new String[users.size()];
				Map<Integer, UserData> map1 = new HashMap<Integer, UserData>();
				for (int i=0; i<users.size(); i++) {
					UserData ud = users.get(i);
					userIds[i] = ud.getRefId()+"";
					map1.put(ud.getRefId(), ud);
				}
				
				List<User> userInfos = User.dao.find("select id, fullname, username from sys_user where id in ("+String.join(",", userIds)+")");
				for (User user : userInfos) {
					UserData ud = map1.get(user.getId().intValue());
					String name = user.getFullname()+"("+user.getUsername()+")";
					ud.put("username", name);
				}
					
			}
			
			if(depts!=null && !depts.isEmpty()) {
				String[] deptIds = new String[depts.size()];
				Map<Integer, UserData> map1 = new HashMap<Integer, UserData>();
				for(int i=0; i<depts.size(); i++) {
					UserData us = depts.get(i);
					deptIds[i] = us.getId()+"";
					map1.put(us.getRefId(), us);
				}
				
				List<Dept> deptInfos = Dept.dao.find("select * from sys_dept where id in ("+String.join(",", deptIds)+")");
				for (Dept dept : deptInfos) {
					UserData ud = map1.get(dept.getId().intValue());
					ud.put("path",dept.getPath());
					ud.put("pathName", dept.getPathName());
				}
				
			}
			
		}
		
		List<ShiroUserData> suds = new ArrayList<>();
		for (UserData userData : userDatas) {
			
			ShiroUserData sd = new ShiroUserData();
			sd.setId(userData.getId());
			sd.setUserId(userData.getId());
			sd.setRefId(userData.getRefId());
			int type = userData.getType();
			sd.setType(type);
			if(type == 1) {
				sd.setUsername(userData.getStr("username"));
			}else {
				sd.setPath(userData.getStr("path"));
				sd.setPathName(userData.getStr("pathName"));
			}
			
		}
		
		return suds;
	}


	
	
}
