package com.xm2013.admin.shiro;

import org.apache.shiro.authc.UsernamePasswordToken;

public class CustomToken extends UsernamePasswordToken{
	/**
	 * 
	 */
	private static final long serialVersionUID = 5906286016761053537L;
	private int type = 1;

	public CustomToken(String username, String password) {
		super(username, password);
	}

	public int getType() {
		return type;
	}

	public void setType(int type) {
		this.type = type;
	}
	
}
