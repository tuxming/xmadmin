package com.xm2013.admin.basic.service;

import java.util.List;

import com.xm2013.admin.common.Kit;
import com.xm2013.admin.common.SqlKit;
import com.xm2013.admin.domain.model.Role;
import com.xm2013.admin.shiro.dto.ShiroUser;

public class RoleService {
	
	/**
	 * 根据用户id查找角色
	 * @param userId
	 * @return
	 */
	public List<Role> findByUser(int userId){
		
		List<Role> roles = Role.dao.find("select t.* from sys_role as t "
				+ " left join sys_user_role as t1 on t1.role_id=t.id "
				+ " where t1.user_id=?", userId);
		
		return roles;
	}

	public List<Role> search(String key, ShiroUser user) {
		
		key = SqlKit.getSafeValue(key);
		
		String sql = "select * from sys_role where 1=1 and (role_name like '%"+key+"%' or code like '%"+key+"%')";
		if(!user.isAdmin()) {
			if(Kit.isNotNull(user.getUsers())) {
				sql += " and creater in ("+user.getUsers()+")";
			}else {
				sql += " and creater="+user.getId();
			}
		}
		
		List<Role> roles = Role.dao.find(sql);
		
		return roles;
	}
	
}
