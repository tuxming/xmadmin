package com.xm2013.admin.domain.base;

import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.IBean;
import com.xm2013.admin.jfinal.generator.Col;

/**
 * Generated by JFinal, do not modify this file.
 */
@SuppressWarnings({"serial", "unchecked"})
public abstract class BaseRolePermission<M extends BaseRolePermission<M>> extends Model<M> implements IBean {

	public M setId(java.lang.Integer id) {
		set("id", id);
		return (M)this;
	}
	
	@Col(tableName = "sys_role_permission", tableLabel="角色权限表", 
		fieldName = "id", colName = "id", 
		label = "")
	public java.lang.Integer getId() {
		return getInt("id");
	}

	/**
	 * 权限id
	 */
	public M setPermissionId(java.lang.Integer permissionId) {
		set("permission_id", permissionId);
		return (M)this;
	}
	
	/**
	 * 权限id
	 */
	@Col(tableName = "sys_role_permission", tableLabel="角色权限表", 
		fieldName = "permissionId", colName = "permission_id", 
		label = "权限id")
	public java.lang.Integer getPermissionId() {
		return getInt("permission_id");
	}

	/**
	 * 角色id
	 */
	public M setRoleId(java.lang.Integer roleId) {
		set("role_id", roleId);
		return (M)this;
	}
	
	/**
	 * 角色id
	 */
	@Col(tableName = "sys_role_permission", tableLabel="角色权限表", 
		fieldName = "roleId", colName = "role_id", 
		label = "角色id")
	public java.lang.Integer getRoleId() {
		return getInt("role_id");
	}

}

