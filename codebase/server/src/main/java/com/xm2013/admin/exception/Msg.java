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

package com.xm2013.admin.exception;

public class Msg {
	
	public static String SHIRO_REALM_PASSWORD_ERR = "用户名或者密码错误";
	public static String SHIRO_REALM_SIGN_ERR = "签名非法不一致";
	public static String SHIRO_REALM_STATUS_ERR = "账户状态错误,请联系管理员";
	public static String SHIRO_INTERCEPTOR_LOGIN_EXPIRED="登录过期";
	public static String SHIRO_INTERCEPTOR_TOKEN_EXPIRED = "Token过期或者Token非法";
	public static String SHIRO_INTERCEPTOR_SIGN_ERR = "签名decode失败";
	public static String SHIRO_INTERCEPTOR_TIMESTAMP_ERR = "时间戳为空";
	public static String SHIRO_INTERCEPTOR_DECODE_ERR = "参数decode失败";
	
	public static final String INVALID_REQUEST = "非法的请求";
	
	//AuthController
	public static final String AUTH_NULL_NAME = "用户名为空";
	public static final String AUTH_NULL_PHONE = "电话号码为空";
	public static final String AUTH_UNREG_PHONE = "该电话号码未注册";
	public static final String AUTH_NULL_EMAIL = "邮件地址为空";
	public static final String AUTH_UNREG_EMAIL = "该邮箱未注册";
	public static final String AUTH_NULL_PWD = "密码为空";
	public static final String AUTH_LOGIN_OK = "登录成功";
	public static final String AUTH_NULL_CODE = "验证码不正确";
	public static final String AUTH_SEND_PHONE_CODE_OK = "手机验证码发送成功";
	public static final String AUTH_SEND_EMAIL_CODE_OK = "邮箱验证码发送成功";
	public static final String AUTH_SEND_CODE_ERR = "发送失败";
	
	public static final String OK_UPDATE = "更新成功";
	public static final String ERR_UPDATE = "更新失败";
	public static final String OK_CREATED = "创建成功";
	public static final String ERR_CREATE = "创建失败";
	public static final String OK_DELETE = "删除成功";
	public static final String ERR_DELETE = "删除失败";
	public static final String OK_UPLOAD = "上传成功";
	public static final String ERR_UPLOAD = "上传失败";
	public static final String OK_GET = "获取成功";
	public static final String ERR_GET = "获取失败";
	public static final String ID_NULL = "id为空";
	public static final String DISABLE_EDIT = "禁止编辑";
	
	public static final String ROLE_NOT_CREATE_SYS_ROLE = "禁止创建/修改为系统级别的管理员";
	public static final String ROLE_NOT_CREATE_SUPER_ROLE = "超级管理员只能是系统级管理员或者同为超级管理员的角色创建/修改";
	public static final String ROLE_NOT_CREATE_ADMIN_ROLE = "管理员只能是管理员或者更高级的管理员创建/修改";
	
	public static final String ROLE_NOT_EDIT_SYS_ROLE = "禁止修改系统级别的角色";
	public static final String ROLE_NOT_DELETE_SYS_ROLE = "禁止删除系统级别的角色";
	
	public static final String UNEXIST_DEPT = "组织不存在";
	public static final String NO_DEPT_AUTH = "无组织权限";
	public static final String NO_UPDATE_DATA = "没有要更新的数据";
	public static final String UNEQUAL_PASSWORD = "两次密码输入不一致";
	public static final String INVALID_GENDER = "非法的性别选项";
	public static final String INVALID_STATUS = "非法的状态";
	public static final String INVALID_EMAIL = "邮箱地址不合法";
	public static final String INVALID_PHONE = "非法的电话号码";
	public static final String ERR_PWD = "密码错误";
	public static final String NO_DATA_AUTH = "没有数据权限";
	public static final String NO_ROLE = "没有选择角色";
	public static final String ERR_EMAIL = "邮箱地址不合法";
	public static final String ERR_PHONE = "电话号码不合法";
	
}
