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
	
	public static final String SESSION_KEY_DEPT_ID = "DEPT_ID";
	public static final String SESSION_KEY_DEPT_PARENT_ID = "DEPT_PARENT_ID";
	public static final String SESSION_KEY_DEPT_PATH = "DEPT_PARENT_PATH";
	public static final String SESSION_KEY_DEPT_CHILD_PATH = "DEPT_PARENT_CHILD_PATH";
	
	public static final String DOCUMENT_ID = "document.id";
	
}
