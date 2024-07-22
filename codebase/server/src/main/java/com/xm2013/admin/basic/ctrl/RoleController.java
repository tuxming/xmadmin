package com.xm2013.admin.basic.ctrl;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.jfinal.aop.Inject;
import com.xm2013.admin.basic.service.RoleService;
import com.xm2013.admin.domain.dto.JsonResult;
import com.xm2013.admin.domain.model.Role;
import com.xm2013.admin.exception.Msg;
import com.xm2013.admin.shiro.ShiroKit;

public class RoleController extends BaseController{
	
	@Inject
	private RoleService roleService;
	
	/**
	 * 关键字搜索
	 * 返回key：value形式：key=id, value=显示的值
	 */
	public void search() {
		String key = getPara("k", "");
		
		List<Role> roles = roleService.search(key, ShiroKit.getLoginUser());
		
		Map<String, String> options = roles.stream()
				.collect(Collectors.toMap(
					k -> k.getId()+"", 
					v -> (v.getRoleName()+"("+v.getCode()+")"), 
					(k1, k2)->k1
				));
		
		renderJson(JsonResult.ok(Msg.OK_GET, options));
	}
	
}
