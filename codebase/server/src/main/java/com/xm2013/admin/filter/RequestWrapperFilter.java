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

package com.xm2013.admin.filter;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * 响应OPTIONS请求，设置跨域
 */
public class RequestWrapperFilter implements Filter {

	@Override
	public void init(FilterConfig filterConfig) throws ServletException {

	}

	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {

		ServletRequest requestWrapper = request;
		ServletResponse responseWrapper = response;
//		if(request instanceof HttpServletRequest
//				&& (request.getContentType()==null || request.getContentType().indexOf("multipart/form-data")<0)) {
//			requestWrapper = new BodyReaderHttpServletRequestWrapper((HttpServletRequest) request);
//		}
		
		HttpServletRequest sreq = (HttpServletRequest)requestWrapper;
		HttpServletResponse sres = (HttpServletResponse)responseWrapper;
		
		setCROS(sreq, sres);
//		if(response instanceof HttpServletResponse) {
//			responseWrapper = new BodyWriterHttpServletResponseWrapper((HttpServletResponse)response);
//		}
		
		if(sreq.getMethod().equals("OPTIONS")) {
			sres.setStatus(200);
		}else {
			chain.doFilter(requestWrapper, responseWrapper);
		}
		
//		if(responseWrapper instanceof BodyWriterHttpServletResponseWrapper) {
//			writeResponse((BodyWriterHttpServletResponseWrapper)responseWrapper, (HttpServletResponse) response);
//		}
	}

	@Override
	public void destroy() {

	}

	public void setCROS(HttpServletRequest request, HttpServletResponse response){
		// 设置允许的源（* 表示接受任意域名的请求，也可以指定具体域名）
        response.setHeader("Access-Control-Allow-Origin", "*");
        
        // 设置允许的请求方法
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT");
        
        // 设置允许的请求头
        response.setHeader("Access-Control-Allow-Headers", "*");
        
        // 是否允许浏览器携带用户凭证（cookies）
        response.setHeader("Access-Control-Allow-Credentials", "true");

        // 预检请求的有效期，单位为秒
        response.setHeader("Access-Control-Max-Age", "3600");
		
////	    HttpServletResponse response = (HttpServletResponse) res;
////	    HttpServletRequest request = (HttpServletRequest) req;
////	    response.setHeader("Access-Control-Allow-Origin", "*");
//		String origin = request.getHeader("Origin");
//		if(Kit.isNull(origin)) {
//			origin = request.getHeader("origin");
//			if(Kit.isNull(origin)) {
//				origin = "*";
//			}
//		}
//	    response.setHeader("Access-Control-Allow-Origin", origin);
////	    response.setHeader("referrer", "origin");
//	    response.setHeader("Access-Control-Allow-Credentials","true"); //是否支持cookie跨域
//
//	    String allowMethods = request.getHeader("Access-Control-Request-Method");
//	    if(Kit.isNull(allowMethods)) {
//	    	allowMethods = request.getHeader("access-control-request-method");
//	    	if(Kit.isNull(allowMethods)) {
//	    		allowMethods = "POST,GET,PUT,OPTIONS,DELETE";
//	    	}
//	    }
//	    
//	    response.setHeader("Access-Control-Allow-Methods", allowMethods);
//	    response.setHeader("Access-Control-Max-Age", "3600");
//	    
//	    String allowHeaders = request.getHeader("Access-Control-Request-Headers");
//	    if(Kit.isNull(allowHeaders)) {
//	    	allowHeaders = request.getHeader("access-control-request-headers");
//	    	if(Kit.isNull(allowMethods)) {
//	    		allowHeaders = "*";
//	    	}
//	    }
//	    
////	    response.addHeader("Access-Control-Allow-Headers", "Origin,X-Authorization-With,X-Custom-Header,X-Requested-With,Content-Type,Accept,x-requested-with,content-type");
//	    response.addHeader("Access-Control-Allow-Headers", allowHeaders);
	} 

//	@SuppressWarnings("unused")
//	private void writeResponse(BodyWriterHttpServletResponseWrapper copier, HttpServletResponse response) throws IOException {
//		if (copier.isUseWriter()) {
//			PrintWriter out = response.getWriter();
//			out.write(copier.getWriterCopy());
//			out.flush();
//			out.close();
//		} else {
//			OutputStream out = response.getOutputStream();
//			out.write(copier.getStreamCopy());
//			out.flush();
//			out.close();
//		}
//	}


}
