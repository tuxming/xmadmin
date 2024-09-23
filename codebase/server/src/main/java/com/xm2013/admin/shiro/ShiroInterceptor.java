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

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.apache.shiro.subject.Subject;
import org.apache.shiro.subject.SubjectContext;
import org.apache.shiro.subject.support.DefaultSubjectContext;
import org.apache.shiro.util.AntPathMatcher;
import org.apache.shiro.util.PatternMatcher;

import com.jfinal.aop.Interceptor;
import com.jfinal.aop.Invocation;
import com.jfinal.core.Controller;
import com.jfinal.plugin.redis.Redis;
import com.xm2013.admin.common.Kit;
import com.xm2013.admin.domain.dto.JsonResult;
import com.xm2013.admin.exception.BusinessErr;
import com.xm2013.admin.exception.BusinessException;
import com.xm2013.admin.exception.Msg;
import com.xm2013.admin.shiro.jwt.JwtToken;
import com.xm2013.admin.shiro.jwt.JwtUtil;
import com.xm2013.admin.shiro.stateless.StatelessToken;

/**
 * 这里模拟shiro-web的功能，但是由于定制化比较强，所以自己实现类似于shiro-web的功能
 * 自定义主要解决两个问题： 1，shiro-web会读取inputstream而http请求的流只能读取一次，所以shiro-web会导致文件流出问题。
 * 	2，shiro-web由于需要兼容的比较多登录流程过于复杂，如果shiro-web没有吃透会导致shiro初始化subject吃性能。
 */
public class ShiroInterceptor implements Interceptor{
	private static Logger log = Logger.getLogger(ShiroInterceptor.class);
	protected PatternMatcher pathMatcher = new AntPathMatcher();
	
	/**
	 * 1，判断请求是否要验证登录
	 * 2，判断是否带了登录信息
	 * 3，判断是否登录信息是否登录
	 * https://blog.csdn.net/TheThirdMoon/article/details/129794613
	 */
	@Override
	public void intercept(Invocation inv) {
		
		//这里只支持anno和authc,基本就满足需求
		try {
			String path = inv.getActionKey();
			boolean needLogin = checkNeedLogin(path);
			
			//如果需要登录，判断是否带了登录信息，并验证是否登录
			if(!needLogin) {
				inv.invoke();
				return;
			}
			
			SubjectContext context = new DefaultSubjectContext();
			Subject subject = SecurityUtils.getSecurityManager().createSubject(context);
			
			//绑定subject到当前线程
			subject.execute(new Callable<Object>() {

				@Override
				public Object call() throws Exception {
					//构建token，这里执行登录
					//如果是传的sessionId这里执行创建 UsernamepasswordToken
					//如果是传的jwttoken这里创建jwttoken,
					//如果是无状态这里请求，这里传的是username
					
					//调用登录将之前的缓存关联起来
					try {
						
						AuthenticationToken token = createToken(inv);
						if(token == null) {
							throw new BusinessException(BusinessErr.ERR_TOKEN);
						}
						
						//要使用当前的subject来登录才会把当前的subject与缓存的登录信息绑定起来
						//后面的interceptor和controller才能使用SecurityUtils.getSubject().getPrincipal();
						subject.login(token);
	//					SecurityUtils.getSecurityManager().login(subject, token);
						inv.invoke();
					
					} catch (BusinessException e) {
						log.debug(e.getMsg(), e);
						String result = JsonResult.error(e);
						inv.getController().renderJson(result);
					} catch (Exception e) {
						log.error(e.getMessage(), e);
						String result = JsonResult.error(e);
						inv.getController().renderJson(result);
					}
					
					return null;
				}
			});
		} catch (BusinessException e) {
			log.debug(e.getMsg(), e);
			String result = JsonResult.error(e);
			inv.getController().renderJson(result);
		} catch (Exception e) {
			log.error(e.getMessage(), e);
			String result = JsonResult.error(e);
			inv.getController().renderJson(result);
		}
	}
	
	/**
	 * 构建token录
	 * 如果是传的sessionId这里执行创建 UsernamepasswordToken
	 * 如果是传的jwttoken这里创建jwttoken,
	 * 如果是无状态这里请求，这里传的是username
	 * @param inv
	 * @return
	 */
	public AuthenticationToken createToken(Invocation inv) {
		HttpServletResponse response = inv.getController().getResponse();
		
		//带jwttoken的请求
		String jwttokenStr = getValue(inv, ShiroConst.JWT_TOKEN_HEADER);
		if(Kit.isNotNull(jwttokenStr)) {
			//解析token，判断token是否过期
			//如果过期返回jwttoken,
			try {
				JwtToken token = new JwtToken(jwttokenStr);
				String newToken = JwtUtil.refreshTokenExpired(jwttokenStr, JwtUtil.SECRET);
				if(!jwttokenStr.equals(newToken)) {
					//如果不相等说明刷新了token
					//将新token写入cookie
//					System.out.println("newToken:\r\n"+newToken+"\r\noldToken:\r\n"+tokenStr);
					writeTokenToResponse(ShiroConst.JWT_TOKEN_HEADER, newToken, response);
				}
				return token;
				
			} catch (Exception e) {
				//这里报的异常一般是token已经过期，或者token非法不能正常构建
				log.error(e.getMessage(), e);
				throw new BusinessException(BusinessErr.NO_LOGIN, Msg.SHIRO_INTERCEPTOR_TOKEN_EXPIRED);
			}
		}
		
		//无状态请求
		//客户端传入的用户身份
		String appId = getValue(inv, ShiroConst.APP_ID);
		if(Kit.isNotNull(appId)) {
			//验证和构建无状态请求的sign
			String clientDigest = inv.getController().get(ShiroConst.APP_SIGN);
			if(clientDigest.indexOf("%")>-1) {
				try {
					clientDigest = URLDecoder.decode(clientDigest, "utf-8");
				} catch (UnsupportedEncodingException e) {
					log.error(e.getMessage(), e);
					throw new BusinessException(BusinessErr.ERROR, Msg.SHIRO_INTERCEPTOR_SIGN_ERR);
				}
			}
			
			//3、客户端请求的参数列表
			
			String params = getParam(inv);
			//4、生成无状态Token
			StatelessToken token = new StatelessToken(appId, params, clientDigest);
			return token;
		}
		
		//带sessionId的请求
		String sessionId = getValue(inv, ShiroConst.SISSION_ID);
		if(Kit.isNotNull(sessionId)) {
			//在登录成功后要将token缓存起来，这里才能正常取出来
			UsernamePasswordToken token = Redis.use().hget(ShiroConst.SISSION_ID, sessionId);
			if(token!=null) {
				return token;
			}
			throw new BusinessException(BusinessErr.NO_LOGIN, Msg.SHIRO_INTERCEPTOR_LOGIN_EXPIRED);
		}
		
		return null;
		
	}
	
	public void writeTokenToResponse(String key, String token, HttpServletResponse response) {
		
		Cookie cookie = new Cookie(key, token);
        cookie.setMaxAge(60*60*24);
        cookie.setPath("/");
//        cookie.setDomain(".shunyunbaoerp.com");
        cookie.setHttpOnly(true);
        response.addCookie(cookie);
		
	}
	
	/**
	 * 在param,header, cookie中找指定的key的值
	 * @param inv
	 * @param key
	 * @return
	 */
	private String getValue(Invocation inv, String key) {
		Controller controller = inv.getController();
		String value = controller.getPara(key);
		if(Kit.isNotNull(value)) {
			return value;
		}
		
		value = controller.getHeader(key);
		if(Kit.isNotNull(value)){
			return value;
		}
		
		value = controller.getCookie(key);
		if(Kit.isNotNull(value))
			return value;
		
		return null;
		
		
	}
	
	/**
	 * 获取参数
	 * @author tuxming
	 * @date 2021年5月26日
	 * @param request
	 * @return
	 */
	private String getParam(Invocation inv) {
		//验证时间，超过5分钟，说明非法的请求
		Long timestamp = inv.getController().getLong(ShiroConst.APP_TIMESTAMP);
		if(timestamp==null) {
			throw new BusinessException(BusinessErr.ERR_TOKEN, Msg.SHIRO_INTERCEPTOR_TIMESTAMP_ERR);
		}
			
		long curr = System.currentTimeMillis()/1000l;
		long duration = curr - timestamp;
		long target = 5 * 60;
		if(duration > target) {
			throw new BusinessException(BusinessErr.ERR_TOKEN, "");
		}
		
		Controller ctrl = inv.getController();
		
		//获取所有参数
		Enumeration<String> keys = ctrl.getParaNames();
		List<String> keyList = Collections.list(keys);
		
		//按字典顺讯排序
		Collections.sort(keyList);
		
		keyList.remove(ShiroConst.APP_SIGN);

		String[] paramArr = new String[keyList.size()];
		
		int i=0; 
		for(String key : keyList) {
			paramArr[i] = key+"="+ctrl.getPara(key);
			i++;
		}
		
		String body = null;
		String contentType = ctrl.getRequest().getContentType();
		if(contentType!=null && contentType.toLowerCase().indexOf("application/json")>-1) {
			body = ctrl.getRawData();
		}
		
		String param = String.join("&", paramArr);
		if(Kit.isNotNull(body)) {
			try {
				String str = URLEncoder.encode(body,"UTF-8");
				str = str.replaceAll("\\+", "%20");
				param += "&" + str;
			} catch (UnsupportedEncodingException e) {
				log.error(e.getMessage(), e);
				throw new BusinessException(BusinessErr.ERROR, Msg.SHIRO_INTERCEPTOR_DECODE_ERR);
			}
			//因为java urlEncode会把空格编译为加号，这里为了统一标准，所以统一替换为%20
			
		}
		
		return param;
	}
	
	/**
	 * 检测当前请求是否需要登录
	 * 这里只支持anno和authc,基本就满足需求
	 * @param path
	 * @return
	 */
	public boolean checkNeedLogin(String path) {
		@SuppressWarnings("unchecked")
		Map<String, String> urls = Redis.use().hgetAll(ShiroConst.CACHE_URLS);
		
		for(String url: urls.keySet()) {
			if(pathMatcher.matches(url, path)) {
				String val = urls.get(url);
				return val.equals("authc");
			}
		}
		
		return false;
	}

}
