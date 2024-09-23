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

import java.util.Arrays;
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
import com.xm2013.admin.exception.Msg;
import com.xm2013.admin.shiro.ShiroKit;

public class HistoryController extends BaseController{
	
	@Inject
	private HistoryService historyService;
	
	@RequirePermission(val="sys:history:get", name="查看日志详情", group="system")
	public void get() {
		String historyId = getPara("historyId");
		if(historyId == null) {
			renderJson(JsonResult.error(BusinessErr.INVALID_PARAM));
			return;
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
			renderJson(JsonResult.error(BusinessErr.NULL_PARAM));
			return;
		}
		
		PageInfo<History> users = historyService.pageList(query, ShiroKit.getLoginUser());
		renderJson(JsonResult.ok(Msg.OK_GET, users));
	}
	
	@RequirePermission(val="sys:history:delete", name="删除日志", group="system")
	@Op("删除日志")
	public void deletes() {
		String ids = getPara("ids");
		if(ids == null || !ids.matches("[\\d,]+")) {
			renderJson(JsonResult.error(BusinessErr.NULL_PARAM));
			return;
		}
		
		ids = Arrays.asList(ids.split(","))
				.stream().map(id -> Integer.parseInt(id)+"")
				.collect(Collectors.joining(","));
		
		historyService.deletes(ids);
		
		renderJson(JsonResult.ok(Msg.OK_DELETE));
		
	}
	
}
