package com.xm2013.admin.domain.dto.user;

import com.xm2013.admin.domain.model.User;

public class UpdateUserDto extends User{
	/**
	 * 
	 */
	private static final long serialVersionUID = 2679112190162991475L;
	private boolean refreshToken = false;
	private String rePassword;
	private String newPassword;
	
	private String resultMsg;
	private Object resultData;

	public boolean isRefreshToken() {
		return refreshToken;
	}

	public void setRefreshToken(boolean refreshToken) {
		this.refreshToken = refreshToken;
	}

	public String getRePassword() {
		return rePassword;
	}

	public void setRePassword(String rePassword) {
		this.rePassword = rePassword;
	}

	public String getNewPassword() {
		return newPassword;
	}

	public void setNewPassword(String newPassword) {
		this.newPassword = newPassword;
	}

	public String getResultMsg() {
		return resultMsg;
	}

	public void setResultMsg(String resultMsg) {
		this.resultMsg = resultMsg;
	}

	public Object getResultData() {
		return resultData;
	}

	public void setResultData(Object resultData) {
		this.resultData = resultData;
	}
	
}
