package com.xm2013.admin.common.http;

import java.io.File;

public class RequestFile {
	private String name;
	private String contentType = "application/octet-stream";
	private File file;
	
	public RequestFile(String name, File file) {
		super();
		this.name = name;
		this.file = file;
	}
	public RequestFile() {
		super();
	}
	
	public RequestFile(String name, String contentType, File file) {
		super();
		this.name = name;
		this.contentType = contentType;
		this.file = file;
	}
	public String getName() {
		return name;
	}
	public RequestFile setName(String name) {
		this.name = name;
		return this;
	}
	public String getContentType() {
		return contentType;
	}
	public RequestFile setContentType(String contentType) {
		this.contentType = contentType;
		return this;
	}
	public File getFile() {
		return file;
	}
	public RequestFile setFile(File file) {
		this.file = file;
		return this;
	}
	public RequestFile setFile(String filename) {
		this.file = new File(filename);
		return this;
	}
	
}
