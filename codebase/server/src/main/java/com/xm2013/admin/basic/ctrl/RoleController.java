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

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.jfinal.aop.Inject;
import com.xm2013.admin.annotation.Op;
import com.xm2013.admin.annotation.RequirePermission;
import com.xm2013.admin.basic.service.PermissionService;
import com.xm2013.admin.basic.service.RoleService;
import com.xm2013.admin.common.kits.JsonKit;
import com.xm2013.admin.domain.dto.JsonResult;
import com.xm2013.admin.domain.dto.PageInfo;
import com.xm2013.admin.domain.dto.basic.RoleListQuery;
import com.xm2013.admin.domain.model.Role;
import com.xm2013.admin.domain.model.RoleMenu;
import com.xm2013.admin.exception.BusinessErr;
import com.xm2013.admin.exception.Msg;
import com.xm2013.admin.shiro.ShiroKit;
import com.xm2013.admin.shiro.dto.ShiroUser;
import com.xm2013.admin.validator.Validator;

/**
 * 角色管理，
 * 原则： 
 * 查看： 非管理员只能看到自己创建的和自己数据权限之内的角色，管理员能看到所有的角色，
 * 编辑：非管理官员只能编辑自己创建的和自己数据权限之内的角色，管理员能编辑除了前4个之外的所有角色
 * 删除：只能删除自己创建的和自己数据权限只能的角色，管理员能删除除了前4之外的所有角色
 */
public class RoleController extends BaseController{
	
	@Inject
	private RoleService roleService;
	@Inject
	private PermissionService permissionService;
		
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
//			throw new BusinessException(BusinessErr.INVALID_PARAM, validator.getError());
			renderJson(JsonResult.error(BusinessErr.ERROR.setMsg(validator.getError())));
			return;
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
//			throw new BusinessException(BusinessErr.INVALID_PARAM, validator.getError());
			renderJson(JsonResult.error(BusinessErr.ERROR.setMsg(validator.getError())));
			return;
		} 
		
		ShiroUser user = ShiroKit.getLoginUser();
		roleService.update(role, user);
		
		renderJson(JsonResult.ok(Msg.OK_UPDATE));
	}
	
	@RequirePermission(val="sys:role:delete", name="删除角色", group="system")
	@Op("删除角色")
	public void deletes() {
		String ids = getPara("ids");
		if(ids == null || !ids.matches("[\\d,]+")) {
//			throw new BusinessException(BusinessErr.NULL_PARAM);
			renderJson(JsonResult.error(BusinessErr.NULL_PARAM));
			return;
		}
		
		roleService.deletes(ids, ShiroKit.getLoginUser());
		
		renderJson(JsonResult.ok(Msg.OK_DELETE));
	}
	
	/**
	 * 更新角色权限
	 * @QueryParam id: roleId
	 * @Body: [permissionId]
	 */
	@RequirePermission(val="sys:role:grant:permission", name="分配权限", group="system")
	@Op("分配权限")
	public void grantPermissions() {
		List<Integer> permissionIds = JsonKit.getList(getRawData(), Integer.class);
		if(permissionIds == null) {
			renderJson(JsonResult.error(BusinessErr.INVALID_PARAM));
			return;
		}
		
		int roleId = getInt("id", 0);
		if(roleId == 0) {
			renderJson(JsonResult.error(BusinessErr.INVALID_PARAM.setMsg(Msg.ID_NULL)));
			return;
		}
		
		String result = roleService.grantPermissions(roleId, permissionIds, ShiroKit.getLoginUser());
		if(result == null) {
			// 权限分配成功后，清除相关用户的权限缓存
			roleService.clearUserAuthorizationCache(roleId);
			renderJson(JsonResult.ok(Msg.OK_UPDATE));
		}else {
			renderJson(JsonResult.error(result));
		}
	}
	
	/**
	 * 更新角色菜单
	 * @QueryParam id: roleId
	 * @Body: [permissionId]
	 */
	@RequirePermission(val="sys:role:grant:menu", name="分菜单", group="system")
	@Op("分配权限")
	public void grantMenus() {
		List<RoleMenu> roleMenus = JsonKit.getList(getRawData(), RoleMenu.class);
		if(roleMenus == null) {
			renderJson(JsonResult.error(BusinessErr.INVALID_PARAM));
		}
		
		int roleId = getInt("id", 0);
		if(roleId == 0) {
			renderJson(JsonResult.error(BusinessErr.INVALID_PARAM.setMsg(Msg.ID_NULL)));
		}
		
		String result = roleService.grantMenus(roleId, roleMenus, ShiroKit.getLoginUser());
		if(result == null) {
			renderJson(JsonResult.ok(Msg.OK_UPDATE));
		}else {
			renderJson(JsonResult.error(result));
		}
	}
	
}
