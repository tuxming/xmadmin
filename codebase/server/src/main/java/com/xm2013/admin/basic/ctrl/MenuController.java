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
	 * 获取当前登录用户的菜单
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
			JsonResult.error(BusinessErr.ERROR.setMsg(validator.getError()));
			return;
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
	@RequirePermission(val="sys:menu:delete", name="删除菜单", group="system")
	@Op("获取菜单列表")
	public void delete() {
		int id = getParaToInt("id");
		if(id == 0) {
			renderJson(JsonResult.error(BusinessErr.INVALID_PARAM));
			return;
		}
		
		if(id == 1) {
			renderJson(JsonResult.error(BusinessErr.ERROR.setMsg("根菜单禁止删除")));
			return;
		}
		
		menuService.delete(id);
		renderJson(JsonResult.ok(Msg.OK_DELETE));
	}
	

	/**
	 * 获取指定角色的所有菜单
	 */
	public void byRole() {
		int roleId = getParaToInt("id", 0);
		if(roleId == 0) {
			renderJson(JsonResult.error(BusinessErr.INVALID_PARAM));
		}

		renderJson(JsonResult.ok(Msg.OK_GET, menuService.findByRole(roleId, ShiroKit.getLoginUser())));
	}
	
}
