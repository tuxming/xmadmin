package com.xm2013.admin.validator;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/**
 * 组合验证配置， 可以将几个指定的配置联合起来验证，支持多个配置
 */
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidateUnions {
	/**
	 * 要组合的配置名
	 * @return
	 */
	ValidateUnion[] values();
}
