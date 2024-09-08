package com.xm2013.admin.domain.base;

import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.IBean;
import com.xm2013.admin.jfinal.generator.Col;

/**
 * Generated by JFinal, do not modify this file.
 */
@SuppressWarnings({"serial", "unchecked"})
public abstract class BaseDept<M extends BaseDept<M>> extends Model<M> implements IBean {

	public static String COL_ID = "id";
	/**
	 * 组织显示名
	 */
	public static String COL_NAME = "name";
	/**
	 * 上级名称
	 */
	public static String COL_PARENT_ID = "parent_id";
	/**
	 * 组织路径
	 */
	public static String COL_PATH = "path";
	/**
	 * 组织名称路径
	 */
	public static String COL_PATH_NAME = "path_name";
	/**
	 * 组织类型：0-个人，1-小组，2-部门，3-公司，4-集团
	 */
	public static String COL_TYPE = "type";

	public M setId(java.lang.Integer id) {
		set("id", id);
		return (M)this;
	}
	
	@Col(tableName = "sys_dept", tableLabel="组织结构", 
		fieldName = "id", colName = "id", 
		label = "")
	public java.lang.Integer getId() {
		return getInt("id");
	}

	/**
	 * 组织显示名
	 */
	public M setName(java.lang.String name) {
		set("name", name);
		return (M)this;
	}
	
	/**
	 * 组织显示名
	 */
	@Col(tableName = "sys_dept", tableLabel="组织结构", 
		fieldName = "name", colName = "name", 
		label = "组织显示名")
	public java.lang.String getName() {
		return getStr("name");
	}

	/**
	 * 上级名称
	 */
	public M setParentId(java.lang.Integer parentId) {
		set("parent_id", parentId);
		return (M)this;
	}
	
	/**
	 * 上级名称
	 */
	@Col(tableName = "sys_dept", tableLabel="组织结构", 
		fieldName = "parentId", colName = "parent_id", 
		label = "上级名称")
	public java.lang.Integer getParentId() {
		return getInt("parent_id");
	}

	/**
	 * 组织路径
	 */
	public M setPath(java.lang.String path) {
		set("path", path);
		return (M)this;
	}
	
	/**
	 * 组织路径
	 */
	@Col(tableName = "sys_dept", tableLabel="组织结构", 
		fieldName = "path", colName = "path", 
		label = "组织路径")
	public java.lang.String getPath() {
		return getStr("path");
	}

	/**
	 * 组织名称路径
	 */
	public M setPathName(java.lang.String pathName) {
		set("path_name", pathName);
		return (M)this;
	}
	
	/**
	 * 组织名称路径
	 */
	@Col(tableName = "sys_dept", tableLabel="组织结构", 
		fieldName = "pathName", colName = "path_name", 
		label = "组织名称路径")
	public java.lang.String getPathName() {
		return getStr("path_name");
	}

	/**
	 * 组织类型：0-个人，1-小组，2-部门，3-公司，4-集团
	 */
	public M setType(java.lang.Integer type) {
		set("type", type);
		return (M)this;
	}
	
	/**
	 * 组织类型：0-个人，1-小组，2-部门，3-公司，4-集团
	 */
	@Col(tableName = "sys_dept", tableLabel="组织结构", 
		fieldName = "type", colName = "type", 
		label = "组织类型：0-个人，1-小组，2-部门，3-公司，4-集团")
	public java.lang.Integer getType() {
		return getInt("type");
	}

}

