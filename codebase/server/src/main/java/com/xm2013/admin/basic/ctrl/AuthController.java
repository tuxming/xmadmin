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

package com.xm2013.admin.basic.ctrl;

import java.awt.image.BufferedImage;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.DisabledAccountException;
import org.apache.shiro.authc.IncorrectCredentialsException;
import org.apache.shiro.authc.UnknownAccountException;
import org.apache.shiro.subject.Subject;

import com.jfinal.aop.Inject;
import com.xm2013.admin.basic.service.UserService;
import com.xm2013.admin.common.CacheKey;
import com.xm2013.admin.common.Kit;
import com.xm2013.admin.common.captcha.CaptchaGenerator;
import com.xm2013.admin.common.kits.JsonKit;
import com.xm2013.admin.domain.dto.JsonResult;
import com.xm2013.admin.domain.dto.user.ForgetPasswordDto;
import com.xm2013.admin.domain.dto.user.LoginDto;
import com.xm2013.admin.domain.model.User;
import com.xm2013.admin.exception.BusinessErr;
import com.xm2013.admin.exception.Msg;
import com.xm2013.admin.shiro.CustomToken;
import com.xm2013.admin.shiro.ShiroConst;
import com.xm2013.admin.shiro.ShiroKit;
import com.xm2013.admin.shiro.dto.ShiroUser;
import com.xm2013.admin.shiro.jwt.JwtUtil;
import com.xm2013.admin.validator.Validator;


/**
 * 登录，注册，授权
 */
public class AuthController extends BaseController{
	private static Logger log = Logger.getLogger(AuthController.class);
	
	@Inject
	private UserService userService;
	
	/**
	 * session登录
	 */
	public void login() {
		
		LoginDto loginInfo = JsonKit.getObject(getRawData(), LoginDto.class);
		Validator validator = new Validator(false);
		
		String codeCacheKey = "";
		Integer loginType = loginInfo.getType();
		if(loginType == null  || loginType < 1 || loginType>3)
			loginType = 1;
		
		if(loginType == 1) {
			validator.exec(loginInfo, "loginByPassword");
			codeCacheKey = CacheKey.SESSION_KEY_CAPTCHA;
		}else if(loginType == 2) {
			validator.exec(loginInfo, "loginByEmail");
			codeCacheKey = CacheKey.SESSION_KEY_EMAIL_CAPTCHA;
			loginInfo.setUsername(loginInfo.getEmail());
		}else if(loginType == 3) {
			validator.exec(loginInfo, "loginByTelephone");
			codeCacheKey = CacheKey.SESSION_KEY_PHONE_CAPTCHA;
			loginInfo.setUsername(loginInfo.getTelephone());
		}
		
		if(validator.hasError()) {
			renderJson(JsonResult.error(BusinessErr.ERROR.setMsg(validator.getError())));
			return;
		}
		
		if(loginInfo.getCode().equalsIgnoreCase(getSession().getAttribute(codeCacheKey)+"") == false){
			renderJson(JsonResult.error(BusinessErr.ERROR.setMsg(Msg.AUTH_NULL_CODE)));
			return;
		}
		
		
		try {
//			Subject subject = SecurityUtils.getSubject(); 
//			CustomToken token = new CustomToken(loginInfo.getUsername(), Kit.doubleMd5WidthSalt(loginInfo.getPassword()));
//			token.setType(loginInfo.getType());
//			//7.执行登录，如果登录未成功，则捕获相应的异常
//			subject.login(token);
//			
//			//设置session返回
////			//设置返回数据
//			ShiroUser shiroUser = (ShiroUser) subject.getPrincipal();

			User user = null;
			if(loginType == 2) {
				user = userService.findByEmail(loginInfo.getUsername());
			}else if(loginType == 3) {
				user = userService.findByPhone(loginInfo.getUsername());
			}else {
				user = userService.findByUsername(loginInfo.getUsername());
			}
			
			if(user == null) {
				renderJson(JsonResult.error(BusinessErr.ERROR.setMsg(Msg.AUTH_NO_USER_ERR)));
				return;
			}
			
			if(loginInfo.getType() == 1 
				&& !user.getPassword().equals(Kit.doubleMd5WidthSalt(loginInfo.getPassword()))
			) {
				renderJson(JsonResult.error(BusinessErr.ERROR.setMsg(Msg.AUTH_NO_USER_ERR)));
				return;
			}
			
			ShiroUser shiroUser = ShiroKit.buildShiroUser(user, userService);
	        
	        // 生成JWT令牌
	        String jwtToken = JwtUtil.sign(shiroUser.getUsername());
			
			//设置jwt返回
			//移除原有的session cookie
			HttpSession session = getSession();
			Cookie cookie = new Cookie(ShiroConst.SISSION_ID, session.getId());
			cookie.setMaxAge(0);
			cookie.setPath("/");
//			cookie.setHttpOnly(true);
			getResponse().addCookie(cookie);
			session.invalidate();
			
			//添加jwt cookie
			Cookie jwtCookie = new Cookie(ShiroConst.JWT_TOKEN_HEADER, jwtToken);
			jwtCookie.setMaxAge(60*60*24);
			jwtCookie.setPath("/");
//			jwtCookie.setHttpOnly(true);
	        getResponse().addCookie(jwtCookie);
			
	        //返回jwttoken
			Map<String, Object> res = new HashMap<String, Object>();
			res.put("jwtToken", jwtToken);
			res.put("user", shiroUser);
			
			String userData = JsonResult.ok(Msg.AUTH_LOGIN_OK, res);
			renderJson(userData);
		} catch (UnknownAccountException uae) {
			log.info(uae.getMessage(), uae);
//			throw new BusinessException(BusinessErr.ERROR, uae.getMessage());
			renderJson(JsonResult.error(BusinessErr.ERROR.setMsg(uae.getMessage())));
			return;
		} catch (IncorrectCredentialsException ice) {
//			log.info(ice.getMessage(), ice);
//			throw new BusinessException(BusinessErr.ERROR, Msg.SHIRO_REALM_PASSWORD_ERR);
			renderJson(JsonResult.error(BusinessErr.ERROR.setMsg(ice.getMessage())));
			return;
		} catch (DisabledAccountException dae) {
//			log.info(dae.getMessage(), dae);
//			throw new BusinessException(BusinessErr.ERROR, dae.getMessage());
			renderJson(JsonResult.error(BusinessErr.ERROR.setMsg(dae.getMessage())));
		}
	}
	
	/**
	 * 获图片取验证码
	 */
	public void code() {
		
		HttpSession session = getRequest().getSession();
		session.removeAttribute(CacheKey.SESSION_KEY_CAPTCHA);
		
		String code = CaptchaGenerator.randomCode(4);
		System.out.println("验证码："+code);
		session.setAttribute(CacheKey.SESSION_KEY_CAPTCHA, code);
		BufferedImage image= CaptchaGenerator.generate(null, code);
		renderImage(image, "code-"+System.currentTimeMillis()+".png", "png");
	}
	
	/**
	 * 发送短信验证码
	 */
	public void sendPhoneCode() {
		String phoneNo = getPara("phone");
		if(Kit.isNull(phoneNo)) {
//			throw new BusinessException(BusinessErr.ERROR, Msg.AUTH_NULL_PHONE);
			renderJson(JsonResult.error(BusinessErr.ERROR.setMsg(Msg.AUTH_NULL_PHONE)));
			return;
		}
		
		//检测是否存在
		User user = userService.findByPhone(phoneNo);
		if(user == null) {
//			throw new BusinessException(BusinessErr.ERROR, Msg.AUTH_UNREG_PHONE);
			renderJson(JsonResult.error(BusinessErr.ERROR.setMsg(Msg.AUTH_UNREG_PHONE)));
			return;
		}
		
		String code = getPara("code");
		if(Kit.isNull(code)) {
//			throw new BusinessException(BusinessErr.ERROR, Msg.AUTH_NULL_CODE);
			renderJson(JsonResult.error(BusinessErr.ERROR.setMsg(Msg.AUTH_NULL_CODE)));
			return;
		}
		
		if(code.equalsIgnoreCase(getSession().getAttribute(CacheKey.SESSION_KEY_CAPTCHA)+"") == false){
//			throw new BusinessException(BusinessErr.ERROR, Msg.AUTH_NULL_CODE);
			renderJson(JsonResult.error(BusinessErr.ERROR.setMsg(Msg.AUTH_NULL_CODE)));
			return;
		}
		
		HttpSession session = getRequest().getSession();
		//设置时间确保1分钟只发送一次
		String ip = Kit.getIpAddr(getRequest());
		Long prevDate = (Long) session.getAttribute(ip);
		long curr = System.currentTimeMillis();
		if(prevDate!= null && curr - prevDate < 60000 ) {
//			renderJson(JsonResult.error(Msg.AUTH_SEND_CODE_ERR));
			renderJson(JsonResult.error(BusinessErr.ERROR.setMsg(Msg.AUTH_SEND_CODE_ERR)));
			return;
		}
		
		
		String phoneCode = CaptchaGenerator.randomNumberCode(6);
		System.out.println("手机号："+phoneNo+"的验证码："+phoneCode);
		session.setAttribute(CacheKey.SESSION_KEY_PHONE_CAPTCHA, phoneCode);
		session.setAttribute(ip, curr);
		
		renderJson(JsonResult.ok(Msg.AUTH_SEND_PHONE_CODE_OK));
	}
	
	/**
	 * 发送邮件验证码
	 */
	public void sendMailCode() {
		String email = getPara("email");
		if(Kit.isNull(email)) {
//			throw new BusinessException(BusinessErr.ERROR, Msg.AUTH_NULL_EMAIL);
			renderJson(JsonResult.error(BusinessErr.ERROR.setMsg(Msg.AUTH_NULL_EMAIL)));
			return;
		}
		//检测是否存在
		User user = userService.findByEmail(email);
		if(user == null) {
//			throw new BusinessException(BusinessErr.ERROR, Msg.AUTH_UNREG_EMAIL);
			renderJson(JsonResult.error(BusinessErr.ERROR.setMsg(Msg.AUTH_UNREG_EMAIL)));
			return;
		}
		
		String code = getPara("code");
		if(Kit.isNull(code)) {
//			throw new BusinessException(BusinessErr.ERROR, Msg.AUTH_NULL_CODE);
			renderJson(JsonResult.error(BusinessErr.ERROR.setMsg(Msg.AUTH_NULL_CODE)));
			return;
		}
		
		if(code.equalsIgnoreCase(getSession().getAttribute(CacheKey.SESSION_KEY_CAPTCHA)+"") == false){
//			throw new BusinessException(BusinessErr.ERROR, Msg.AUTH_NULL_CODE);
			renderJson(JsonResult.error(BusinessErr.ERROR.setMsg(Msg.AUTH_NULL_CODE)));
			return;
		}
		
		HttpSession session = getRequest().getSession();
		//设置时间确保1分钟只发送一次
		String ip = Kit.getIpAddr(getRequest());
		Long prevDate = (Long) session.getAttribute(ip);
		long curr = System.currentTimeMillis();
		if(prevDate!= null && curr - prevDate < 60000 ) {
//			renderJson(JsonResult.error(Msg.AUTH_SEND_CODE_ERR));
			renderJson(JsonResult.error(BusinessErr.ERROR.setMsg(Msg.AUTH_SEND_CODE_ERR)));
			return;
		}
		
		String emailCode = CaptchaGenerator.randomNumberCode(6);
		System.out.println("邮箱地址"+email+"的证码："+emailCode);
		session.setAttribute(CacheKey.SESSION_KEY_EMAIL_CAPTCHA, emailCode);
		session.setAttribute(ip, curr);
		
		renderJson(JsonResult.ok(Msg.AUTH_SEND_EMAIL_CODE_OK));
	}
	
	
	/**
	 * 忘记密码
	 */
	public void resetPassword() {
		ForgetPasswordDto dto = JsonKit.getObject(getRawData(), ForgetPasswordDto.class);
		
		Validator validator = new Validator(false);
		
		String codeCacheKey = "";
		
		if(dto.getType() == 1) {
			validator.execUnion(dto, "byPhone");
			codeCacheKey = CacheKey.SESSION_KEY_PHONE_CAPTCHA;
		}else if(dto.getType() == 2) {
			validator.execUnion(dto, "byEmail");
			codeCacheKey = CacheKey.SESSION_KEY_EMAIL_CAPTCHA;
		}
		
		if(validator.hasError()) {
//			throw new BusinessException(BusinessErr.ERROR, validator.getError());
			renderJson(JsonResult.error(BusinessErr.ERROR.setMsg(validator.getError())));
			return;
		}
		
		if(dto.getCode().equalsIgnoreCase(getSession().getAttribute(codeCacheKey)+"") == false){
//			throw new BusinessException(BusinessErr.ERROR, Msg.AUTH_NULL_CODE);
			renderJson(JsonResult.error(BusinessErr.ERROR.setMsg(Msg.AUTH_NULL_CODE)));
			return;
		}
		
		//验证验证码是否正确
		boolean result = userService.updatePassword(dto.getType(), dto.getAccount(), dto.getPassword());
		if(result) {
			renderJson(JsonResult.ok(Msg.OK_UPDATE));
		}else {
			renderJson(JsonResult.error(Msg.ERR_UPDATE));
		}
		
	}
	
}
