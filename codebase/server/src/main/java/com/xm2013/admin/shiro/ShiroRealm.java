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

package com.xm2013.admin.shiro;

import java.util.List;

import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.AuthenticationInfo;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.DisabledAccountException;
import org.apache.shiro.authc.IncorrectCredentialsException;
import org.apache.shiro.authc.UnknownAccountException;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.authz.SimpleAuthorizationInfo;
import org.apache.shiro.realm.AuthorizingRealm;
import org.apache.shiro.subject.PrincipalCollection;

import com.jfinal.aop.Aop;
import com.xm2013.admin.basic.service.UserService;
import com.xm2013.admin.common.Kit;
import com.xm2013.admin.domain.model.User;
import com.xm2013.admin.exception.BusinessErr;
import com.xm2013.admin.exception.BusinessException;
import com.xm2013.admin.exception.Msg;
import com.xm2013.admin.shiro.dto.ShiroRole;
import com.xm2013.admin.shiro.dto.ShiroUser;
import com.xm2013.admin.shiro.jwt.JwtToken;
import com.xm2013.admin.shiro.stateless.StatelessToken;

public class ShiroRealm extends AuthorizingRealm {
	
	/**
	 * 认证回调函数,登录时调用.
	 */
	@Override
	protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken authcToken) throws AuthenticationException {
		
		AuthenticationInfo info = null;
		if(authcToken instanceof UsernamePasswordToken) {
			info = doUserAuth((UsernamePasswordToken) authcToken);
		}else if(authcToken instanceof JwtToken) {
			info = doJwtAuth((JwtToken) authcToken);
		}else if(authcToken instanceof StatelessToken) {
			info = doStatelessAuth((StatelessToken) authcToken);
		}
		
		if(info == null) {
			throw new BusinessException(BusinessErr.UNKONOW_ERROR);
		}
		
		return info;
	}

	/**
	 * 正常的账号密码登录
	 * @param token
	 * @return
	 */
	private AuthenticationInfo doUserAuth(UsernamePasswordToken token) {
		UserService userService = Aop.get(UserService.class);
		
		User user = null;
		boolean isPasswordLogin = false;
		if(token instanceof CustomToken) {
			CustomToken ctoken = (CustomToken) token;
			if(ctoken.getType() == 2) {
				user = userService.findByEmail(token.getUsername());
			}else if(ctoken.getType() == 3) {
				user = userService.findByPhone(token.getUsername());
			}
		}
		
		if(user == null) {
			user = userService.findByUsername(token.getUsername());
			isPasswordLogin = true;
		}
		
		
		//判断用户是否存在  
	    if (null == user){  
	         throw new UnknownAccountException(Msg.SHIRO_REALM_PASSWORD_ERR);  
	    } 
	    
	    //检查用户密码是否匹配  
	    String password = new String(token.getPassword());
	    if(isPasswordLogin) {
		    if (!password.equals(user.getPassword())){  
		         throw new IncorrectCredentialsException(Msg.SHIRO_REALM_PASSWORD_ERR);  
		    }
	    }
	    
	    return ShiroKit.buildAuthenticationInfo(user, userService, getName());
	}
	
	/**
	 * jwt登录验证
	 * @param authcToken
	 * @return
	 */
	private AuthenticationInfo doJwtAuth(JwtToken authcToken) {
		JwtToken jwtToken = (JwtToken) authcToken;
		if (jwtToken.getPrincipal() == null) {
			throw new BusinessException(BusinessErr.ERR_TOKEN);
		}
		
		String username = jwtToken.getPrincipal().toString();
		UserService userService = Aop.get(UserService.class);
		User user = userService.findByUsername(username);
		
		//判断用户是否存在  
	    if (null == user){  
	         throw new UnknownAccountException(Msg.SHIRO_REALM_PASSWORD_ERR);  
	    } 		
	    return ShiroKit.buildAuthenticationInfo(user, userService, getName());
	}
	
	/**
	 * 无状态消息签名登录
	 * @param statelessToken
	 * @return
	 */
	private AuthenticationInfo doStatelessAuth(StatelessToken statelessToken) {
		
        String username = statelessToken.getUsername();
        UserService userService = Aop.get(UserService.class);
        User user = userService.findByUsername(username);
        if (null == user){  
	         throw new UnknownAccountException(Msg.SHIRO_REALM_PASSWORD_ERR);  
	    }

        int status = user.getStatus();
	    if(status != 1) {
	    	throw new IncorrectCredentialsException(Msg.SHIRO_REALM_STATUS_ERR);  
	    }
	    
        //在服务器端生成客户端参数消息摘要
		try {
			String serverDigest = Kit.HmacSHA256ToBase64(statelessToken.getParams(), user.getToken());
			String sign = statelessToken.getClientDigest();
			
			if(!serverDigest.equalsIgnoreCase(sign)) {
				throw new DisabledAccountException(Msg.SHIRO_REALM_SIGN_ERR);  
			}
			
		} catch (Exception e) {
			throw new DisabledAccountException(Msg.SHIRO_REALM_SIGN_ERR);  
		}
		return ShiroKit.buildAuthenticationInfo(user, userService, getName());
	}
	
	/**
	 * 授权查询回调函数, 进行鉴权但缓存中无用户的授权信息时调用. 
	 */
	@Override
	public AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principals) {
		ShiroUser shiroUser = (ShiroUser) principals.getPrimaryPrincipal();
		SimpleAuthorizationInfo info = new SimpleAuthorizationInfo();
		
		List<ShiroRole> roles = shiroUser.getRoles();
		if(roles!=null) {
			for (ShiroRole shiroRole : roles) {
				info.addRole(shiroRole.getCode());
			}
		}
		
		info.addStringPermissions(shiroUser.getPermissions());
		return info;
	}
	
	/**
	 * 自定义方法：清除所有 授权缓存
	 */
	public void clearAllCachedAuthorizationInfo() {
	    getAuthorizationCache().clear();
	}

	/**
	 * 自定义方法：清除所有 认证缓存
	 */
	public void clearAllCachedAuthenticationInfo() {
	    getAuthenticationCache().clear();
	}

	/**
	 * 自定义方法：清除所有的  认证缓存  和 授权缓存
	 */
	public void clearAllCache() {
	    clearAllCachedAuthenticationInfo();
	    clearAllCachedAuthorizationInfo();
	}
	
	@Override
	public boolean supports(AuthenticationToken token){
        return token instanceof UsernamePasswordToken 
        		|| token instanceof CustomToken 
        		|| token instanceof JwtToken 
        		|| token instanceof StatelessToken;
    }
}