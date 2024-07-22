package com.xm2013.admin.validator;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/**
 * 验证器分组注解类
 * @author tuxming@sina.com
 * @created 2018年12月15日
 */
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidateGroup {
	
	/**
	 * 验证组名称，随意，当然建议更业务逻辑名字相关：如create, update, upload, 等等。
	 * @author tuxming@sina.com
	 * @created	2018年12月15日
	 * @return
	 */
	String name() default "";
	Validate[] validates();
}
