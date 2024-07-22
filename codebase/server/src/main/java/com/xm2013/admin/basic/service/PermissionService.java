package com.xm2013.admin.basic.service;

import java.util.List;

import com.xm2013.admin.domain.model.Permission;

public class PermissionService {
	
	/**
	 * 根据角色id查找权限
	 * @param roleIds = 1,2,3,4
	 * @return
	 */
	public List<Permission> findByRole(String roleIds){
		return Permission.dao.find("select t.* from sys_permission as t "
				+ " left join sys_role_permission as t1 on t1.permission_id = t.id "
				+ " where t1.role_id in (?) ", roleIds);
	}
}
