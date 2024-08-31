package com.xm2013.admin.basic.ctrl;

import org.apache.shiro.authz.annotation.Logical;

import com.jfinal.aop.Inject;
import com.xm2013.admin.annotation.Op;
import com.xm2013.admin.annotation.Per;
import com.xm2013.admin.annotation.RequirePermission;
import com.xm2013.admin.annotation.RequirePermissions;
import com.xm2013.admin.basic.service.MenuService;
import com.xm2013.admin.common.kits.JsonKit;
import com.xm2013.admin.domain.dto.JsonResult;
import com.xm2013.admin.domain.model.Menu;
import com.xm2013.admin.exception.BusinessErr;
import com.xm2013.admin.exception.BusinessException;
import com.xm2013.admin.exception.Msg;
import com.xm2013.admin.shiro.ShiroKit;
import com.xm2013.admin.shiro.dto.ShiroUser;
import com.xm2013.admin.validator.Validator;

/**
 * 菜单管理
 */
public class MenuController extends BaseController{
	
	@Inject
	private MenuService menuService;
	
	/**
	 * 获取当前用户的菜单
	 */
	public void curr() {
		renderJson(JsonResult.ok(Msg.OK_GET, menuService.curr(ShiroKit.getLoginUser())));
	}

	/**
	 * 根据id获取菜单， 如果不传入任何参数，则返回根节点
	 */
	@RequirePermission(val="sys:menu:list", name="获取菜单列表", group="system")
	@Op("获取菜单列表")
	public void list() {
		int id = getParaToInt("id", 0);
		
		renderJson(JsonResult.ok(Msg.OK_GET, menuService.list(id)));
		
	}
	
	/**
	 * 新增或者更新，如果存在id则更新
	 */
	@RequirePermissions(logical = Logical.OR, value = {
		@Per(name="新增菜单", val="sys:menu:update", group="system"),
		@Per(name="编辑菜单", val="sys:menu:create", group="system")
	})
	@Op("新增更新菜单")
	public void saveOrUpdate() {
		Menu menu = JsonKit.getObject(getRawData(), Menu.class);
		if(menu == null) {
			return ;
		}
		
		Validator validator = new Validator();
		validator.exec(menu, "create", false);
		if(validator.hasError()) {
			throw new BusinessException(BusinessErr.ERROR, validator.getError());
		}
		
		ShiroUser user = ShiroKit.getLoginUser();
		
		String msg = "";
		if(menu.getId() == null || menu.getId() == 0) {
			menuService.create(menu, user);
			msg = Msg.OK_CREATED;
		}else {
			menuService.update(menu, user);
			msg = Msg.OK_UPDATE;
		}
		
		renderJson(JsonResult.ok(msg, user.getId()));
		
	}
	
	/**
	 * 删除菜单
	 */
	@RequirePermission(val="sys:menu:list", name="获取菜单列表", group="system")
	@Op("获取菜单列表")
	public void delete() {
		int id = getParaToInt("id");
		if(id == 0) {
			throw new BusinessException(BusinessErr.INVALID_PARAM);
		}
		
		if(id == 1) {
			throw new BusinessException(BusinessErr.ERROR, "根菜单禁止删除");
		}
		
		menuService.delete(id);
		renderJson(JsonResult.ok(Msg.OK_DELETE));
		
	}
	
}
