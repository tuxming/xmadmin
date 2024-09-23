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

package com.xm2013.admin.exception;

public enum BusinessErr implements Error{
	NO_LOGIN(1, "用户未登录"),
	ERR_TOKEN(2, "非法的TOKEN"),
	ERR_REQUEST(3, "非法请求"), 
	ERR_NO_AUTH(4, "没有权限"),
	ERR_NO_DATA_AUTH(5, "没有数据权限"),
	UNKONOW_ERROR(6, "未知错误"),
	NULL_PARAM(7, "参数为空"),
	INVALID_PARAM(8, "参数不合法"),
	NO_DATA(9, "数据不存在"),
	ERROR(10, "错误"), //这个错误的消息会是自定义消息
	;
	
	private int code;
	private String msg;
	
	private BusinessErr(int code, String msg) {
		this.code = code;
		this.msg = msg;
	}


	@Override
	public int getCode() {
		return code;
	}
	
	public BusinessErr setCode(int code) {
		this.code = code;
		return this;
	}
	
	@Override
	public String getMsg() {
		return msg;
	}

	@Override
	public BusinessErr setMsg(String msg) {
		this.msg = msg;
		return this;
	}
	
}
