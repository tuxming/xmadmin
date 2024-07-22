package com.xm2013.admin.common.http;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Response {
	private byte[] datas = null;
	private Map<String, String> cookies = new HashMap<String, String>();
	private Map<String, List<String>> header = new HashMap<String, List<String>>();
	private String contentType;
	private int statusCode;
	private String responseMsg;
	
	private String saveFilePath;
	private String fileName;
	private String ext;
	
	public int getStatusCode() {
		return statusCode;
	}
	public void setStatusCode(int statusCode) {
		this.statusCode = statusCode;
	}
	public byte[] getDatas() {
		return datas;
	}
	public void setDatas(byte[] datas) {
		this.datas = datas;
	}
	
	public String getResponseMsg() {
		return responseMsg;
	}
	public void setResponseMsg(String responseMsg) {
		this.responseMsg = responseMsg;
	}
	public Map<String, String> getCookies() {
		return cookies;
	}
	public void setCookies(Map<String, String> cookies) {
		this.cookies = cookies;
	}
	
	public String getCookie(String name) {
		return this.cookies.get(name);
	}
	
	public void addCookie(String name, String value) {
		this.cookies.put(name, value);
	}
	
	public String getString() {
		return getString(DefSetting.CHARSET);
	}
	
	public String getContentType() {
		return contentType;
	}
	public void setContentType(String contentType) {
		this.contentType = contentType;
	}
	public String getString(String charest) {
		try {
			if(this.datas!=null) {
				return new String(this.datas, charest);
			}
		} catch (UnsupportedEncodingException e) {
			DefSetting.log.error(e.getMessage(),e);
		}
		return null;
	}
	
	public String getStringAsBase64() {
		return this.datas==null?null:org.apache.shiro.codec.Base64.decodeToString(this.datas);
	}
	public String getSaveFilePath() {
		return saveFilePath;
	}
	public void setSaveFilePath(String saveFilePath) {
		this.saveFilePath = saveFilePath;
	}
	public String getFileName() {
		return fileName;
	}
	public void setFileName(String fileName) {
		this.fileName = fileName;
	}
	public String getExt() {
		return ext;
	}
	public void setExt(String ext) {
		this.ext = ext;
	}
	public Map<String, List<String>> getHeader() {
		return header;
	}
	public void setHeader(Map<String, List<String>> header) {
		this.header = header;
	}
}
