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
import java.util.stream.Collectors;

import com.jfinal.aop.Inject;
import com.xm2013.admin.annotation.Op;
import com.xm2013.admin.annotation.RequirePermission;
import com.xm2013.admin.basic.service.LanguageService;
import com.xm2013.admin.common.Kit;
import com.xm2013.admin.common.kits.JsonKit;
import com.xm2013.admin.domain.dto.JsonResult;
import com.xm2013.admin.domain.dto.PageInfo;
import com.xm2013.admin.domain.dto.basic.LangResourceQuery;
import com.xm2013.admin.domain.model.Language;
import com.xm2013.admin.domain.model.LanguageResource;
import com.xm2013.admin.domain.model.LanguageResourceGroup;
import com.xm2013.admin.exception.BusinessErr;
import com.xm2013.admin.exception.Msg;
import com.xm2013.admin.validator.Validator;

public class LangController extends BaseController{
	
	@Inject
	private LanguageService langService;
	
	/**
	 * 获取资源的分组
	 */
	public void groups() {
		List<LanguageResourceGroup> groups = langService.groups();
		renderJson(JsonResult.ok(Msg.OK_GET, groups.stream().map(s -> s.getName()).collect(Collectors.toList())));
	}
	
	/**
	 * 获取资源分组列表
	 */
	public void langs() {
		List<Language> langs = langService.langs();
		renderJson(JsonResult.ok(Msg.OK_GET, langs));
	}
	
	/**
	 * 获取资源的列表
	 */
	public void resources() {
		LangResourceQuery query = JsonKit.getObject(getRawData(), LangResourceQuery.class);
		
		if(query == null) {
			renderJson(JsonResult.error(BusinessErr.INVALID_PARAM));
			return;
		}
		
		if(Kit.isNull(query.getGroupName())) {
			renderJson(JsonResult.error(Msg.ERR_GET));
			return;
		}
		
		PageInfo<LanguageResource> resources = langService.resources(query);
		renderJson(JsonResult.ok(Msg.OK_GET, resources));
	}
	
	/**
	 * 保存语言
	 */
	@Op("保存语言")
	@RequirePermission(val="sys:lang:create", name="保存语言", group="system")
	public void addLang() {
		Language lang = JsonKit.getObject(getRawData(), Language.class);
		
		Validator v = new Validator();
		v.exec(lang, "create", false);
		if(v.hasError()) {
			renderJson(JsonResult.error(v.getError()));
			return;
		}
		
		Integer id = langService.saveLang(lang);
		if(id == null || id == 0){
			renderJson(JsonResult.error(Msg.ERR_CREATE));
		}else {
			renderJson(JsonResult.ok(Msg.OK_CREATED, id));
		}
	}
	
	@Op("编辑语言")
	@RequirePermission(val="sys:lang:edit", name="更新语言", group="system")
	public void updateLang() {
		Language lang = JsonKit.getObject(getRawData(), Language.class);
		
		Validator v = new Validator();
		v.exec(lang, "create", false);
		
		String msg = null;
		if(v.hasError()) {
			msg = v.getError();
		}
		
		if(lang.getId() == null || lang.getId() == 0) {
			msg = Msg.ID_NULL;
		}else if(lang.getId() == 1) {
			msg = Msg.DISABLE_EDIT;
		}
		
		if(msg != null) {
			renderJson(JsonResult.error(msg));
			return;
		}
		
		Integer id = langService.updateLang(lang);
		renderJson(JsonResult.ok(Msg.OK_UPDATE, id));
	}
	
	@Op("删除语言")
	@RequirePermission(val="sys:lang:delete", name="删除语言", group="system")
	public void deleteLang() {
		int id = getParaToInt("id", 0);
		
		String msg = null;
		if(id == 0) {
			msg = Msg.ID_NULL;
		}else if(id == 1) {
			msg = Msg.DISABLE_EDIT;
		}
		
		if(msg != null) {
			renderJson(JsonResult.error(msg));
			return;
		}
		
		langService.delete(id);
		renderJson(JsonResult.ok(Msg.OK_DELETE));
	}
	
	@Op("编辑语言资源")
	@RequirePermission(val="sys:res:edit", name="编辑语言资源", group="system")
	public void updateRes() {
		List<LanguageResource> reses = JsonKit.getList(getRawData(), LanguageResource.class);
		
		Validator v = new Validator();
		
		for (LanguageResource res : reses) {
			v.exec(res, "edit", false);
			if(v.hasError()) {
				renderJson(JsonResult.error(v.getError()));
				return;
			}
		}
		
		String result = JsonResult.ok(Msg.OK_GET, langService.updateRes(reses));
		
		renderJson(result);
	}
	
	/**
	 * @param id: 待删除的资源id
	 * @param a: 是否删除所有的语言下面的key的资源, 0-否，1-是
	 */
	@Op("删除语言")
	@RequirePermission(val="sys:res:delete", name="删除语言资源", group="system")
	public void deleteRes() {
		int id = getParaToInt("id");
		int isAll = getParaToInt("a", 0);
		
		langService.deleteRes(id, isAll);
		
		renderJson(JsonResult.ok(Msg.OK_DELETE));
	}
	
	/**
	 * 
	 */
	public void resourceByKey() {
//		String key = getPara("key");
//		if(Kit.isNull(key)) {
//			renderJson(JsonResult.error(BusinessErr.INVALID_PARAM));
//			return;
//		}
//		
//		key = key.replace("'", "\'").replace("\\", "\\\\").replace("--", "\\-\\-");
		
		int id = getParaToInt("id", 0);
		if(id == 0) {
			renderJson(JsonResult.error(BusinessErr.INVALID_PARAM));
			return;
		}
		
		LanguageResource res = LanguageResource.dao.findById(id);
		
		LangResourceQuery query = new LangResourceQuery();
		query.setKey(res.getResKey());
		query.setStart(0);
		query.setLangId(null);
		query.setLength(1000);
		
		List<LanguageResource> resources = langService.list(query);
		renderJson(JsonResult.ok(Msg.OK_GET, resources));
		
	}
	
}
