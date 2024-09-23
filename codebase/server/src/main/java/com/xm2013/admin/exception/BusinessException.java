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

public class BusinessException extends RuntimeException implements Error{

	/**
	 * 
	 */
	private static final long serialVersionUID = -2698897344078235049L;
	private BusinessErr error;
	private boolean isDefine = false;
	private String[] args;
	private boolean isFormat = false;
	
	public BusinessException(BusinessErr error) {
		super();
		this.error = error;
	}
	
	public BusinessException(BusinessErr error, String msg) {
		super();
		this.error = error;
		this.isDefine = true;
		this.error.setMsg(msg);
	}
	
	public BusinessException(BusinessErr error, String fmt, String ...args) {
		super();
		this.error = error;
		this.isDefine = true;
		this.isDefine = true;
		this.error.setMsg(fmt);
		this.args = args;
	}
	
	public BusinessException(BusinessErr error, String msg, Throwable th) {
		super(msg, th);
		this.error = error;
		this.isDefine = true;
		this.error.setMsg(msg);
	}
	
	public BusinessException(BusinessErr error, String msg, boolean isDefine) {
		super();
		this.error = error;
		this.isDefine = isDefine;
		this.error.setMsg(msg);
	}
	
	
	@Override
	public int getCode() {
		return this.error.getCode();
	}

	@Override
	public String getMsg() {
		return this.error.getMsg();
	}

	@Override
	public Error setMsg(String msg) {
		this.error.setMsg(msg);
		this.isDefine = true;
		return this.error;
	}

	public BusinessErr getError() {
		return error;
	}

	public boolean isDefine() {
		return isDefine;
	}

	public void setDefine(boolean isDefine) {
		this.isDefine = isDefine;
	}

	public boolean isFormat() {
		return isFormat;
	}

	public String[] getArgs() {
		return args;
	}
}
