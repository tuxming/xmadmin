package com.xm2013.admin.jfinal.generator;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface Col {
	
	String tableName() default "";
	String tableLabel() default "";
	String fieldName() default "";
	String colName() default "";
	String label() default "";
	
}
