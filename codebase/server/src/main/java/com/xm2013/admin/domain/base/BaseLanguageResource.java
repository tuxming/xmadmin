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
public abstract class BaseLanguageResource<M extends BaseLanguageResource<M>> extends Model<M> implements IBean {

	public static String COL_ID = "id";
	/**
	 * 所属语言
	 */
	public static String COL_LANGUAGE_ID = "language_id";
	/**
	 * 所属分类
	 */
	public static String COL_CATEGORY = "category";
	/**
	 * key值
	 */
	public static String COL_RES_KEY = "res_key";
	/**
	 * 翻译后的文本
	 */
	public static String COL_RES_VALUE = "res_value";

	public M setId(java.lang.Integer id) {
		set("id", id);
		return (M)this;
	}
	
	@Col(tableName = "sys_language_resource", tableLabel="语言资源", 
		fieldName = "id", colName = "id", 
		label = "")
	public java.lang.Integer getId() {
		return getInt("id");
	}

	/**
	 * 所属语言
	 */
	public M setLanguageId(java.lang.Integer languageId) {
		set("language_id", languageId);
		return (M)this;
	}
	
	/**
	 * 所属语言
	 */
	@Col(tableName = "sys_language_resource", tableLabel="语言资源", 
		fieldName = "languageId", colName = "language_id", 
		label = "所属语言")
	public java.lang.Integer getLanguageId() {
		return getInt("language_id");
	}

	/**
	 * 所属分类
	 */
	public M setCategory(java.lang.String category) {
		set("category", category);
		return (M)this;
	}
	
	/**
	 * 所属分类
	 */
	@Col(tableName = "sys_language_resource", tableLabel="语言资源", 
		fieldName = "category", colName = "category", 
		label = "所属分类")
	public java.lang.String getCategory() {
		return getStr("category");
	}

	/**
	 * key值
	 */
	public M setResKey(java.lang.String resKey) {
		set("res_key", resKey);
		return (M)this;
	}
	
	/**
	 * key值
	 */
	@Col(tableName = "sys_language_resource", tableLabel="语言资源", 
		fieldName = "resKey", colName = "res_key", 
		label = "key值")
	public java.lang.String getResKey() {
		return getStr("res_key");
	}

	/**
	 * 翻译后的文本
	 */
	public M setResValue(java.lang.String resValue) {
		set("res_value", resValue);
		return (M)this;
	}
	
	/**
	 * 翻译后的文本
	 */
	@Col(tableName = "sys_language_resource", tableLabel="语言资源", 
		fieldName = "resValue", colName = "res_value", 
		label = "翻译后的文本")
	public java.lang.String getResValue() {
		return getStr("res_value");
	}

}

