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

import org.apache.shiro.authz.annotation.Logical;

import com.jfinal.aop.Inject;
import com.xm2013.admin.annotation.Op;
import com.xm2013.admin.annotation.Per;
import com.xm2013.admin.annotation.RequirePermission;
import com.xm2013.admin.annotation.RequirePermissions;
import com.xm2013.admin.basic.service.DictService;
import com.xm2013.admin.common.Kit;
import com.xm2013.admin.common.kits.JsonKit;
import com.xm2013.admin.domain.dto.JsonResult;
import com.xm2013.admin.domain.dto.PageInfo;
import com.xm2013.admin.domain.dto.basic.DictQuery;
import com.xm2013.admin.domain.model.Dict;
import com.xm2013.admin.domain.model.DictGroup;
import com.xm2013.admin.exception.BusinessErr;
import com.xm2013.admin.exception.Msg;
import com.xm2013.admin.shiro.ShiroKit;
import com.xm2013.admin.validator.Validator;

public class DictController extends BaseController{
	
	@Inject
	private DictService dictService;
	
	/**
	 * 获取字典的分类
	 */
	public void groups() {
		List<DictGroup> groups = dictService.groups();
		renderJson(JsonResult.ok(Msg.OK_GET, groups));
	}
	
	/**
	 * 获取字典列表
	 */
	public void dicts() {
		DictQuery query = JsonKit.getObject(getRawData(), DictQuery.class);
		if(query == null) {
			renderJson(JsonResult.error(BusinessErr.INVALID_PARAM));
			return;
		}
		
		if(Kit.isNull(query.getGroupName())) {
			renderJson(JsonResult.error(BusinessErr.INVALID_PARAM));
			return;
		}
		
		
		PageInfo<Dict> dicts = dictService.dicts(query);
		renderJson(JsonResult.ok(Msg.OK_GET, dicts));
		
	}
	
	/**
	 * 新增或者更新字典名（字典分类）
	 */
	@RequirePermissions(logical = Logical.OR, value = {
		@Per(name="新增字典", val="sys:dictGroup:create", group="system"),
		@Per(name="更新字典", val="sys:dictGroup:update", group="system")
	})
	@Op("新增更新字典名")
	public void saveOrUpdateGroup() {
		DictGroup dictGroup = JsonKit.getObject(getRawData(), DictGroup.class);
		
		Validator v = new Validator();
		v.exec(dictGroup, "create", false);
		
		if(v.hasError()) {
			renderJson(JsonResult.error(BusinessErr.ERROR.setMsg(v.getError())));
			return;
		}
		
		if(Kit.isNull(dictGroup.getRemark())) {
			dictGroup.setRemark("");
		}
		
		renderJson(JsonResult.ok(dictService.saveOrUpdateGroup(dictGroup)));
		
	}
	
	/**
	 * 删除字典名（字典分类）
	 */
	@RequirePermission(val="sys:dictGroup:delete", name="删除字典名", group="system")
	@Op("删除字典名")
	public void deleteGroup() {
		String groupName = getPara("code");
		if(Kit.isNull(groupName)) {
			renderJson(JsonResult.error(BusinessErr.INVALID_PARAM));
			return;
		}
		
		dictService.deleteGroup(groupName, ShiroKit.getLoginUser());
		renderJson(JsonResult.ok(Msg.OK_DELETE));
	}
	
	@RequirePermission(val="sys:dict:add", name="添加字典", group="system")
	@Op("添加字典")
	public void addDict() {
		Dict dict = JsonKit.getObject(getRawData(), Dict.class);
		
		Validator v = new Validator();
		v.exec(dict, "create", false);
		
		if(v.hasError()) {
			renderJson(JsonResult.error(BusinessErr.ERROR.setMsg(v.getError())));
			return;
		}
		
		if(dict.getId() != null) {
			dict.remove(Dict.COL_ID);
		}
		dictService.save(dict);
		renderJson(JsonResult.ok(Msg.OK_CREATED));
	}
	
	@RequirePermission(val="sys:dict:update", name="更新字典", group="system")
	@Op("更新字典")
	public void updateDict() {
		Dict dict = JsonKit.getObject(getRawData(), Dict.class);
		
		Validator v = new Validator();
		v.execUnion(dict, "update", false);
		
		if(v.hasError()) {
			renderJson(JsonResult.error(BusinessErr.ERROR.setMsg(v.getError())));
			return;
		}
		
		dictService.update(dict);
		renderJson(JsonResult.ok(Msg.OK_UPDATE));
	}
	
	@RequirePermission(val="sys:dict:delete", name="删除字典", group="system")
	@Op("删除字典")
	public void deleteDict() {
		int id = getParaToInt("id", 0);
		if(id == 0) {
			renderJson(JsonResult.error(Msg.ID_NULL));
			return ;
		}
		
		dictService.delete(id, ShiroKit.getLoginUser());
		renderJson(JsonResult.ok(Msg.OK_DELETE));
	}
	
	public void byKey() {
		String key = get("key");
		if(Kit.isNull(key)) {
			renderJson(JsonResult.error(BusinessErr.INVALID_PARAM));
			return;
		}
		
		renderJson(JsonResult.ok(Msg.OK_GET, dictService.byKey(key)));
		
	}
	
}

