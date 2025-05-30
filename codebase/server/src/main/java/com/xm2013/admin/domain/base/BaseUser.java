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
public abstract class BaseUser<M extends BaseUser<M>> extends Model<M> implements IBean {

	public static String COL_ID = "id";
	/**
	 * 账号
	 */
	public static String COL_USERNAME = "username";
	/**
	 * 姓名
	 */
	public static String COL_FULLNAME = "fullname";
	/**
	 * 密码
	 */
	public static String COL_PASSWORD = "password";
	/**
	 * 授权码
	 */
	public static String COL_TOKEN = "token";
	/**
	 * 创建时间
	 */
	public static String COL_CREATED = "created";
	/**
	 * 上级id
	 */
	public static String COL_PARENT_ID = "parent_id";
	/**
	 * 唯一码
	 */
	public static String COL_CODE = "code";
	/**
	 * 性别：0-男，1-女，2-保密
	 */
	public static String COL_GENDER = "gender";
	/**
	 * 电子邮件
	 */
	public static String COL_EMAIL = "email";
	/**
	 * 电话
	 */
	public static String COL_PHONE = "phone";
	/**
	 * 照片id
	 */
	public static String COL_PHOTO = "photo";
	/**
	 * 组织id
	 */
	public static String COL_DEPT_ID = "dept_id";
	/**
	 * 状态：0-待审核,1-正常,2-禁用，3-删除
	 */
	public static String COL_STATUS = "status";

	public M setId(java.lang.Integer id) {
		set("id", id);
		return (M)this;
	}
	
	@Col(tableName = "sys_user", tableLabel="用户表", 
		fieldName = "id", colName = "id", 
		label = "")
	public java.lang.Integer getId() {
		return getInt("id");
	}

	/**
	 * 账号
	 */
	public M setUsername(java.lang.String username) {
		set("username", username);
		return (M)this;
	}
	
	/**
	 * 账号
	 */
	@Col(tableName = "sys_user", tableLabel="用户表", 
		fieldName = "username", colName = "username", 
		label = "账号")
	public java.lang.String getUsername() {
		return getStr("username");
	}

	/**
	 * 姓名
	 */
	public M setFullname(java.lang.String fullname) {
		set("fullname", fullname);
		return (M)this;
	}
	
	/**
	 * 姓名
	 */
	@Col(tableName = "sys_user", tableLabel="用户表", 
		fieldName = "fullname", colName = "fullname", 
		label = "姓名")
	public java.lang.String getFullname() {
		return getStr("fullname");
	}

	/**
	 * 密码
	 */
	public M setPassword(java.lang.String password) {
		set("password", password);
		return (M)this;
	}
	
	/**
	 * 密码
	 */
	@Col(tableName = "sys_user", tableLabel="用户表", 
		fieldName = "password", colName = "password", 
		label = "密码")
	public java.lang.String getPassword() {
		return getStr("password");
	}

	/**
	 * 授权码
	 */
	public M setToken(java.lang.String token) {
		set("token", token);
		return (M)this;
	}
	
	/**
	 * 授权码
	 */
	@Col(tableName = "sys_user", tableLabel="用户表", 
		fieldName = "token", colName = "token", 
		label = "授权码")
	public java.lang.String getToken() {
		return getStr("token");
	}

	/**
	 * 创建时间
	 */
	public M setCreated(java.util.Date created) {
		set("created", created);
		return (M)this;
	}
	
	/**
	 * 创建时间
	 */
	@Col(tableName = "sys_user", tableLabel="用户表", 
		fieldName = "created", colName = "created", 
		label = "创建时间")
	public java.util.Date getCreated() {
		return getDate("created");
	}

	/**
	 * 上级id
	 */
	public M setParentId(java.lang.Integer parentId) {
		set("parent_id", parentId);
		return (M)this;
	}
	
	/**
	 * 上级id
	 */
	@Col(tableName = "sys_user", tableLabel="用户表", 
		fieldName = "parentId", colName = "parent_id", 
		label = "上级id")
	public java.lang.Integer getParentId() {
		return getInt("parent_id");
	}

	/**
	 * 唯一码
	 */
	public M setCode(java.lang.String code) {
		set("code", code);
		return (M)this;
	}
	
	/**
	 * 唯一码
	 */
	@Col(tableName = "sys_user", tableLabel="用户表", 
		fieldName = "code", colName = "code", 
		label = "唯一码")
	public java.lang.String getCode() {
		return getStr("code");
	}

	/**
	 * 性别：0-男，1-女，2-保密
	 */
	public M setGender(java.lang.Integer gender) {
		set("gender", gender);
		return (M)this;
	}
	
	/**
	 * 性别：0-男，1-女，2-保密
	 */
	@Col(tableName = "sys_user", tableLabel="用户表", 
		fieldName = "gender", colName = "gender", 
		label = "性别：0-男，1-女，2-保密")
	public java.lang.Integer getGender() {
		return getInt("gender");
	}

	/**
	 * 电子邮件
	 */
	public M setEmail(java.lang.String email) {
		set("email", email);
		return (M)this;
	}
	
	/**
	 * 电子邮件
	 */
	@Col(tableName = "sys_user", tableLabel="用户表", 
		fieldName = "email", colName = "email", 
		label = "电子邮件")
	public java.lang.String getEmail() {
		return getStr("email");
	}

	/**
	 * 电话
	 */
	public M setPhone(java.lang.String phone) {
		set("phone", phone);
		return (M)this;
	}
	
	/**
	 * 电话
	 */
	@Col(tableName = "sys_user", tableLabel="用户表", 
		fieldName = "phone", colName = "phone", 
		label = "电话")
	public java.lang.String getPhone() {
		return getStr("phone");
	}

	/**
	 * 照片id
	 */
	public M setPhoto(java.lang.Integer photo) {
		set("photo", photo);
		return (M)this;
	}
	
	/**
	 * 照片id
	 */
	@Col(tableName = "sys_user", tableLabel="用户表", 
		fieldName = "photo", colName = "photo", 
		label = "照片id")
	public java.lang.Integer getPhoto() {
		return getInt("photo");
	}

	/**
	 * 组织id
	 */
	public M setDeptId(java.lang.Integer deptId) {
		set("dept_id", deptId);
		return (M)this;
	}
	
	/**
	 * 组织id
	 */
	@Col(tableName = "sys_user", tableLabel="用户表", 
		fieldName = "deptId", colName = "dept_id", 
		label = "组织id")
	public java.lang.Integer getDeptId() {
		return getInt("dept_id");
	}

	/**
	 * 状态：0-待审核,1-正常,2-禁用，3-删除
	 */
	public M setStatus(java.lang.Integer status) {
		set("status", status);
		return (M)this;
	}
	
	/**
	 * 状态：0-待审核,1-正常,2-禁用，3-删除
	 */
	@Col(tableName = "sys_user", tableLabel="用户表", 
		fieldName = "status", colName = "status", 
		label = "状态：0-待审核,1-正常,2-禁用，3-删除")
	public java.lang.Integer getStatus() {
		return getInt("status");
	}

}

