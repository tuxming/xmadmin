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

/**
 * redis缓存的key值
 */
public class CacheKey {
	public static String USER_NAME="user.name";	//用户名，user
	public static String USER_EMAIL="user.mail";	//email，user
	public static String USER_PHONE="user.phone";	//phone，user
	public static String USER_ID="user.id";	//phone，user
	public static final String USER_DATA = "user.data.path"; //id，datapath
	public static final String SESSION_KEY_CAPTCHA = "captcha.code";
	public static final String SESSION_KEY_PHONE_CAPTCHA = "captcha.phone.code";
	public static final String SESSION_KEY_EMAIL_CAPTCHA = "captcha.email.code";
	
	public static final String DEPT_ID = "DEPT_ID";
	public static final String DEPT_PARENT_ID = "DEPT_PARENT_ID";
	public static final String DEPT_PATH = "DEPT_PARENT_PATH";
	public static final String DEPT_CHILD_PATH = "DEPT_PARENT_CHILD_PATH";
	
	public static final String DOCUMENT_ID = "document.id";
	
	public static final String LANG_RES = "LANG_RES";
	public static final String LANGS = "LANGS";
	
	
}
