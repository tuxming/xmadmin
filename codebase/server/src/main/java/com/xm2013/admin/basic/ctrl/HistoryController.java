package com.xm2013.admin.basic.ctrl;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import com.jfinal.aop.Inject;
import com.xm2013.admin.annotation.Op;
import com.xm2013.admin.annotation.RequirePermission;
import com.xm2013.admin.basic.service.HistoryService;
import com.xm2013.admin.common.kits.JsonKit;
import com.xm2013.admin.domain.dto.JsonResult;
import com.xm2013.admin.domain.dto.PageInfo;
import com.xm2013.admin.domain.dto.basic.HistoryQuery;
import com.xm2013.admin.domain.model.History;
import com.xm2013.admin.exception.BusinessErr;
import com.xm2013.admin.exception.BusinessException;
import com.xm2013.admin.exception.Msg;
import com.xm2013.admin.shiro.ShiroKit;

public class HistoryController extends BaseController{
	
	@Inject
	private HistoryService historyService;
	
	@RequirePermission(val="sys:history:get", name="查看日志详情", group="system")
	public void get() {
		String historyId = getPara("historyId");
		if(historyId == null) {
			throw new BusinessException(BusinessErr.INVALID_PARAM);
		}
		
//		List<History> histories = historyService.get();
		History history = historyService.get(historyId);
		renderJson(JsonResult.ok(Msg.OK_GET, history));
	}
	
	@RequirePermission(val="sys:history:list", name="查看日志列表", group="system")
	@Op("查看日志列表")
	public void list() {
		HistoryQuery query = JsonKit.getObject(getRawData(), HistoryQuery.class);
		
		if(query == null) {
			throw new BusinessException(BusinessErr.NULL_PARAM);
		}
		
		PageInfo<History> users = historyService.pageList(query, ShiroKit.getLoginUser());
		renderJson(JsonResult.ok(Msg.OK_GET, users));
	}
	
	@RequirePermission(val="sys:history:delete", name="删除日志", group="system")
	@Op("删除日志")
	public void deletes() {
		String ids = getPara("ids");
		if(ids == null || !ids.matches("[\\d,]+")) {
			throw new BusinessException(BusinessErr.NULL_PARAM);
		}
		
		List<Integer> idsList = Arrays.asList(ids.split(","))
				.stream().map(id -> Integer.parseInt(id))
				.collect(Collectors.toList());
		
		for (Integer id : idsList) {
			if(id<=4) {
				throw new BusinessException(BusinessErr.ERROR, Msg.ROLE_NOT_DELETE_SYS_ROLE);
			}
		}
		
		historyService.deletes(ids);
		
		renderJson(JsonResult.ok(Msg.OK_DELETE));
		
	}
	
}
