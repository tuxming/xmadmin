/*
 * MIT License
 *
 * Copyright (c) 2024 tuxming@sina.com / wechat: angft1
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
 */

package com.xm2013.admin.common;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;


/**
 * sql查询条件拼接的工具类，简化操作，做安全防护
 */
public class SqlKit {
	public static String getSafeValue(String value) {
		if(Kit.isNull(value)) return "";
		
//		value = value.trim().replace("'", "\\'");
		value = value.replace("'", "\\'").replace("--", "\\-\\-").replace(";", "");
		if(Kit.isNull(value)) return "";
		
		return value;
	}
	
	/**
	 * 构建 sql的 字符串类型的 等于条件
	 * @param column
	 * @param value
	 * @return
	 */
	public static String eq(String column, String value) {
		value = getSafeValue(value);
		
		if(Kit.isNull(value)) return "";
		
		return " and "+column+"='"+value+"' ";
	}
	
	/**
	 * 构建 sql的 数字类型的 等于条件
	 * @param column
	 * @param value
	 * @return
	 */
	public static String eq(String column, Number value) {
		
		if(value == null) return "";
		
		return " and "+column+"="+value+" ";
	}
	
	/**
	 * 构建sql 的in条件，List<String> values，
	 * @author tuxming
	 * @date 2021年5月30日
	 */
	public static String in(String column, Collection<String> values) {
		
		if(values==null || values.size()==0) return "";
		
		String idsStr = values.stream()
				.filter(v -> Kit.isNotNull(v))
				.map(v -> "'"+getSafeValue(v)+"'")
				.collect(Collectors.joining(","));
		return " and "+column+" in ("+idsStr+") ";
	}
	
	/**
	 * 构建sql 的in条件，List<Number> values
	 * @author tuxming
	 * @date 2021年5月30日
	 */
	public static String inNo(String column, Collection<? extends Number> values) {
		
		if(values==null || values.size()==0) return "";
		if(values.size() == 1) {
			return " and "+column+"="+values.iterator().next()+" ";
		}
		
		String idsStr = values.stream()
				.filter(v -> v!=null)
				.map(v -> v+"")
				.collect(Collectors.joining(","));
		return " and "+column+" in ("+idsStr+") ";
	}
	
	/**
	 * 构建sql 的not in条件，List<Number> values
	 * @author tuxming
	 * @date 2021年5月30日
	 */
	public static String notInNo(String column, Collection<? extends Number> values) {
		
		if(values==null || values.size()==0) return "";
		if(values.size() == 1) {
			return " and "+column+"!="+values.iterator().next()+" ";
		}
		
		String idsStr = values.stream()
				.filter(v -> v!=null)
				.map(v -> v+"")
				.collect(Collectors.joining(","));
		return " and "+column+" not in ("+idsStr+") ";
	}
	
	/**
	 * 构建sql 的like条件, 左包含
	 * @return
	 */
	public static String likeLeft(String col, String value) {
		
		if(Kit.isNull(value)) return "";
		
		return " and " + col + " like '"+getSafeValue(value)+"%' ";
	}
	
	/**
	 * 构建sql 的like条件, 全包含
	 * @return
	 */
	public static String like(String col, String value) {
		if(Kit.isNull(value)) return "";
		
		return " and " + col + " like '%"+getSafeValue(value)+"%' ";
	}
	
	/**
	 * 构建sql 的like条件, 多值包含
	 * @param col
	 * @return
	 */
	public static String likes(String col, List<String> values) {
		if(values == null || values.size()==0) return "";
		
		if(values.size()==1) {
			return " and "+ col + " like '"+getSafeValue(values.get(0))+"%' ";
		}
		
		String str = values.stream()
				.filter(v -> Kit.isNotNull(v))
				.collect(Collectors.joining("|"));
		return " and " + col + "regexp '"+str+"' ";
	}
	
	/**
	 * 构建日期范围的查询语句， 约定日期是： yyyy-MM-dd
	 * @author tuxming
	 * @date 2021年5月30日
	 * @param column
	 * @param startDate
	 * @param endDate
	 * @return
	 */
	public static String buildDateRange(String column, String startDate, String endDate) {
		if(Kit.isNotNull(startDate) && Kit.isNotNull(endDate)) {
			startDate += " 00:00:00";
			endDate += " 23:59:59";
			return " and "+column+" between '"+startDate+"' and '"+endDate+"' ";
		}else if(Kit.isNotNull(startDate)) {
			return " and "+column+" >= str_to_date('" + startDate + "','%Y-%m-%d') ";
		}else if(Kit.isNotNull(endDate)) {
			return " and "+column+" <= str_to_date('" + endDate + "','%Y-%m-%d') ";
		}
		return "";
	}
	
	/**
	 * 构建时间的范围的查询语句， 约定日期是： yyyy-MM-dd HH:mm:ss
	 * @author tuxming
	 * @date 2021年5月30日
	 * @param column
	 * @param startDate
	 * @param endDate
	 * @return
	 */
	public static String buildDateTimeRange(String column, String startDate, String endDate) {
		if(Kit.isNotNull(startDate) && Kit.isNotNull(endDate)) {
			return " and "+column+" between '"+startDate+"' and '"+endDate+"' ";
		}else if(Kit.isNotNull(startDate)) {
			return " and "+column+" >= str_to_date('" + startDate + "','%Y-%m-%d %H:%i:%s') ";
		}else if(Kit.isNotNull(endDate)) {
			return " and "+column+" <= str_to_date('" + endDate + "','%Y-%m-%d %H:%i:%s') ";
		}
		return "";
	}
	
}
