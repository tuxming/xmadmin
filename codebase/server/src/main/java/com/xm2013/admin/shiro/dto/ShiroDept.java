package com.xm2013.admin.shiro.dto;

import java.io.Serializable;
import java.util.Objects;

import com.jfinal.kit.JsonKit;

public class ShiroDept implements Serializable{
	/**
	 * 
	 */
	private static final long serialVersionUID = 6003047951795757864L;
	private int id;
	private int type;
	private String name;
	private String path;
	private String fullname;
	public ShiroDept() {};
	public ShiroDept(int id, int type, String name, String path, String fullname) {
		super();
		this.id = id;
		this.type = type;
		this.name = name;
		this.path = path;
		this.fullname = fullname;
	}
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getPath() {
		return path;
	}
	public void setPath(String path) {
		this.path = path;
	}
	public int getType() {
		return type;
	}
	public void setType(int type) {
		this.type = type;
	}
	public String getFullname() {
		return fullname;
	}
	public void setFullname(String fullname) {
		this.fullname = fullname;
	}
	@Override
	public int hashCode() {
		return Objects.hash(id, name, path);
	}
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		ShiroDept other = (ShiroDept) obj;
		return id == other.id && Objects.equals(name, other.name) && Objects.equals(path, other.path);
	}
	@Override
	public String toString() {
		return JsonKit.toJson(this);
	}
	
}
