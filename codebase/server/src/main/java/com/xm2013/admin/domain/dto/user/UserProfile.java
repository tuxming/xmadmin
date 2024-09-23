/*
 * MIT License
 *
 * Copyright (c) 2024 tuxming@sina.com / wechat: angft1
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
 */

package com.xm2013.admin.domain.dto.user;

import java.util.Date;

import com.xm2013.admin.common.kits.JsonKit;

public class UserProfile {
	
	private Integer id;
	private String code;
	private String username;
	private Date created;
	private String fullname;
	private Integer gender;
	private Integer status;
	private String email;
	private String phone;
	private String token;
	private Integer photo;
	
	private Integer deptId;
	private String deptName;
	private String deptPath;
	private String deptPathName;
	public Integer getId() {
		return id;
	}
	public UserProfile setId(Integer id) {
		this.id = id;
		return this;
	}
	public String getCode() {
		return code;
	}
	public UserProfile setCode(String code) {
		this.code = code;
		return this;
	}
	public String getUsername() {
		return username;
	}
	public UserProfile setUsername(String username) {
		this.username = username;
		return this;
	}
	public Date getCreated() {
		return created;
	}
	public UserProfile setCreated(Date created) {
		this.created = created;
		return this;
	}
	public String getFullname() {
		return fullname;
	}
	public UserProfile setFullname(String fullname) {
		this.fullname = fullname;
		return this;
	}
	public Integer getGender() {
		return gender;
	}
	public UserProfile setGender(Integer gender) {
		this.gender = gender;
		return this;
	}
	public Integer getStatus() {
		return status;
	}
	public UserProfile setStatus(Integer status) {
		this.status = status;
		return this;
	}
	public Integer getDeptId() {
		return deptId;
	}
	public UserProfile setDeptId(Integer deptId) {
		this.deptId = deptId;
		return this;
	}
	public String getEmail() {
		return email;
	}
	public UserProfile setEmail(String email) {
		this.email = email;
		return this;
	}
	public String getPhone() {
		return phone;
	}
	public UserProfile setPhone(String phone) {
		this.phone = phone;
		return this;
	}
	public String getToken() {
		return token;
	}
	public UserProfile setToken(String token) {
		this.token = token;
		return this;
	}
	public Integer getPhoto() {
		return photo;
	}
	public UserProfile setPhoto(Integer photo) {
		this.photo = photo;
		return this;
	}
	public String getDeptName() {
		return deptName;
	}
	public UserProfile setDeptName(String deptName) {
		this.deptName = deptName;
		return this;
	}
	public String getDeptPath() {
		return deptPath;
	}
	public UserProfile setDeptPath(String deptPath) {
		this.deptPath = deptPath;
		return this;
	}
	public String getDeptPathName() {
		return deptPathName;
	}
	public UserProfile setDeptPathName(String deptPathName) {
		this.deptPathName = deptPathName;
		return this;
	}
	
	public String toString() {
		return JsonKit.toJson(this);
	}
	
}
