package com.xm2013.admin.shiro.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import com.jfinal.kit.JsonKit;
import com.jfinal.plugin.activerecord.Db;
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
	private String users; //所能查看的所有的用户id
	
	private List<ShiroRole> roles = new ArrayList<ShiroRole>();
	private ShiroDept dept;
	private ShiroDept company;
	private ShiroDept group;
	private List<String> permissions;
	private List<String> dataPath = new ArrayList<>();
	
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
	
	public boolean isOwnerData(String deptpath) {
		if(Kit.isNull(deptpath)) {
			return false;
		}
		
		if(dataPath == null || dataPath.size() ==0 ) {
			return deptpath.startsWith(dept.getPath());
		}else {
			for (String dp : dataPath) {	
				if(deptpath.startsWith(dp)) return true;
			}
			return false;
		}
	}
	
	public boolean isOwnerData(Integer userId) {
		
		if(userId == null || userId == 0) return false;
		
		if(users==null) {
			if(dataPath == null || dataPath.size() ==0 ) {
				String path = Db.queryStr("select dept_path from sys_user where user_id=?", userId);
				if(path == null) return false;
				
				return path.startsWith(dept.getPath());
			}else {
				String path = Db.queryStr("select dept_path from sys_user where user_id=?", userId);
				if(path == null) return false;
				
				for (String dp : dataPath) {	
					if(path.startsWith(dp)) return true;
				}
				return false;
			}
		}else {
			if(users.contains(","+userId+",")) {
				return true;
			}else if(users.startsWith(userId+",")) {
				return true;
			}else if(users.endsWith(","+userId)) {
				return true;
			}else {
				return false;
			}
		}
		
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
	public List<String> getDataPath() {
		return dataPath;
	}

	public ShiroUser setDataPath(List<String> dataPath) {
		this.dataPath = dataPath;
		return this;
	}
	
	public String getUsers() {
		return users;
	}

	public void setUsers(String users) {
		this.users = users;
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
