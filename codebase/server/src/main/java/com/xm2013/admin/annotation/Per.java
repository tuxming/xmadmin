package com.xm2013.admin.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 定义权限表达式的注解类，多一个name，方便启动的时候获取到权限列表一次性添加到数据库
 */
@Target({ElementType.TYPE, ElementType.METHOD})
//@Retention(RetentionPolicy.RUNTIME)
@Retention(RetentionPolicy.RUNTIME)
public @interface Per {
	/**
	 * 所需的权限表达式
	 * @return
	 */
    String val();
    
    /**
     * 权限名
     * @return
     */
	String name();
	
	/**
	 * 分组
	 * @return
	 */
	String group() default "normal";
}
