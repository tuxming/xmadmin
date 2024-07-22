package com.xm2013.admin.validator;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/**
 * 组合验证配置， 可以将几个指定的配置组合起来验证
 */
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidateUnion {
	/**
	 * 名称，根据这个来指定验证的组
	 */
	String name();
	/**
	 * 其他配置名@ValidateGroup的name
	 * @return
	 */
	String[] values() ;
}
