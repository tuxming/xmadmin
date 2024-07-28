package com.xm2013.admin.domain.dto.basic;

import com.xm2013.admin.domain.dto.Query;

public class DocumentListQuery extends Query{
	
	private Integer creater;
	private String type;
	private String name;
	private String remark;
	public Integer getCreater() {
		return creater;
	}
	public void setCreater(Integer creater) {
		this.creater = creater;
	}
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getRemark() {
		return remark;
	}
	public void setRemark(String remark) {
		this.remark = remark;
	}

}
