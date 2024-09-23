/*
 * MIT License
 *
 * Copyright (c) 2023 tuxming@sina.com / wechat: angft1
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *//*
 * MIT License
 *
 * Copyright (c) 2023 tuxming@sina.com / wechat: angft1
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */package com.xm2013.admin.domain.base;

import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.IBean;
import com.xm2013.admin.jfinal.generator.Col;

/**
 * Generated by JFinal, do not modify this file.
 */
@SuppressWarnings({"serial", "unchecked"})
public abstract class BaseRolePermission<M extends BaseRolePermission<M>> extends Model<M> implements IBean {

	public static String COL_ID = "id";
	/**
	 * 权限id
	 */
	public static String COL_PERMISSION_ID = "permission_id";
	/**
	 * 角色id
	 */
	public static String COL_ROLE_ID = "role_id";

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

