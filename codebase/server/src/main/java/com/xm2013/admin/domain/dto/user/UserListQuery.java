package com.xm2013.admin.domain.dto.user;

import java.util.List;
import java.util.Set;

import com.xm2013.admin.domain.dto.Query;

public class UserListQuery extends Query{
	
	private String username;
	private String userId;
	private String fullname;
	private List<Integer> roleIds;
	private Integer deptId;
	private String email;
	private String phone;
	private Set<Integer> status;
	
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	public String getFullname() {
		return fullname;
	}
	public void setFullname(String fullname) {
		this.fullname = fullname;
	}
	public List<Integer> getRoleIds() {
		return roleIds;
	}
	public void setRoleIds(List<Integer> roleIds) {
		this.roleIds = roleIds;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getPhone() {
		return phone;
	}
	public void setPhone(String phone) {
		this.phone = phone;
	}
	public Integer getDeptId() {
		return deptId;
	}
	public void setDeptId(Integer deptId) {
		this.deptId = deptId;
	}
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}
	public Set<Integer> getStatus() {
		return status;
	}
	public void setStatus(Set<Integer> status) {
		this.status = status;
	}
}
