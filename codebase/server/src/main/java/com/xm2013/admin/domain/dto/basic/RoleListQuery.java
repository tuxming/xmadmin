package com.xm2013.admin.domain.dto.basic;

import java.util.List;

import com.xm2013.admin.domain.dto.Query;

public class RoleListQuery extends Query {
	
	private String name;
	private String code;
	private List<Integer> types;
	private List<Integer> creaters;
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getCode() {
		return code;
	}
	public void setCode(String code) {
		this.code = code;
	}
	public List<Integer> getTypes() {
		return types;
	}
	public void setTypes(List<Integer> types) {
		this.types = types;
	}
	public List<Integer> getCreaters() {
		return creaters;
	}
	public void setCreaters(List<Integer> creaters) {
		this.creaters = creaters;
	}
}
