package com.xm2013.admin.exception;

public class Msg {
	
	public static String SHIRO_REALM_PASSWORD_ERR = "用户名或者密码错误";
	public static String SHIRO_REALM_SIGN_ERR = "签名非法不一致";
	public static String SHIRO_REALM_STATUS_ERR = "账户状态错误,请联系管理员";
	public static String SHIRO_INTERCEPTOR_LOGIN_EXPIRED="登录过期";
	public static String SHIRO_INTERCEPTOR_TOKEN_EXPIRED = "Token过期或者Token非法";
	public static String SHIRO_INTERCEPTOR_SIGN_ERR = "签名decode失败";
	public static String SHIRO_INTERCEPTOR_TIMESTAMP_ERR = "时间戳为空";
	public static String SHIRO_INTERCEPTOR_DECODE_ERR = "参数decode失败";
	
	public static final String INVALID_REQUEST = "非法的请求";
	
	public static final String OK_GET = "获取成功";
	
	//AuthController
	public static final String AUTH_NULL_NAME = "用户名为空";
	public static final String AUTH_NULL_PHONE = "电话号码为空";
	public static final String AUTH_UNREG_PHONE = "该电话号码未注册";
	public static final String AUTH_NULL_EMAIL = "邮件地址为空";
	public static final String AUTH_UNREG_EMAIL = "该邮箱未注册";
	public static final String AUTH_NULL_PWD = "密码为空";
	public static final String AUTH_LOGIN_OK = "登录成功";
	public static final String AUTH_NULL_CODE = "验证码不正确";
	public static final String AUTH_SEND_PHONE_CODE_OK = "手机验证码发送成功";
	public static final String AUTH_SEND_EMAIL_CODE_OK = "邮箱验证码发送成功";
	public static final String AUTH_SEND_CODE_ERR = "发送失败";
	public static final String OK_UPDATE = "更新成功";
	public static final String ERR_UPDATE = "更新失败";
	public static final String OK_CREATED = "创建成功";
	public static final String OK_DELETE = "删除成功";
	
	
}
