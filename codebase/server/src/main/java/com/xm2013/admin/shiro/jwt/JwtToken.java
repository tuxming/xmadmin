package com.xm2013.admin.shiro.jwt;

import org.apache.shiro.authc.AuthenticationToken;

public class JwtToken implements AuthenticationToken {
	 
	private static final long serialVersionUID = 1L;
 
	// 加密后的 JWT token串
	private String token;
 
	private String userName;
 
	public JwtToken(String token) {
		this.token = token;
		this.userName = JwtUtil.getClaimFiled(token, "username");
	}
 
	@Override
	public Object getPrincipal() {
		return this.userName;
	}
 
	@Override
	public Object getCredentials() {
		return userName;
	}

	public String getToken() {
		return token;
	}

	

}
