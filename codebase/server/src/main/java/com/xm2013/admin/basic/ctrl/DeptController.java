package com.xm2013.admin.basic.ctrl;

import com.jfinal.aop.Inject;
import com.xm2013.admin.annotation.Op;
import com.xm2013.admin.annotation.RequirePermission;
import com.xm2013.admin.basic.service.DeptService;
import com.xm2013.admin.common.kits.JsonKit;
import com.xm2013.admin.domain.dto.JsonResult;
import com.xm2013.admin.domain.dto.basic.DeptQuery;
import com.xm2013.admin.domain.model.Dept;
import com.xm2013.admin.exception.BusinessErr;
import com.xm2013.admin.exception.Msg;
import com.xm2013.admin.shiro.ShiroKit;
import com.xm2013.admin.validator.Validator;

public class DeptController extends BaseController{
	
	@Inject
	private DeptService deptService;
	
	/**
	 * 根据parentId获取菜单， 如果不传入任何参数，则返回所能拿到最大的根节点
	 * 如果没有传parentId则直接获取当前登录的组织节点
	 */
	@RequirePermission(val="sys:dept:list", name="组织列表", group="system")
	@Op("获取组织列表")
	public void list() {
		DeptQuery query = JsonKit.getObject(getRawData(), DeptQuery.class);
	
		if(query == null) {
//			throw new BusinessException(BusinessErr.NULL_PARAM);
			renderJson(JsonResult.error(BusinessErr.NULL_PARAM));
			return;
		}
		
		renderJson(JsonResult.ok(Msg.OK_GET, deptService.pageList(query, ShiroKit.getLoginUser())));
		
	}
	
	
	@RequirePermission(val="sys:dept:create", name="创建组织", group="system")
	@Op("创建组织")
	public void create() {
		Dept dept = JsonKit.getObject(getRawData(), Dept.class);
		
		if(dept == null) {
			renderJson(JsonResult.error(BusinessErr.NULL_PARAM));
			return;
		}

		Validator validator = new Validator();
		validator.exec(dept, "create", false);
		if(validator.hasError()) {
//			throw new BusinessException(BusinessErr.INVALID_PARAM, validator.getError());
			renderJson(JsonResult.error(BusinessErr.ERROR.setMsg(validator.getError())));
			return;
		}
		
		int deptId = deptService.create(dept, ShiroKit.getLoginUser());
		renderJson(JsonResult.ok(Msg.OK_CREATED, deptId));
	}
	
	@RequirePermission(val="sys:dept:update", name="编辑组织", group="system")
	@Op("编辑组织")
	public void update() {
		Dept dept = JsonKit.getObject(getRawData(), Dept.class);
		if(dept == null || dept.getId() == null || dept.getId()==0) {
			renderJson(JsonResult.error(BusinessErr.NULL_PARAM));
			return;
		}
		
		Validator validator = new Validator();
		validator.exec(dept, "create", false);
		if(validator.hasError()) {
//			throw new BusinessException(BusinessErr.INVALID_PARAM, validator.getError());
			renderJson(JsonResult.error(BusinessErr.ERROR.setMsg(validator.getError())));
			return;
		}
		
		deptService.update(dept, ShiroKit.getLoginUser());
		
		renderJson(JsonResult.ok(Msg.OK_UPDATE));
	}
	
	@RequirePermission(val="sys:dept:delete", name="删除组织", group="system")
	@Op("删除组织")
	public void delete() {
		int id = getParaToInt("id", 0);
		if(id == 0) {
//			throw new BusinessException(BusinessErr.INVALID_PARAM);
			renderJson(JsonResult.error(BusinessErr.INVALID_PARAM));
			return;
		}
		
		String result = deptService.delete(id, ShiroKit.getLoginUser());
		if(result != null) {
			renderJson(JsonResult.error(Msg.ERR_DELETE, result));
		}else {
			renderJson(JsonResult.ok(Msg.OK_DELETE));
		}
		
	}
	
}
