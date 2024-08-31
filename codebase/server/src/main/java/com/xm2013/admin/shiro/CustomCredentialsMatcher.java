package com.xm2013.admin.shiro;

import org.apache.shiro.authc.AuthenticationInfo;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.apache.shiro.authc.credential.SimpleCredentialsMatcher;

public class CustomCredentialsMatcher extends SimpleCredentialsMatcher{

	/**
	 * 对比传进来的密码和数据库（缓存）的密码是否相等，其实在构建AuthenticationInfo之前就已经完成了所有的对比，意思就是到这个层面理论上都是合法的。
	 * AuthenticationInfo是在自定的AuthorizingRealm（ShiroRealm）中doGetAuthenticationInfo方法的返回值，
	 * doGetAuthenticationInfo就是验证登录是否合法，所以到这里可以不需要二次比较。
	 * 
	 * 上面是在登录的时候调用这个方法
	 * 
	 * 比较思路参考：
	 * 	账号密码登录的比较密码是否相等, 在ShiroRealm#doGetAuthenticationInfo()			
	 * 	手机验证码，邮箱验证码的登录，比较验证码是否相等： AuthController#checkLoginByPhone(), AuthController#checkLoginByEmail()
	 * 	jwt登录的比较jwttoken是否合法,	ShiroInterceptor#createToken()
	 *  无状态登录的，可以验证签名是否正确	ShiroInterceptor#createToken()
	 * 但是这些操作都已经在前面做过了，所以这里可以直接返回true
	 * 
	 * 然后每次请求都要构建请求的认证数据构建token，然后构建的token需要与缓存中的token进行对比： 
	 * sessionId: 在createToken里面通过sessionId会获取到相同的token，不然就会鉴权失败
	 * 
	 */
	@Override
	public boolean doCredentialsMatch(AuthenticationToken token, AuthenticationInfo info) {
		
//		if(token instanceof CustomToken) {
//			CustomToken ctoken = (CustomToken) token;
//			
//			
//		}
//		
//		if(token instanceof UsernamePasswordToken || token instanceof CustomToken) {
//			return super.doCredentialsMatch(token, info);
//		}
		
		return true;
	}

}
