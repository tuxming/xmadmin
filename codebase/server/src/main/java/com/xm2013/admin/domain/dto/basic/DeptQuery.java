package com.xm2013.admin.domain.dto.basic;

import com.xm2013.admin.domain.dto.Query;

public class DeptQuery extends Query{
	private Integer parentId;
	
	public Integer getParentId() {
		return parentId;
	}
	public void setParentId(Integer parentId) {
		this.parentId = parentId;
	}
	
}
