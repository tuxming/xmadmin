package com.xm2013.admin.basic.ctrl;

import com.jfinal.aop.Inject;
import com.xm2013.admin.annotation.RequirePermission;
import com.xm2013.admin.basic.service.HistoryService;
import com.xm2013.admin.common.JsonKit;
import com.xm2013.admin.domain.dto.HistoryQuery;
import com.xm2013.admin.domain.dto.JsonResult;
import com.xm2013.admin.domain.dto.PageInfo;
import com.xm2013.admin.domain.model.History;
import com.xm2013.admin.exception.BusinessErr;
import com.xm2013.admin.exception.BusinessException;
import com.xm2013.admin.exception.Msg;
import com.xm2013.admin.shiro.ShiroKit;

public class HistoryController extends BaseController{
	
	@Inject
	private HistoryService historyService;
	
	@RequirePermission(val="history:get", name="查看日志详情")
	public void get() {
		String historyId = getPara("historyId");
		if(historyId == null) {
			throw new BusinessException(BusinessErr.INVALID_PARAM);
		}
		
//		List<History> histories = historyService.get();
		History history = historyService.get(historyId);
		renderJson(JsonResult.ok(Msg.OK_GET, history));
	}
	
	@RequirePermission(val="history:get", name="查看日志列表")
	public void list() {
		HistoryQuery query = JsonKit.getObject(getRawData(), HistoryQuery.class);
		
		if(query == null) {
			throw new BusinessException(BusinessErr.NULL_PARAM);
		}
		
		PageInfo<History> users = historyService.pageList(query, ShiroKit.getLoginUser());
		renderJson(JsonResult.ok(Msg.OK_GET, users));
	}
	
	@RequirePermission(val="history:delete", name="删除日志")
	public void deletes() {
		String ids = getPara("ids");
		if(ids == null || !ids.matches("[\\d,]+")) {
			throw new BusinessException(BusinessErr.NULL_PARAM);
		}
		
		historyService.deletes(ids);
		
		renderJson(JsonResult.ok(Msg.OK_DELETE));
		
	}
	
}
