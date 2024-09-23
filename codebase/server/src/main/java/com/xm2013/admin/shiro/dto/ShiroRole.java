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
import java.util.Objects;

import com.jfinal.kit.JsonKit;

/**
 * 角色
 */
public class ShiroRole implements Serializable{

	/**
	 * 
	 */
	private static final long serialVersionUID = -3075097834580431497L;

	private Integer id;
	private String name;
	private String code;
	private Integer type;
	public ShiroRole() {}
	public ShiroRole(Integer id, String name, Integer type) {
		super();
		this.id = id;
		this.name = name;
		this.type = type;
	}
	public Integer getId() {
		return id;
	}
	public ShiroRole setId(Integer id) {
		this.id = id;
		return this;
	}
	public String getName() {
		return name;
	}
	public ShiroRole setName(String name) {
		this.name = name;
		return this;
	}
	public Integer getType() {
		return type;
	}
	public ShiroRole setType(Integer type) {
		this.type = type;
		return this;
	}
	
	public String getCode() {
		return code;
	}
	public void setCode(String code) {
		this.code = code;
	}
	@Override
	public String toString() {
		return JsonKit.toJson(this);
	}
	@Override
	public int hashCode() {
		return Objects.hash(code, id, name, type);
	}
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		ShiroRole other = (ShiroRole) obj;
		return Objects.equals(code, other.code) && Objects.equals(id, other.id) && Objects.equals(name, other.name)
				&& Objects.equals(type, other.type);
	}
	
}
