package com.xm2013.admin.domain.dto.user;

import com.xm2013.admin.validator.V;
import com.xm2013.admin.validator.Validate;
import com.xm2013.admin.validator.ValidateGroup;
import com.xm2013.admin.validator.ValidateType;

@V(value={
	@ValidateGroup(name="loginByPassword", validates = {  
		@Validate(field="username", type=ValidateType.NOEMPTY, msg="用户名不能为空"),
		@Validate(field="code", type=ValidateType.NOEMPTY, msg="验证码不能为空"),
		@Validate(field="password", type=ValidateType.NOEMPTY, msg="密码不能为空"),
	}),
	@ValidateGroup(name="loginByTelephone", validates = {  
		@Validate(field="telephone", type=ValidateType.NOEMPTY, msg="电话号码不能为空"),
		@Validate(field="code", type=ValidateType.NOEMPTY, msg="短信验证码不能为空"),
	}),
	@ValidateGroup(name="loginByEmail", validates = {  
		@Validate(field="email", type=ValidateType.NOEMPTY, msg="邮件地址不能为空"),
		@Validate(field="code", type=ValidateType.NOEMPTY, msg="邮箱验证码不能为空"),
	}),
})
public class LoginDto {
	//类型：1=账号密码登录，2=邮件验证码登录，3=手机验证码登录
	private int type = 1;
	private String username;
	private String email;
	private String telephone;
	private String password;
	private String code;
	public String getCode() {
		return code;
	}
	public void setCode(String code) {
		this.code = code;
	}
	public int getType() {
		return type;
	}
	public void setType(int type) {
		this.type = type;
	}
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	
	public String getTelephone() {
		return telephone;
	}
	public void setTelephone(String telephone) {
		this.telephone = telephone;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
}
