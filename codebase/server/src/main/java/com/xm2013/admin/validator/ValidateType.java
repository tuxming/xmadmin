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
	EQUALS,
	
	/**
	 * 验证是否值包含数字，包括A-Za-z0-9-_
	 */
	CHAR_AND_NUMBER;
}
