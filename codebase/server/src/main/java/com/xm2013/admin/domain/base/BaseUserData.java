package com.xm2013.admin.domain.base;

import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.IBean;
import com.xm2013.admin.jfinal.generator.Col;

/**
 * Generated by JFinal, do not modify this file.
 */
@SuppressWarnings({"serial", "unchecked"})
public abstract class BaseUserData<M extends BaseUserData<M>> extends Model<M> implements IBean {

	public static String COL_ID = "id";
	public static String COL_USER_ID = "user_id";
	public static String COL_REF_ID = "ref_id";
	public static String COL_TYPE = "type";

	public M setId(java.lang.Integer id) {
		set("id", id);
		return (M)this;
	}
	
	@Col(tableName = "sys_user_data", tableLabel="数据权限	", 
		fieldName = "id", colName = "id", 
		label = "")
	public java.lang.Integer getId() {
		return getInt("id");
	}

	/**
	 * 用户id
	 */
	public M setUserId(java.lang.Integer userId) {
		set("user_id", userId);
		return (M)this;
	}
	
	/**
	 * 用户id
	 */
	@Col(tableName = "sys_user_data", tableLabel="数据权限	", 
		fieldName = "userId", colName = "user_id", 
		label = "用户id")
	public java.lang.Integer getUserId() {
		return getInt("user_id");
	}

	/**
	 * 引用id: type=1, 为用户id, 2-为组织id
	 */
	public M setRefId(java.lang.Integer refId) {
		set("ref_id", refId);
		return (M)this;
	}
	
	/**
	 * 引用id: type=1, 为用户id, 2-为组织id
	 */
	@Col(tableName = "sys_user_data", tableLabel="数据权限	", 
		fieldName = "refId", colName = "ref_id", 
		label = "引用id: type=1, 为用户id, 2-为组织id")
	public java.lang.Integer getRefId() {
		return getInt("ref_id");
	}

	/**
	 * 数据权限类型： 1-具体的用户id, 2-组织节点的id
	 */
	public M setType(java.lang.Integer type) {
		set("type", type);
		return (M)this;
	}
	
	/**
	 * 数据权限类型： 1-具体的用户id, 2-组织节点的id
	 */
	@Col(tableName = "sys_user_data", tableLabel="数据权限	", 
		fieldName = "type", colName = "type", 
		label = "数据权限类型： 1-具体的用户id, 2-组织节点的id")
	public java.lang.Integer getType() {
		return getInt("type");
	}

}

