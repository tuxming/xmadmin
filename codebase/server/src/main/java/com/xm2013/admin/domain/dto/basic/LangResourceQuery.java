package com.xm2013.admin.domain.dto.basic;

import com.xm2013.admin.domain.dto.Query;

public class LangResourceQuery extends Query{
	private String key;
	private String value;
	private String groupName;
	private Integer langId=1;
	public String getKey() {
		return key;
	}
	public void setKey(String key) {
		this.key = key;
	}
	public String getValue() {
		return value;
	}
	public void setValue(String value) {
		this.value = value;
	}
	public String getGroupName() {
		return groupName;
	}
	public void setGroupName(String groupName) {
		this.groupName = groupName;
	}
	public Integer getLangId() {
		return langId;
	}
	public void setLangId(Integer langId) {
		this.langId = langId;
	}
}
