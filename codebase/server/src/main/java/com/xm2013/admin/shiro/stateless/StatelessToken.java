package com.xm2013.admin.shiro.stateless;

import org.apache.shiro.authc.AuthenticationToken;

/**
 * 无状态请求
 */
@SuppressWarnings("serial")
public class StatelessToken implements AuthenticationToken {
	
	private String username;
    private String params;
    private String clientDigest;
	
	public StatelessToken(String username, String params, String clientDigest) {
		this.username = username;
		this.params = params;
		this.clientDigest = clientDigest;
	}

	@Override
	public Object getPrincipal() {
		return username;
	}

	@Override
	public Object getCredentials() {
		return clientDigest;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getParams() {
		return params;
	}

	public void setParams(String params) {
		this.params = params;
	}

	public String getClientDigest() {
		return clientDigest;
	}

	public void setClientDigest(String clientDigest) {
		this.clientDigest = clientDigest;
	}

}
