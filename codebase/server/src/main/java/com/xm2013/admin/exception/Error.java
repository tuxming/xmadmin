package com.xm2013.admin.exception;

public interface Error {
	public int getCode();
	public String getMsg();
	public Error setMsg(String msg);
	
}
