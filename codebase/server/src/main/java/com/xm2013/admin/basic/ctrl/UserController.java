package com.xm2013.admin.basic.ctrl;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.log4j.Logger;

import com.jfinal.aop.Inject;
import com.xm2013.admin.annotation.Op;
import com.xm2013.admin.annotation.RequirePermission;
import com.xm2013.admin.basic.service.UserService;
import com.xm2013.admin.common.kits.JsonKit;
import com.xm2013.admin.domain.dto.JsonResult;
import com.xm2013.admin.domain.dto.PageInfo;
import com.xm2013.admin.domain.dto.user.UserListQuery;
import com.xm2013.admin.domain.model.User;
import com.xm2013.admin.exception.BusinessErr;
import com.xm2013.admin.exception.BusinessException;
import com.xm2013.admin.exception.Msg;
import com.xm2013.admin.shiro.ShiroKit;

public class UserController extends BaseController{
	
	private static Logger log = Logger.getLogger(UserController.class);
	
	@Inject
	private UserService userService;
	
	/**
	 * 获取指定的用户信息，只能获取到有权限的用户信息
	 */
//	@RequirePermissions(value={@Per(val="user:get", name="查看用户信息")})
	@RequirePermission(val="sys:user:get", name="查看用户信息", group="system")
	@Op("查看用户信息")
	public void get() {
		int id = getInt("id", 0);
		if(id == 0) {
			throw new BusinessException(BusinessErr.NULL_PARAM);
		}
		
		User user = userService.findById(id);
		user.remove(User.COL_PASSWORD, User.COL_CREATED);
		
		log.debug("获取到用户信息"+user);
		
		renderJson(JsonResult.ok(Msg.OK_GET, user));
	}
	
	/**
	 * 关键字搜索
	 * 返回key：value形式：key=id, value=显示的值
	 */
	public void search() {
		String key = getPara("k", "");
		
		List<User> roles = userService.search(key, ShiroKit.getLoginUser());
		
		Map<String, String> options = roles.stream()
				.collect(Collectors.toMap(
					k -> k.getId()+"", 
					v -> (v.getFullname()+"("+v.getUsername()+")"), 
					(k1, k2)->k1
				));
		
		renderJson(JsonResult.ok(Msg.OK_GET, options));
	}
	
	/**
	 * 用户列表
	 */
	@RequirePermission(val="sys:user:list", name="用户列表", group="system")
	@Op("用户列表")
	public void list() {
		UserListQuery query = JsonKit.getObject(getRawData(), UserListQuery.class);
		
		if(query == null) {
			throw new BusinessException(BusinessErr.NULL_PARAM);
		}
		
		PageInfo<User> users = userService.pageList(query, ShiroKit.getLoginUser());
		renderJson(JsonResult.ok(Msg.OK_GET, users));
	}
	
	
}
