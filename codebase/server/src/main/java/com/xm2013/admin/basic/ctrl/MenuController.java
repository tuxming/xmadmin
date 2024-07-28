package com.xm2013.admin.basic.ctrl;

import com.jfinal.aop.Inject;
import com.xm2013.admin.annotation.Op;
import com.xm2013.admin.annotation.RequirePermission;
import com.xm2013.admin.basic.service.MenuService;
import com.xm2013.admin.domain.dto.JsonResult;
import com.xm2013.admin.domain.model.Menu;
import com.xm2013.admin.exception.Msg;

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
		renderJson(JsonResult.ok(Msg.OK_GET, Menu.dao.find("select * from sys_menu where parent_id=1 order by sort asc")));
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
	
	
	
	
	
}
