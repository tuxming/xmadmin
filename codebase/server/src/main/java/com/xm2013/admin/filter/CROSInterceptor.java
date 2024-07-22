package com.xm2013.admin.filter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.jfinal.aop.Interceptor;
import com.jfinal.aop.Invocation;
import com.jfinal.core.Controller;
import com.xm2013.admin.common.Kit;


/**
 * CROS跨域请求是否允许
 * Access-Control-Allow-Origin: 允许的请求源：可以设置一个请求的ip列表，相当于一个跨域请求的白名单，但是如果你希望任意跨域，不能配置*， 如果配置*,则Access-Control-Allow-Credentials是不能被携带cookie的。
 * 所以建议：获取http header中Origin的值：是什么值就返回什么值。
 * 
 * Access-Control-Allow-Methods： 允许的请求类型
 * Access-Control-Allow-Credentials： 是否允许携带cookies
 * Access-Control-Request-Headers: 这个请求头一般是content-type和自定义请求头
 * 
 * 
 */
public class CROSInterceptor implements Interceptor{

	@Override
	public void intercept(Invocation inv) {
		
//		System.out.println("exec CROSInterceptor");
		
		Controller controller = inv.getController();
		HttpServletResponse response = controller.getResponse();
		HttpServletRequest request = controller.getRequest();
		
		// 设置允许的源（* 表示接受任意域名的请求，也可以指定具体域名）
		String origin = request.getHeader("Origin");
		if(Kit.isNull(origin)) {
			origin = "*";
		}
//		System.out.println(origin);
        response.setHeader("Access-Control-Allow-Origin", origin);
        
        // 设置允许的请求方法
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT, OPTIONS");
        
//        List<String> headers = new ArrayList<String>();
//        Enumeration<String> headerNames = request.getHeaderNames();
//        while (headerNames.hasMoreElements()) {
//			headers.add(headerNames.nextElement());
//		}
//        String headerStrs = String.join(",", headers);        
//        // 设置允许的请求头
//        response.setHeader("Access-Control-Allow-Headers", headerStrs);
////        response.setHeader("Access-Control-Allow-Headers", "Content-Type,X-Requested-With,content-type,x-requested-with, User-Agent,user-agent");
//        response.setHeader("Access-Control-Request-Headers", headerStrs);
        
        
        String header = request.getHeader("Access-Control-Request-Headers");
        if(Kit.isNull(header)) {
        	header = "Content-Type,X-Requested-With,content-type,x-requested-with";
        }
        response.setHeader("Access-Control-Allow-Headers", header);
        
        
        // 是否允许浏览器携带用户凭证（cookies）
        response.setHeader("Access-Control-Allow-Credentials", "true");

        // 预检请求的有效期，单位为秒
        response.setHeader("Access-Control-Max-Age", "3600");
        
        if(request.getMethod().equals("OPTIONS")) {
			response.setStatus(HttpServletResponse.SC_OK);
			inv.getController().renderNull();
		}else {
			inv.invoke();
		}
	}

}
