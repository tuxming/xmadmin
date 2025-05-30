/*
 * MIT License
 *
 * Copyright (c) 2023 tuxming@sina.com / wechat: angft1
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *//*
 * MIT License
 *
 * Copyright (c) 2023 tuxming@sina.com / wechat: angft1
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */package com.xm2013.admin.domain.base;

import com.jfinal.plugin.activerecord.Model;
import com.jfinal.plugin.activerecord.IBean;
import com.xm2013.admin.jfinal.generator.Col;

/**
 * Generated by JFinal, do not modify this file.
 */
@SuppressWarnings({"serial", "unchecked"})
public abstract class BaseDictGroup<M extends BaseDictGroup<M>> extends Model<M> implements IBean {

	/**
	 * 字典值
	 */
	public static String COL_CODE = "code";
	/**
	 * 显示名
	 */
	public static String COL_LABEL = "label";
	/**
	 * 字典分类说明
	 */
	public static String COL_REMARK = "remark";

	/**
	 * 字典值
	 */
	public M setCode(java.lang.String code) {
		set("code", code);
		return (M)this;
	}
	
	/**
	 * 字典值
	 */
	@Col(tableName = "sys_dict_group", tableLabel="字典分类表", 
		fieldName = "code", colName = "code", 
		label = "字典值")
	public java.lang.String getCode() {
		return getStr("code");
	}

	/**
	 * 显示名
	 */
	public M setLabel(java.lang.String label) {
		set("label", label);
		return (M)this;
	}
	
	/**
	 * 显示名
	 */
	@Col(tableName = "sys_dict_group", tableLabel="字典分类表", 
		fieldName = "label", colName = "label", 
		label = "显示名")
	public java.lang.String getLabel() {
		return getStr("label");
	}

	/**
	 * 字典分类说明
	 */
	public M setRemark(java.lang.String remark) {
		set("remark", remark);
		return (M)this;
	}
	
	/**
	 * 字典分类说明
	 */
	@Col(tableName = "sys_dict_group", tableLabel="字典分类表", 
		fieldName = "remark", colName = "remark", 
		label = "字典分类说明")
	public java.lang.String getRemark() {
		return getStr("remark");
	}

}

