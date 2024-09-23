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

package com.xm2013.admin.shiro.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.jfinal.aop.Aop;
import com.jfinal.kit.JsonKit;
import com.xm2013.admin.basic.service.UserService;
import com.xm2013.admin.common.Kit;
import com.xm2013.admin.domain.model.Role;

public class ShiroUser implements java.io.Serializable{
	/**
	 * 
	 */
	private static final long serialVersionUID = 8663596172390449440L;
	private int id;
	private String username;
	private String fullname;
	private int parentId;
	private String code;
	private int gender;
	private String email;
	private String phone;
	private int photo;
	
	private List<ShiroRole> roles = new ArrayList<ShiroRole>();
	private ShiroDept dept;
	private ShiroDept company;
	private ShiroDept group;
	private List<String> permissions;
	
	//以下都是数据权限的设置
	private List<ShiroUserData> userDatas;
	//能查看的用户
	private List<Integer> userIds;
	//能查看的组织
	private List<Integer> deptIds;
	
	private List<String> datapaths;
	
	/**
	 * 是否系统管理员
	 * @return
	 */
	public boolean isSys() {
		if(roles == null || roles.isEmpty()) return false;
		for (ShiroRole role : roles) {
			if(role.getType() == Role.TYPE_SYSTEM) {
				return true;
			}
		}
		return false;
	}
	
	/**
	 * 是否管理员
	 * @return
	 */
	public boolean isAdmin() {
		if(roles == null || roles.isEmpty()) return false;
		for (ShiroRole role : roles) {
			if(role.getType() <= Role.TYPE_ADMIN) {
				return true;
			}
		}
		return false;
	}
	
	/**
	 * 判断是否具有数据权限，如果是管理员，直接拥有数据权限，
	 * 如果不是管理员，则判断是否具备数据权限
	 * @param deptpath
	 * @param userId
	 * @return
	 */
	@JsonIgnore
	public boolean isOwnerData(String deptpath, Integer userId) {
		
		if(isAdmin()) {
			return true;
		}
		
		if(userId!=null) {
			if(isOwnerData(userId)) {
				return true;
			}else {
				if(Kit.isNull(deptpath)) {
					return isOwnerData(Aop.get(UserService.class).findById(userId).getStr("deptPath"));
				}
			}
		}
		
		if(Kit.isNotNull(deptpath)) {
			return isOwnerData(deptpath);
		}
		
		return false;
	}
	
	/**
	 * 构建数据过滤的查询条件，
	 * @param alias user表的别名
	 * @return
	 */
	public String buildAuthCondition(String alias) {
		
		if(isAdmin())
			return " 1=1 ";

		if(Kit.isNotNull(alias)) {
			if(!alias.endsWith(".")) {
				alias = alias+".";
			}
		}else {
			alias = "";
		}
		
		if(userIds!= null && !userIds.isEmpty()) {
			if(deptIds!=null && !deptIds.isEmpty()) {
				return "("+alias+" id in ("
								+userIds.stream().map(s-> s+"").collect(Collectors.joining(","))
							+") "
							+ "or "+alias+"dept_id in ("
								+deptIds.stream().map(s-> s+"").collect(Collectors.joining(","))
							+ ")) " ;
			}else {
				return alias+" id in ("+userIds.stream().map(s-> s+"").collect(Collectors.joining(","))+") ";
			}
		}else {
			if(deptIds!=null && !deptIds.isEmpty()) {
				return alias+"dept_id in ("+deptIds.stream().map(s-> s+"").collect(Collectors.joining(","))+") " ;
			}else {
				return alias+" id="+id;
			}
		}
		
	}
	
	private boolean isOwnerData(Integer userId) {
		
		if(isAdmin() || userId == id) return true;
		
		if(userId == null || userId == 0)
			return false;
		
		if(userIds!=null && userIds.contains(userId.intValue())) {
			return true;
		}
		return false;
//		else {
//			String deptPath = Aop.get(UserService.class).findById(userId).getDeptPath();
//			return isOwnerData(deptPath);
//		}
	}
	
	public boolean isOwnerData(String deptpath) {
		
		if(isAdmin()) return true;
		
		if(Kit.isNull(deptpath)) {
			return false;
		}
		
		if(datapaths == null || datapaths.size() == 0) {
			return false;
		}
		
		for (String datapath : datapaths) {
			if(deptpath.startsWith(datapath)) {
				return true;
			}
		}
		return false;
	}
	
	public Integer getId() {
		return id;
	}
	public ShiroUser setId(Integer id) {
		this.id = id;
		return this;
	}
	public String getUsername() {
		return username;
	}
	public ShiroUser setUsername(String username) {
		this.username = username;
		return this;
	}
	public String getFullname() {
		return fullname;
	}
	public ShiroUser setFullname(String fullname) {
		this.fullname = fullname;
		return this;
	}
	public int getParentId() {
		return parentId;
	}
	public ShiroUser setParentId(int parentId) {
		this.parentId = parentId;
		return this;
	}
	public String getCode() {
		return code;
	}
	public ShiroUser setCode(String code) {
		this.code = code;
		return this;
	}
	public int getGender() {
		return gender;
	}
	public ShiroUser setGender(int gender) {
		this.gender = gender;
		return this;
	}
	public String getEmail() {
		return email;
	}
	public ShiroUser setEmail(String email) {
		this.email = email;
		return this;
	}
	public String getPhone() {
		return phone;
	}
	public ShiroUser setPhone(String phone) {
		this.phone = phone;
		return this;
	}
	public int getPhoto() {
		return photo;
	}
	public ShiroUser setPhoto(int photo) {
		this.photo = photo;
		return this;
	}
	public List<ShiroRole> getRoles() {
		return roles;
	}
	public ShiroUser setRoles(List<ShiroRole> roles) {
		this.roles = roles;
		return this;
	}
	public ShiroDept getDept() {
		return dept;
	}
	public ShiroUser setDept(ShiroDept dept) {
		this.dept = dept;
		return this;
	}
	public ShiroDept getCompany() {
		return company;
	}
	public ShiroUser setCompany(ShiroDept company) {
		this.company = company;
		return this;
	}
	public ShiroDept getGroup() {
		return group;
	}
	public ShiroUser setGroup(ShiroDept group) {
		this.group = group;
		return this;
	}
	public List<String> getPermissions() {
		return permissions;
	}
	public ShiroUser setPermissions(List<String> permissions) {
		this.permissions = permissions;
		return this;
	}
	public ShiroUser setId(int id) {
		this.id = id;
		return this;
	}
	
	
	public List<ShiroUserData> getUserDatas() {
		return userDatas;
	}

	public void setUserDatas(List<ShiroUserData> userDatas) {
		this.userDatas = userDatas;
	}

	@JsonIgnore
	public List<Integer> getUserIds() {
		return userIds;
	}
	@JsonIgnore
	public void setUserIds(List<Integer> userIds) {
		this.userIds = userIds;
	}
	@JsonIgnore
	public List<Integer> getDeptIds() {
		return deptIds;
	}
	@JsonIgnore
	public void setDeptIds(List<Integer> deptIds) {
		this.deptIds = deptIds;
	}

	@JsonIgnore
	public void setDatapaths(List<String> datapaths) {
		this.datapaths = datapaths;
	}

	@Override
	public String toString() {
		return JsonKit.toJson(this);
	}
	@Override
	public int hashCode() {
		return Objects.hash(id, username);
	}
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		ShiroUser other = (ShiroUser) obj;
		return id == other.id && Objects.equals(username, other.username);
	}
}
