package com.xm2013.admin.basic.ctrl;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.log4j.Logger;

import com.jfinal.aop.Inject;
import com.xm2013.admin.annotation.Op;
import com.xm2013.admin.annotation.RequirePermission;
import com.xm2013.admin.basic.service.DeptService;
import com.xm2013.admin.basic.service.UserService;
import com.xm2013.admin.common.kits.JsonKit;
import com.xm2013.admin.domain.dto.JsonResult;
import com.xm2013.admin.domain.dto.PageInfo;
import com.xm2013.admin.domain.dto.user.UpdateUserDto;
import com.xm2013.admin.domain.dto.user.UserListQuery;
import com.xm2013.admin.domain.dto.user.UserProfile;
import com.xm2013.admin.domain.model.Dept;
import com.xm2013.admin.domain.model.User;
import com.xm2013.admin.exception.BusinessErr;
import com.xm2013.admin.exception.Msg;
import com.xm2013.admin.shiro.ShiroKit;
import com.xm2013.admin.validator.Validator;

public class UserController extends BaseController{
	
	private static Logger log = Logger.getLogger(UserController.class);
	
	@Inject
	private UserService userService;
	@Inject
	private DeptService deptService;
	
	/**
	 * 获取指定的用户信息，只能获取到有权限的用户信息
	 */
//	@RequirePermissions(value={@Per(val="user:get", name="查看用户信息")})
	@RequirePermission(val="sys:user:get", name="查看用户信息", group="system")
	@Op("查看用户信息")
	public void get() {
		int id = getInt("id", 0);
		if(id == 0) {
			renderJson(JsonResult.error(BusinessErr.INVALID_PARAM));
			return;
		}
		
		User user = userService.findById(id);
		Dept dept = deptService.findById(user.getDeptId());
		UserProfile profile = new UserProfile()
				.setId(user.getId())
				.setCode(user.getCode())
				.setCreated(user.getCreated())
				.setGender(user.getGender())
				.setUsername(user.getUsername())
				.setFullname(user.getFullname())
				.setStatus(user.getStatus())
				.setEmail(user.getEmail())
				.setPhone(user.getPhone())
				.setToken(user.getToken())
				.setPhoto(user.getPhoto())
				
				.setDeptId(user.getDeptId())
			;
		
		if(dept!= null) {
			profile.setDeptName(dept.getName())
			.setDeptPath(dept.getPath())
			.setDeptPathName(dept.getPathName());
		}
		
		log.debug("获取到用户信息"+profile);
		
		renderJson(JsonResult.ok(Msg.OK_GET, profile));
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
			renderJson(JsonResult.error(BusinessErr.INVALID_PARAM));
			return;
		}
		
		PageInfo<User> users = userService.pageList(query, ShiroKit.getLoginUser());
		renderJson(JsonResult.ok(Msg.OK_GET, users));
	}
	
	/**
	 * 创建用户
	 */
	@RequirePermission(val="sys:user:create", name="创建用户", group="system")
	@Op("创建用户")
	public void create() {
		User user = JsonKit.getObject(getRawData(), User.class);
		
		Validator v = new Validator();
		v.exec(user, "create", false);
		
		if(v.hasError()) {
			renderJson(JsonResult.error(v.getError()));
			return;
		}

		String result = userService.create(user, ShiroKit.getLoginUser());
		if(result==null) {
			renderJson(JsonResult.ok(Msg.OK_CREATED));
		}else {
			renderJson(JsonResult.error(Msg.ERR_CREATE));
		}
	}
	
	/**
	 * 创建用户
	 */
	@RequirePermission(val="sys:user:update", name="更新用户", group="system")
	@Op("更新用户")
	public void update() {
		UpdateUserDto user = JsonKit.getObject(getRawData(), UpdateUserDto.class);
		
		if(user == null || user.getId() == null || user.getId() == 0) {
			renderJson(JsonResult.error(BusinessErr.NULL_PARAM));
			return;
		}
		
		userService.update(user, ShiroKit.getLoginUser());
		
		String msg = user.getResultMsg();
		if(msg!=null) {
			renderJson(JsonResult.error(msg));
		}else {
			renderJson(JsonResult.ok(Msg.OK_UPDATE, user.getResultData()));
		}
		
	}
	
	
	/**
	 * 删除用户
	 */
	@RequirePermission(val="sys:user:delete", name="删除用户", group="system")
	@Op("删除用户")
	public void delete() {
		Integer id = getParaToInt("id", 0);
		if(id == 0) {
			renderJson(JsonResult.error(BusinessErr.INVALID_PARAM));
			return;
		}
		
		if(userService.delete(id, ShiroKit.getLoginUser())) {
			renderJson(JsonResult.ok(Msg.OK_DELETE));
		}else {
			renderJson(JsonResult.error(Msg.ERR_DELETE));
		}
		
	}
	
}
