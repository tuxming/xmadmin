package com.xm2013.admin.domain.dto.basic;

import java.util.List;

import com.xm2013.admin.domain.dto.Query;

public class HistoryQuery extends Query{
	public String ipAddr;
	private Integer userId;
	private List<String> types;
	private String remark;
	public String getIpAddr() {
		return ipAddr;
	}
	public void setIpAddr(String ipAddr) {
		this.ipAddr = ipAddr;
	}
	public Integer getUserId() {
		return userId;
	}
	public void setUserId(Integer userId) {
		this.userId = userId;
	}
	public List<String> getTypes() {
		return types;
	}
	public void setTypes(List<String> types) {
		this.types = types;
	}
	public String getRemark() {
		return remark;
	}
	public void setRemark(String remark) {
		this.remark = remark;
	}
}
