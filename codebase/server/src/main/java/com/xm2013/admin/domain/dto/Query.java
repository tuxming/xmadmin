package com.xm2013.admin.domain.dto;

/**
 * 查询条件
 */
public class Query {
	
	private Integer start = 0;
	private Integer length = 20;
	private String startDate;
	private String endDate;
	private String basicValue;  //这个是泛查询用于查询自己想要查询的任意字段，针对只有一个查询条件的数据
	public Integer getStart() {
		return start == null ? 0 : start;
	}
	public void setStart(Integer start) {
		this.start = start;
	}
	public Integer getLength() {
		return length == null ? 20 : length;
	}
	public void setLength(Integer length) {
		this.length = length;
	}
	public String getStartDate() {
		return startDate;
	}
	public void setStartDate(String startDate) {
		this.startDate = startDate;
	}
	public String getEndDate() {
		return endDate;
	}
	public void setEndDate(String endDate) {
		this.endDate = endDate;
	}
	public String getBasicValue() {
		return basicValue;
	}
	public void setBasicValue(String basicValue) {
		this.basicValue = basicValue;
	}
	
}
