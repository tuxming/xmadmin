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

package com.xm2013.admin.domain.dto.user;

import com.xm2013.admin.validator.V;
import com.xm2013.admin.validator.Validate;
import com.xm2013.admin.validator.ValidateGroup;
import com.xm2013.admin.validator.ValidateType;
import com.xm2013.admin.validator.ValidateUnion;
import com.xm2013.admin.validator.ValidateUnions;

/**
 * 忘记密码后， 提交重置密码的表单的数据
 */
@V(value={
	@ValidateGroup(name="password", validates = {
		@Validate(field="password", type=ValidateType.NOEMPTY, msg="密码不能为空"),
		@Validate(field="repassword", type=ValidateType.NOEMPTY, msg="确认密码不能为空"),
		@Validate(field="repassword", type=ValidateType.EQUALS, value="password", msg="两次密码输入不一致")
	}),
	@ValidateGroup(name="email", validates = {  
		@Validate(field="account", type=ValidateType.NOEMPTY, msg="邮箱地址不能为空"),
		@Validate(field="code", type=ValidateType.NOEMPTY, msg="邮箱验证码不能为空"),
	}),
	@ValidateGroup(name="phone", validates = {  
		@Validate(field="account", type=ValidateType.NOEMPTY, msg="电话号码不能为空"),
		@Validate(field="code", type=ValidateType.NOEMPTY, msg="短信验证码不能为空"),
	}),
})
@ValidateUnions(values={
	 @ValidateUnion(name="byEmail", values= {"password", "email"}),
	 @ValidateUnion(name="byPhone", values= {"password", "phone"}),
})
public class ForgetPasswordDto {
	private int type = 1; //1-通过手机找回，2-通过邮箱找回
	private String account;  //type=1：手机号码， 2：邮箱地址
	private String code; //验证码
	private String password;
	private String repassword;
	public int getType() {
		return type;
	}
	public void setType(int type) {
		this.type = type;
	}
	public String getAccount() {
		return account;
	}
	public void setAccount(String account) {
		this.account = account;
	}
	public String getCode() {
		return code;
	}
	public void setCode(String code) {
		this.code = code;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public String getRepassword() {
		return repassword;
	}
	public void setRepassword(String repassword) {
		this.repassword = repassword;
	}
}
