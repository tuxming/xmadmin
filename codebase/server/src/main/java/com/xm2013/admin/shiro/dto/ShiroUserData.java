/*
 * MIT License
 *
 * Copyright (c) 2024 tuxming@sina.com / wechat: angft1
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

package com.xm2013.admin.shiro.dto;

import java.io.Serializable;

public class ShiroUserData implements Serializable{
	/**
	 * 
	 */
	private static final long serialVersionUID = -9119238857109269713L;
	private Integer id;
	private Integer userId;
	private Integer refId;
	private Integer type;
	private String username;
	private String path;
	private String pathName;
	
	public ShiroUserData() {}
	
	public ShiroUserData(Integer id, Integer userId, Integer refId, Integer type, String username, String path, String pathName) {
		super();
		this.id = id;
		this.userId = userId;
		this.refId = refId;
		this.username = username;
		this.path = path;
		this.pathName = pathName;
		this.type = type;
	}
	public Integer getId() {
		return id;
	}
	public ShiroUserData setId(Integer id) {
		this.id = id;
		return this;
	}
	public Integer getUserId() {
		return userId;
	}
	public ShiroUserData setUserId(Integer userId) {
		this.userId = userId;
		return this;
	}
	public Integer getRefId() {
		return refId;
	}
	public ShiroUserData setRefId(Integer refId) {
		this.refId = refId;
		return this;
	}
	public String getUsername() {
		return username;
	}
	public ShiroUserData setUsername(String username) {
		this.username = username;
		return this;
	}
	public String getPath() {
		return path;
	}
	public ShiroUserData setPath(String path) {
		this.path = path;
		return this;
	}
	public String getPathName() {
		return pathName;
	}
	public ShiroUserData setPathName(String pathName) {
		this.pathName = pathName;
		return this;
	}

	public Integer getType() {
		return type;
	}

	public ShiroUserData setType(Integer type) {
		this.type = type;
		return this;
	}
	
}
