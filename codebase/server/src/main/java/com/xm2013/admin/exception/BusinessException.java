package com.xm2013.admin.exception;

public class BusinessException extends RuntimeException implements Error{

	/**
	 * 
	 */
	private static final long serialVersionUID = -2698897344078235049L;
	private BusinessErr error;
	private boolean isDefine = false;
	private String[] args;
	private boolean isFormat = false;
	
	public BusinessException(BusinessErr error) {
		super();
		this.error = error;
	}
	
	public BusinessException(BusinessErr error, String msg) {
		super();
		this.error = error;
		this.isDefine = true;
		this.error.setMsg(msg);
	}
	
	public BusinessException(BusinessErr error, String fmt, String ...args) {
		super();
		this.error = error;
		this.isDefine = true;
		this.isDefine = true;
		this.error.setMsg(fmt);
		this.args = args;
	}
	
	public BusinessException(BusinessErr error, String msg, Throwable th) {
		super(msg, th);
		this.error = error;
		this.isDefine = true;
		this.error.setMsg(msg);
	}
	
	public BusinessException(BusinessErr error, String msg, boolean isDefine) {
		super();
		this.error = error;
		this.isDefine = isDefine;
		this.error.setMsg(msg);
	}
	
	
	@Override
	public int getCode() {
		return this.error.getCode();
	}

	@Override
	public String getMsg() {
		return this.error.getMsg();
	}

	@Override
	public Error setMsg(String msg) {
		this.error.setMsg(msg);
		this.isDefine = true;
		return this.error;
	}

	public BusinessErr getError() {
		return error;
	}

	public boolean isDefine() {
		return isDefine;
	}

	public void setDefine(boolean isDefine) {
		this.isDefine = isDefine;
	}

	public boolean isFormat() {
		return isFormat;
	}

	public String[] getArgs() {
		return args;
	}
}
