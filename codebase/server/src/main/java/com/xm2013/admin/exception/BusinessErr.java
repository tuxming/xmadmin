package com.xm2013.admin.exception;

public enum BusinessErr implements Error{
	NO_LOGIN(1, "用户未登录"),
	ERR_TOKEN(2, "非法的TOKEN"),
	ERR_REQUEST(3, "非法请求"), 
	ERR_NO_AUTH(4, "没有权限"),
	ERR_NO_DATA_AUTH(5, "没有数据权限"),
	UNKONOW_ERROR(6, "未知错误"),
	NULL_PARAM(7, "参数为空"),
	INVALID_PARAM(8, "参数不合法"),
	NO_DATA(9, "数据不存在"),
	ERROR(10, "错误"), 
	;
	
	private int code;
	private String msg;
	
	private BusinessErr(int code, String msg) {
		this.code = code;
		this.msg = msg;
	}


	@Override
	public int getCode() {
		return code;
	}

	@Override
	public String getMsg() {
		return msg;
	}

	@Override
	public BusinessErr setMsg(String msg) {
		this.msg = msg;
		return this;
	}
	
}
