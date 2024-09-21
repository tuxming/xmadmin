package com.xm2013.admin.basic.service;

import java.util.ArrayList;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import com.jfinal.aop.Inject;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.redis.Redis;
import com.xm2013.admin.common.CacheKey;
import com.xm2013.admin.common.Kit;
import com.xm2013.admin.common.SqlKit;
import com.xm2013.admin.domain.dto.PageInfo;
import com.xm2013.admin.domain.dto.user.UpdateUserDto;
import com.xm2013.admin.domain.dto.user.UserListQuery;
import com.xm2013.admin.domain.model.Dept;
import com.xm2013.admin.domain.model.User;
import com.xm2013.admin.domain.model.UserData;
import com.xm2013.admin.domain.model.UserRole;
import com.xm2013.admin.exception.BusinessErr;
import com.xm2013.admin.exception.BusinessException;
import com.xm2013.admin.exception.Msg;
import com.xm2013.admin.shiro.dto.ShiroUser;
import com.xm2013.admin.shiro.dto.ShiroUserData;

public class UserService {
	
	@Inject
	private DeptService deptService;
	@Inject
	private DocumentService documentSerivce;
	
	private static String sql = "select t.*, t1.path as deptPath, t1.name as deptName, t1.path_name as deptPathName "
			+ " from sys_user as t left join sys_dept as t1 on t1.id = t.dept_id where ";
	
	/**
	 * 根据用户名查找用户
	 * @param username
	 * @return
	 */
	public User findByUsername(String username) {
		User user = User.dao.findFirstByCache(CacheKey.USER_NAME, username, sql + " t.username=?", username);
		return user;
	}

	public User findById(int id) {
		User user = User.dao.findFirstByCache(CacheKey.USER_ID, id, sql + " t.id=?", id);
		return user;
	}

	public User findByPhone(String phone) {
		User user = User.dao.findFirstByCache(CacheKey.USER_EMAIL, phone, sql + " t.phone=?", phone);
		return user;
	}
	
	public User findByEmail(String email) {
		User user = User.dao.findFirstByCache(CacheKey.USER_PHONE, email, sql + " t.email=?", email);
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
		for (User u : users) {
			u.remove("password");
		}
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
		
		String sql = "select t.*, t2.name as deptName, t2.path as deptPath, t2.path_name as deptPathName from sys_user as t "
				+ " left join sys_user_role as t1 on t1.user_id = t.id "
				+ " left join sys_dept as t2 on t2.id = t.dept_id "
				+ " where ";
		
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
				+ " where ";
		sql += buildWhere(query, user);
		sql += " group by t.id ";
		
		sql = "select sum(total) from ("+sql+") as f ";
//		System.out.println(sql);
		Integer total = Db.queryInt(sql);
		return total == null?0: total;
	}
	
	private String buildWhere(UserListQuery query, ShiroUser user) {
		String where = "";
		
		where += user.buildAuthCondition("t");
//		if(!user.isAdmin()) {
//			query.getStatus().add(User.STATUS_DELETE);
//		}
		
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
		where += SqlKit.inNo("t.status", query.getStatus());
		
		where += SqlKit.inNo("t1.role_id", query.getRoleIds());
		
		where += SqlKit.eq("t.dept_id", query.getDeptId());
		where += SqlKit.buildDateRange("t.created", query.getStartDate(), query.getEndDate());
		where += " and t.status != "+User.STATUS_DELETE;
		
		return where;
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


	/**
	 * 删除用户，将用户设置为删除状态
	 * 前5个账户为预留账户，不能删除
	 * @param id
	 * @param loginUser
	 * @return
	 */
	public boolean delete(Integer id, ShiroUser loginUser) {
		if(id < 5 || !loginUser.isOwnerData(null, id)) {
			return false;
		}
		
		User user = findById(id);
		if(user == null) {
			return false;
		}
		
		boolean result = Db.update("update sys_user set status=3 where id=?", id)>0;
		removeUserCache(user);
		
		return result;
	}


	/**
	 * 创建用户
	 * @param user
	 * @param loginUser
	 * @return
	 */
	public String create(User user, ShiroUser loginUser) {
		
		//密码加密
		user.setPassword(Kit.doubleMd5WidthSalt(user.getPassword()));
		user.setParentId(loginUser.getId());
		//设置性别
		if(user.getGender() == null || user.getGender()>2 || user.getGender()<0) {
			user.setGender(2);
		}
		
		Dept dept = deptService.findById(user.getDeptId());
		if(dept == null) {
			return Msg.UNEXIST_DEPT;
		}
		
		//设置组织
		if(!loginUser.isOwnerData(dept.getPath())) {
			return Msg.NO_DEPT_AUTH;
		}
		
		user.setDeptId(dept.getId());
		
		//生成token
		String token = UUID.randomUUID().toString();
		token = new String(Base64.getEncoder().encode(token.getBytes()));
		user.setToken(token);
		
		user.setCreated(new Date());
		
		if(user.getPhoto() == null) {
			user.setPhoto(0);
		}
		
		user.setStatus(1);
		
		user.save();
		
		int userId = user.getId();
		new User().setId(userId)
			.setCode(String.format("%08d", user.getId()))
			.update();
		
		//设置数据权限
		//默认可以查看自己的数据权限
		new UserData().setUserId(userId).setRefId(userId).setType(1).save();
		
		return null;
	}

	/**
	 * 更新用户
	 * @param user
	 * @param loginUser
	 * @return
	 */
	public void update(UpdateUserDto user, ShiroUser loginUser) {
		User db = findById(user.getId());

		if(!loginUser.isOwnerData(user.getStr("deptPath"), user.getId())) {
			user.setResultMsg(Msg.NO_DATA_AUTH);
			return;
		}
		
		User u = new User();
		
		//设置名字
		String fullname = user.getFullname();
		if(Kit.isNotNull(fullname) && !db.getFullname().equals(fullname)) {
			u.setFullname(fullname);
		}
		
		//设置密码
		String password = user.getPassword();
		String newPassword = user.getNewPassword();
		if(Kit.isNotNull(password) && Kit.isNotNull(newPassword) ) {
			//判断原始密码是否相等
			if(loginUser.isAdmin() == false &&  !db.getPassword().equals(Kit.doubleMd5WidthSalt(user.getPassword()))) {
				user.setResultMsg(Msg.ERR_PWD);
				return ;
			}
			
			//判断两次密码输入是否一致
			if(!newPassword.equals(user.getRePassword())) {
				user.setResultMsg(Msg.UNEQUAL_PASSWORD);
				return ;
			}
			
			u.setPassword(Kit.doubleMd5WidthSalt(newPassword));
		}
		
		//刷新token
		boolean refreshToken = user.isRefreshToken();
		if(refreshToken) {
			String token = UUID.randomUUID().toString();
			token = new String(Base64.getEncoder().encode(token.getBytes()));
			u.setToken(token);
			user.setResultData(token);
		}
		
		//更新状态
		Integer status = user.getStatus();
		if(status !=null && status != db.getStatus().intValue()) {
			if(status >=0 && status<=2) {
				u.setStatus(status);
			}else {
				user.setResultMsg(Msg.INVALID_STATUS);
				return ;
			}
		}
		
		//更新性别
		Integer gender = user.getGender();
		if(gender != null && db.getGender()!= gender.intValue()) {
			if(gender >=0 && gender<=2) {
				u.setGender(gender);
			}else {
				user.setResultMsg( Msg.INVALID_GENDER);
				return;
			}
		}
		
		//更新email
		String email = user.getEmail();
		if(Kit.isNotNull(email) && !email.equals(db.getEmail())) {
			if(email.matches("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}")) {
				u.setEmail(email);
			}else {
				user.setResultMsg(Msg.INVALID_EMAIL);
				return ;
			}
		}
		
		//更新电话号码
		String phone = user.getPhone();
		if(Kit.isNotNull(phone) && !phone.equals(db.getPhone())) {
			if(phone.matches("1[\\d]{10}")) {
				u.setPhone(phone);
			}else {
				user.setResultMsg(Msg.INVALID_PHONE);
				return ;
			}
		}
		
		//更新照片
		Integer photo = user.getPhoto();
		if(photo != null && photo.intValue()!=db.getPhoto()) {
			u.setPhoto(photo);
			
			//这个表示，数据库存在照片id, 传进来的不是一个非0的照片id,
			//说明要直接覆盖掉原来的照片，所以需要删除
			//如果photo=0, 说明照片照片已经删除，这里只是单纯的将用户照片索引设置为0而已
			if(db.getPhoto() > 0 && photo > 0)
				documentSerivce.deletes(db.getPhoto()+"", loginUser);
		}
		
		//更新组织
		Integer deptId = user.getDeptId();
		if(deptId!=null && deptId.intValue()!=db.getDeptId()) {
			
			Dept dept = deptService.findById(deptId);
			if(dept == null || !loginUser.isOwnerData(dept.getPath())) {
				user.setResultMsg(Msg.NO_DEPT_AUTH);
				return ;
			}
			
			u.setDeptId(dept.getId());
		}
		
		if(u._getAttrNames().length == 0) {
			user.setResultMsg(Msg.NO_UPDATE_DATA);
			return ;
		}
		u.setId(user.getId());
		removeUserCache(db);
		u.update();
		
	}

	/**
	 * 获取用户的数据权限
	 * @param type: 0-全部，1-用户， 2-组织
	 * @param id: 要查询的用户id
	 */
	public List<User> dataPermissions(int userId, int type, ShiroUser loginUser) {
		
		User user = findById(userId);
		if(user==null || !loginUser.isOwnerData(user.getStr("deptPath"), user.getId())) {
			return new ArrayList<User>();
		}
		
		String sql = "select t.id as userId, t.photo, t.username, t.fullname, t1.id as id from sys_user as t "
				+ " left join sys_user_data as t1 on t1.ref_id = t.id "
				+ " where ";
		sql += " t1.user_id="+userId;
		sql += " and t1.type="+type;
		
		return User.dao.find(sql);
	}
	
	/**
	 * 获取用户的数据权限的关联信息
	 * @param userId
	 * @param loginUser
	 * @return
	 */
	public List<UserData> userDatas(int userId, ShiroUser loginUser) {
		User user = findById(userId);
		if(user==null || !loginUser.isOwnerData(user.getStr("deptPath"), user.getId())) {
			return new ArrayList<UserData>();
		}
		
		String sql = "select * from sys_user_data where user_id="+userId ;
		
		return UserData.dao.find(sql);
	}

	/**
	 * 添加用户数据权限
	 * @param userData
	 * @param loginUser
	 * @return
	 */
	public boolean userDataAdd(UserData userData, ShiroUser loginUser) {
		User user = findById(userData.getUserId());
		if(user==null || !loginUser.isOwnerData(user.getStr("deptPath"), user.getId())) {
			throw new BusinessException(BusinessErr.ERR_NO_DATA_AUTH);
		}
		
		return userData.save();
	}

	/**
	 * 删除用户数据权限
	 * @param id
	 * @param loginUser
	 * @return
	 */
	public boolean userDataDelete(int id, ShiroUser loginUser) {
		
		UserData userData = UserData.dao.findById(id);
		
		User user = findById(userData.getUserId());
		if(user==null || !loginUser.isOwnerData(user.getStr("deptPath"), user.getId())) {
			throw new BusinessException(BusinessErr.ERR_NO_DATA_AUTH);
		}
		
		//不能删除查看自己的那条数据权限
		if(userData.getRefId() == id && userData.getUserId() == id && userData.getType() == 1) {
			throw new BusinessException(BusinessErr.ERROR, "不能删除本身的数据权限");
		}
		
		return userData.delete();
	}

	/**
	 * 给指定用户添加角色
	 * @param userId
	 * @param roleId
	 * @param loginUser
	 * @return
	 */
	public boolean userRoleAdd(int userId, int roleId, ShiroUser loginUser) {
		User user = findById(userId);
		if(user==null || !loginUser.isOwnerData(user.getStr("deptPath"), user.getId())) {
			throw new BusinessException(BusinessErr.ERR_NO_DATA_AUTH);
		}
		
		return new UserRole().setUserId(userId).setRoleId(roleId).save();
	}

	/**
	 * 删除用户分配的角色
	 * @param id
	 * @param loginUser
	 * @return
	 */
	public boolean userRoleDelete(int id, ShiroUser loginUser) {
		UserRole userRole = UserRole.dao.findById(id);
		
		User user = findById(userRole.getUserId());
		if(user==null || !loginUser.isOwnerData(user.getStr("deptPath"), user.getId())) {
			throw new BusinessException(BusinessErr.ERR_NO_DATA_AUTH);
		}
		
		return userRole.delete();
	}
	
}
