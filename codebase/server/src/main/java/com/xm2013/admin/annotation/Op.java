package com.xm2013.admin.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Op {
	/**
	 * 操作类型：如：登录，修改密码，修改权限等
	 * @return
	 */
	String value();
	
	/**
	 * 是否自动保存日志到数据库
	 * @return
	 */
	boolean save() default true;
	
	/**
	 * 是否打印请求日志,线上环境建议设置为false, 
	 */
	boolean print() default true;
}
