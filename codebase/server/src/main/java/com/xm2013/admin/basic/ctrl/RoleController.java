package com.xm2013.admin.basic.ctrl;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.jfinal.aop.Inject;
import com.xm2013.admin.annotation.Op;
import com.xm2013.admin.annotation.RequirePermission;
import com.xm2013.admin.basic.service.RoleService;
import com.xm2013.admin.common.kits.JsonKit;
import com.xm2013.admin.domain.dto.JsonResult;
import com.xm2013.admin.domain.dto.PageInfo;
import com.xm2013.admin.domain.dto.basic.RoleListQuery;
import com.xm2013.admin.domain.model.Role;
import com.xm2013.admin.exception.BusinessErr;
import com.xm2013.admin.exception.BusinessException;
import com.xm2013.admin.exception.Msg;
import com.xm2013.admin.shiro.ShiroKit;
import com.xm2013.admin.shiro.dto.ShiroUser;
import com.xm2013.admin.validator.Validator;

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
	
	@RequirePermission(val="sys:role:list", name="角色列表", group="system")
	@Op("角色列表")
	public void list() {
		RoleListQuery query = JsonKit.getObject(getRawData(), RoleListQuery.class);
		
		PageInfo<Role> users = roleService.pageList(query, ShiroKit.getLoginUser());
		renderJson(JsonResult.ok(Msg.OK_GET, users));
	}
	
	@RequirePermission(val="sys:role:create", name="添加角色", group="system")
	@Op("添加角色")
	public void create() {
		Role role = JsonKit.getObject(getRawData(), Role.class);
		
		Validator validator = new Validator();
		validator.exec(role, "create", false);
		if(validator.hasError()) {
			throw new BusinessException(BusinessErr.INVALID_PARAM, validator.getError());
		}
		
		ShiroUser user = ShiroKit.getLoginUser();
		role.setCreater(user.getId());
		roleService.create(role, user);
		
		renderJson(JsonResult.ok(Msg.OK_CREATED));
	}
	
	@RequirePermission(val="sys:role:edit", name="编辑角色", group="system")
	@Op("编辑角色")
	public void update() {
		Role role = JsonKit.getObject(getRawData(), Role.class);
		
		Validator validator = new Validator();
		validator.exec(role, "create", false);
		if(validator.hasError()) {
			throw new BusinessException(BusinessErr.INVALID_PARAM, validator.getError());
		} 
		
		ShiroUser user = ShiroKit.getLoginUser();
		role.setCreater(user.getId());
		roleService.update(role, user);
		
		renderJson(JsonResult.ok(Msg.OK_UPDATE));
	}
	
	@RequirePermission(val="sys:role:delete", name="删除角色", group="system")
	@Op("删除角色")
	public void deletes() {
		String ids = getPara("ids");
		if(ids == null || !ids.matches("[\\d,]+")) {
			throw new BusinessException(BusinessErr.NULL_PARAM);
		}
		
		roleService.deletes(ids);
		
		renderJson(JsonResult.ok(Msg.OK_DELETE));
	}
	
}
