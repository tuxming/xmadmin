package com.xm2013.admin.validator;

/**
 * 验证器异常类
 * @author tuxming@sina.com
 * @created 2018年12月15日
 */
public class ValidateException extends RuntimeException{

	/**
	 * 
	 */
	private static final long serialVersionUID = -239752076863882789L;

	public ValidateException() {
		super();
	}

	public ValidateException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
		super(message, cause, enableSuppression, writableStackTrace);
	}

	public ValidateException(String message, Throwable cause) {
		super(message, cause);
	}

	public ValidateException(String message) {
		super(message);
	}

	public ValidateException(Throwable cause) {
		super(cause);
	}

}
