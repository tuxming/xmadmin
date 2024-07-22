package com.xm2013.admin.shiro.dto;

import java.io.Serializable;
import java.util.Objects;

import com.jfinal.kit.JsonKit;

/**
 * 角色
 */
public class ShiroRole implements Serializable{

	/**
	 * 
	 */
	private static final long serialVersionUID = -3075097834580431497L;

	private Integer id;
	private String name;
	private String code;
	private Integer type;
	public ShiroRole() {}
	public ShiroRole(Integer id, String name, Integer type) {
		super();
		this.id = id;
		this.name = name;
		this.type = type;
	}
	public Integer getId() {
		return id;
	}
	public ShiroRole setId(Integer id) {
		this.id = id;
		return this;
	}
	public String getName() {
		return name;
	}
	public ShiroRole setName(String name) {
		this.name = name;
		return this;
	}
	public Integer getType() {
		return type;
	}
	public ShiroRole setType(Integer type) {
		this.type = type;
		return this;
	}
	
	public String getCode() {
		return code;
	}
	public void setCode(String code) {
		this.code = code;
	}
	@Override
	public String toString() {
		return JsonKit.toJson(this);
	}
	@Override
	public int hashCode() {
		return Objects.hash(code, id, name, type);
	}
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		ShiroRole other = (ShiroRole) obj;
		return Objects.equals(code, other.code) && Objects.equals(id, other.id) && Objects.equals(name, other.name)
				&& Objects.equals(type, other.type);
	}
	
}
