package com.xm2013.admin.basic.ctrl;

import com.jfinal.aop.Inject;
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

	
	
	
}
