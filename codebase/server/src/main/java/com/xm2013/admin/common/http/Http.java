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

package com.xm2013.admin.common.http;

/**
 * 自己封装的简单的http请求类，可以方便的实现链式调用
 */
public class Http {
	public static Request xdo(String url) {
		return connect(url);
	}

	private static Request connect(String url) {
		return new Request().setUrl(url);
	}
	
	public static Request xdo(String url, boolean paramSort) {
		return connect(url, paramSort);
	}
	
	private static Request connect(String url, boolean paramSort) {
		return new Request(paramSort).setUrl(url);
	}
	
	public static void main(String[] args) {
		Response resp = Http.xdo("https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm")
//				.setSave("d:/", "2.html")
				.get();
		System.out.println(resp.getString());
//		byte[] datas = resp.getDatas();
		
//		for (byte b : datas) {
//			System.out.println(Integer.toBinaryString(b));
//		}
//		Map<String,String> map = new HashedMap<String,String>();
//		Response response = Http.xdo("http://www.fhk123.com/").setParams(map).post();
		
	}
	
}
