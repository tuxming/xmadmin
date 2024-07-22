package com.xm2013.admin.validator;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/**
 * 验证具体细节注解
 * @author tuxming@sina.com
 * @created 2018年12月15日
 */
@Retention(RetentionPolicy.RUNTIME)
public @interface Validate {
	ValidateType type();
	String msg();
	String field();
	String value() default "";
}
