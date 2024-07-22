package com.xm2013.admin.validator;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 验证器注解
 * @author tuxming@sina.com
 * @created 2018年12月15日
 */
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface V {
	
	/**
	 * 验证组，用来在不同场景下进行不同的验证，比如在create的时候，只验证某些字段，update的时候只验证某些字段
	 * @author tuxming@sina.com
	 * @created	2018年12月15日
	 * @return
	 */
	ValidateGroup[] value();
	
}
