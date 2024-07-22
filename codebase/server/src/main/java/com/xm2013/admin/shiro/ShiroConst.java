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
