package com.xm2013.admin.validator;

/**
 * 验证器匪类
 * @author tuxming@sina.com
 * @created 2018年12月15日
 */
public enum ValidateType {
	/**
	 * 验证字符串是不是为空
	 */
	NOEMPTY, 
	
	/**
	 * 验证对象是不是为空
	 */
	NULLABLE, 
	
	/**
	 * 验证是不是满足指定的正则表达式，通过value指定正则表达式，其中value值为字符串类型的正表达式
	 */
	REG, 

	/**
	 * 验证数字不能小于最小值，通过value指定最小值，其中value值为字符串类型的数字
	 */
	MIN, 
	
	/**
	 * 验证数字不能大于最大值，通过value指定最大值，其中value值为字符串类型的数字
	 */
	MAX, 
	
	/**
	 * 验证字符串不能小于于最小长度，通过value指定最小长度，其中value值为字符串类型的数字
	 */
	MINLENGTH, 
	
	/**
	 * 验证字符串不能大于于最大长度，通过value指定最大长度，其中value值为字符串类型的数字
	 */
	MAXLENGTH, 
	
	/**
	 * 验证字符串与指定字符串是不是相等，通过value指定目标字段名，其中value值为字符串类型字段名
	 */
	EQUALS;
}
