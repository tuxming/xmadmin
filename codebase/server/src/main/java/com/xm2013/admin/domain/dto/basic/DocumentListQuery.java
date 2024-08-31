package com.xm2013.admin.domain.dto.basic;

import java.util.ArrayList;
import java.util.List;

import com.xm2013.admin.domain.dto.Query;

public class DocumentListQuery extends Query{
	
	private Integer creater;
	private String type;
	private String name;
	private String remark;
	private List<Integer> ids = new ArrayList<Integer>();
	
	/**
	 * 是否查询总数： 默认查询：
	 */
	private Boolean isTotal = true;
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
	public Boolean getIsTotal() {
		return isTotal;
	}
	public void setIsTotal(Boolean isTotal) {
		this.isTotal = isTotal;
	}
	public List<Integer> getIds() {
		return ids;
	}
	public void setIds(List<Integer> ids) {
		this.ids = ids;
	}
	
}
