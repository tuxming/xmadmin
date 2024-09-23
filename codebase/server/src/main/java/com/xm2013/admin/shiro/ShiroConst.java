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

package com.xm2013.admin.shiro;

/**
 * shiro常量
 */
public class ShiroConst {
	/**
	 * jwttoken的字段头
	 */
	public final static String JWT_TOKEN_HEADER = "jwtToken";
	
	/**
	 * sessionId:  使用token作为sessionId，如果token不存在，则判断sign字段，如果sign存在，则使用appId作为sessionId
	 */
	public final static String SISSION_ID = "JSESSIONID";
	
	/**
	 * 
	 */
	public final static String CACHE_URLS = "shiro.urls";


	/**
	 * 无状态请求的参数key
	 */
	public final static String APP_SIGN = "sign";
	/**
	 * appId字段
	 */
	public final static String APP_ID = "appId";
	public final static String APP_TIMESTAMP = "timestamp";
	
}
