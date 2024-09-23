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

package com.xm2013.admin.shiro.jwt;


import org.apache.shiro.authc.AccountException;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.AuthenticationInfo;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.SimpleAuthenticationInfo;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.realm.AuthorizingRealm;
import org.apache.shiro.subject.PrincipalCollection;

public class JwtRealm extends AuthorizingRealm {
	
	/**
	 * 限定这个 Realm 只处理我们自定义的 JwtToken
	 */
	@Override
	public boolean supports(AuthenticationToken token) {
		return token instanceof JwtToken;
	}
 
	/**
	 * 此处的 SimpleAuthenticationInfo 可返回任意值，密码校验时不会用到它
	 */
	@Override
	protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken authcToken)
			throws AuthenticationException {
		
		JwtToken jwtToken = (JwtToken) authcToken;
		if (jwtToken.getPrincipal() == null) {
			throw new AccountException("JWT token参数异常！");
		}
		
//		if(!JwtUtil.verify(jwtToken.getToken(), authcToken.getPrincipal().toString(), JwtUtil.SECRET)) {
//			throw new AccountException("非法的token");
//		}
		
		// 从 JwtToken 中获取当前用户
		String username = jwtToken.getPrincipal().toString();
//		// 查询数据库获取用户信息，此处使用 Map 来模拟数据库
//		SimpleAuthenticationInfo userinfo = findByShiroUser(username);
//		if(userinfo!=null) {
//			userinfo.setCredentials(username);
//			return userinfo;
//		}else {
//			
//			User user = userService.findByUsername(username);
//			if(user.getRefeshLogin() == 1) {
//				throw new UnknownAccountException(USER_ERR_PASSWORD);  
//			}
//			return new RealmHelper().loginAuthentication(user, null, getName());
//			
//		}
		return null;
	}
 
	private SimpleAuthenticationInfo findByShiroUser(String username) {
//		return Redis.use().hget(App.CT_SHIRO_USER, username);
		return null;
	}
	
	@Override
	protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principals) {
//		ShiroUser shiroUser = (ShiroUser) principals.getPrimaryPrincipal();
//		SimpleAuthorizationInfo info = new SimpleAuthorizationInfo();
//		info.addRole(shiroUser.getRoleName());
//		
//		info.addStringPermissions(shiroUser.getPermission());
//		
//		return info;
		return null;
	}
	
	
}
