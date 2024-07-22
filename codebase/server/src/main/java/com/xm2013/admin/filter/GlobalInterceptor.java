package com.xm2013.admin.filter;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authz.annotation.Logical;

import com.jfinal.aop.Interceptor;
import com.jfinal.aop.Invocation;
import com.jfinal.plugin.activerecord.Db;
import com.xm2013.admin.annotation.Op;
import com.xm2013.admin.annotation.Per;
import com.xm2013.admin.annotation.RequirePermission;
import com.xm2013.admin.annotation.RequirePermissions;
import com.xm2013.admin.common.Kit;
import com.xm2013.admin.domain.dto.JsonResult;
import com.xm2013.admin.domain.model.History;
import com.xm2013.admin.exception.BusinessErr;
import com.xm2013.admin.shiro.ShiroKit;
import com.xm2013.admin.shiro.dto.ShiroUser;


/**
 * 拦截请求日志
 * 验证权限是否具备权限
 */
public class GlobalInterceptor implements Interceptor{
	private static Logger log = Logger.getLogger(GlobalInterceptor.class);
	@Override
	public void intercept(Invocation inv) {
		
		try {
			interceptLog(inv);
		} catch (Exception e) {
			log.error(e.getMessage(), e);
		}
		
		boolean isPermitted = handerPermission(inv);
		if(!isPermitted) {
			inv.getController().renderJson(JsonResult.error(BusinessErr.ERR_NO_AUTH));
			return;
		}
		
		inv.invoke();
		
	}
	
	/**
	 * 拦截日志
	 * @param inv
	 */
	private void interceptLog(Invocation inv) {
		
		Op op = inv.getMethod().getAnnotation(Op.class);
		if(op == null) return;
		
		HttpServletRequest request = inv.getController().getRequest();
		
		String type = op.value();
		String ip = Kit.getIpAddr(request);
		Date date = new Date();
		
		Integer userId = 0;
		String loginName = "";
		
		ShiroUser user = ShiroKit.getLoginUser();
		if(user!=null) {
			loginName = user.getFullname()+"("+user.getUsername()+")";
			userId = user.getId();
		}
		
		List<History> hists = new ArrayList<History>();
		
		String[] params = getRequestParam(inv);
		
		String uniqueId = UUID.randomUUID().toString().replace("-", "").substring(24);;
		for(int i=0; i<params.length; i++) {
			String para = params[i];
			
			History hist = new History();
			hist.setType(type);
			hist.setCreated(date);
			hist.setIpAddr(ip);
			hist.setRemark(para);
			hist.setUserId(userId);
			hist.setUsername(loginName);
			hist.setHistoryId(uniqueId);
			hist.setSeq(i);
			hists.add(hist);
		}
		
		Db.batchSave(hists, hists.size());
		
	}
	
	/**
	 * 构建日志的请求参数
	 * @author tuxming
	 * @date 2021年5月26日
	 * @param request
	 * @return
	 */
	private String[] getRequestParam(Invocation inv) {
		String remark = "";
		
		HttpServletRequest request = inv.getController().getRequest();
		
		String param = request.getQueryString();
		
		if(Kit.isNotNull(param)) {
			remark+="param: "+param+"\r\n";
		}
		
		
		String contentType = request.getContentType();
		if(contentType==null || contentType.indexOf("multipart/form-data")<0) {
			String body = inv.getController().getRawData();
			
			boolean bodyNotNull = Kit.isNotNull(body);
			if(body.indexOf("password")>-1) {
				body = body.replaceAll("password\"\\s*\\:\"[\\w\\W]*?\"", "password\":\"******\"");
			}
			
			if(bodyNotNull) {
				remark+="body:"+body;
			}
		}
		
		int length = remark.length();
		if(length<1000) {
			return new String[] {remark};
		}
		
		int times = (int) Math.ceil(length/1000d);
		
		String[] ps = new String[times];
		for(int i=0; i<times; i++) {
			try {
				int start = i * 1000;
				int end = (i+1)*1000;
				if(end>length) {
					end = length;
				}
				
				ps[i] = remark.substring(start, end);
			}catch (Exception e) {
				log.error(e.getMessage(), e);
			}
		}
		return ps;
	}
	
	/**
	 * <pre>处理权限</pre>
	 * @param inv， 这里只处理：RequiresPermissions 注解
	 * @return
	 * @throws SecurityException 
	 * @throws NoSuchMethodException 
	 * @throws ClassNotFoundException 
	 */
	private boolean handerPermission(Invocation inv)  {
		boolean isPermitted = true;
		
		RequirePermissions requiresPermissions = inv.getMethod().getAnnotation(RequirePermissions.class);
		if(requiresPermissions!=null) {
			Per[] permissions = requiresPermissions.value();
			
			String[] pers = new String[permissions.length];
			for(int i=0; i<permissions.length; i++) {
				pers[i] = permissions[i].val();
			}
			
			Logical logic = requiresPermissions.logical();
			
			boolean[] ress = SecurityUtils.getSubject().isPermitted(pers);
			List<Boolean> resList = new ArrayList<Boolean>();
			for(boolean res : ress) {
				resList.add(res);
			}
			
			isPermitted = logic.equals(Logical.AND) ? 
					(!resList.contains(false)) :  resList.contains(true);
		}else {
			RequirePermission requiresPermission = inv.getMethod().getAnnotation(RequirePermission.class);
			if(requiresPermission!=null) {
				isPermitted = SecurityUtils.getSubject().isPermitted(requiresPermission.val());
			}
		}
		return isPermitted;
	}

}
