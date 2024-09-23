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

package com.xm2013.admin.basic.service;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;
import com.jfinal.plugin.redis.Redis;
import com.xm2013.admin.common.CacheKey;
import com.xm2013.admin.common.Kit;
import com.xm2013.admin.common.SqlKit;
import com.xm2013.admin.domain.dto.PageInfo;
import com.xm2013.admin.domain.dto.basic.LangResourceQuery;
import com.xm2013.admin.domain.model.Language;
import com.xm2013.admin.domain.model.LanguageResource;
import com.xm2013.admin.domain.model.LanguageResourceGroup;

public class LanguageService {
	
	public static void removeResCache(LanguageResource res) {
		
		if(res==null) return;
		
		Language lang = Language.dao.findById(res.getLanguageId());
		
		Redis.use().hdel(CacheKey.LANG_RES, lang.getCode()+"#"+res.getCategory());
		
	}
	
	/**
	 * 根据语言代码，和分类查询语言资源
	 * @param lng: 语言代码： zh_CN, en, zh_TW
	 * @param ns: 分类
	 * @return
	 */
	public List<LanguageResource> findResources(String lng, String ns) {
		return LanguageResource.dao.findByCache(CacheKey.LANG_RES, lng+"#"+ns,"select t.* from sys_language_resource as t "
				+ " left join sys_language as t1 on t1.id = t.language_id "
				+ " where t1.code=? and t.category=? ", lng, ns);
	}

	/**
	 * 根据语言代码查询语言对象
	 * @param key
	 * @return
	 */
	public Language findLangByKey(String key) {
		return Language.dao.findFirst("select * from sys_language where code=?", key);
	}

	/**
	 * 保存资源
	 * @param res
	 */
	public void saveResource(LanguageResource res) {
		res.save();
		removeResCache(res);
	}
	
	/**
	 * 查询所有的语言资源分类
	 * @return
	 */
	public List<LanguageResourceGroup> groups() {
		return LanguageResourceGroup.dao.findAll();
	}
	
	/**
	 * 查询所有的语言
	 * @return
	 */
	public List<Language> langs() {
		return Language.dao.findByCache(CacheKey.LANGS, "all", "select * from sys_language");
	}

	/**
	 * 分页查询资源列表
	 * @param query
	 * @return
	 */
	public PageInfo<LanguageResource> resources(LangResourceQuery query) {
		
		//这个是默认的，始终会存在
		
		PageInfo<LanguageResource> page = new PageInfo<LanguageResource>();
		
		List<LanguageResource> roles = list(query);
		page.setList(roles);
		
		
		if(query.getStart() == 0) {
			int total = total(query);
			page.setTotal(total);
		}
		
		return page;
		
	}
	
	/**
	 * 查询列表
	 * @param query
	 * @param user
	 * @return
	 */
	public List<LanguageResource> list(LangResourceQuery query) {
		
		String sql = "select * from sys_language_resource as t"
				+ " where ";
		
		String where = buildWhere(query);
		sql += where + " order by id desc limit "
				+query.getStart() + " , " + query.getLength();
		
		return LanguageResource.dao.find(sql);
	}
	
	/**
	 * 查询总数
	 * @param query
	 * @param user
	 * @return
	 */
	public int total(LangResourceQuery query) {
		
		String sql = " select count(*) from sys_language_resource as t "
				+ " where ";
		
		sql += buildWhere(query);
		
//		System.out.println(sql);
		Integer total = Db.queryInt(sql);
		return total == null?0: total;
	}
	
	private String buildWhere(LangResourceQuery query) {
		
		String where = "";
		where += SqlKit.eq("t.language_id", query.getLangId());
		where += SqlKit.eq("t.category", query.getGroupName());
		
		if(Kit.isNotNull(query.getBasicValue())) {
			where += "and (t.res_key like '%"+query.getBasicValue()+"%' "
					+ " or t.res_value like '%"+query.getBasicValue()+"%')";
		}
		
		where += SqlKit.eq("t.res_key", query.getKey());
		where += SqlKit.eq("t.res_value", query.getValue());
		
		where = where.trim();
		if(where.startsWith("and")) {
			where = where.substring(3);
		}
		
		return where;
	}
	
	/**
	 * 保存语言
	 * @param lang
	 * @return
	 */
	public Integer saveLang(Language lang) {
		lang.save();
		Redis.use().hdel(CacheKey.LANGS);
		return lang.getId();
	}

	/**
	 * 更新语言
	 * @param lang
	 * @return
	 */
	public Integer updateLang(Language lang) {
		lang.update();
		Redis.use().hdel(CacheKey.LANGS);
		return lang.getId();
	}
	
	/**
	 * 删除语言
	 * @param id
	 */
	public void delete(int id) {
		Db.tx(new IAtom() {
			
			@Override
			public boolean run() throws SQLException {
				Db.delete("delete from sys_language where id=?", id);
				Db.delete("delete from sys_language_resource where language_id=?", id);
				Redis.use().hdel(CacheKey.LANGS);
				return true;
			}
		});
		
	}
	
	/**
	 * 更新语言资源
	 * @param reses
	 * @return
	 */
	public Map<String, String> updateRes(List<LanguageResource> reses) {
		Map<String, String> msg = new HashMap<String,String>();
		for (LanguageResource res : reses) {
			try {
				if(res.getId() == null || res.getId()==0) {
					res.setId(null);
					res.save();
					msg.put(res.getId()+"", "新增成功");
				}else {
					res.update();
					msg.put(res.getId()+"", "更新成功");
				}
				removeResCache(res);
			} catch (Exception e) {
				msg.put(res.getId()+"", "更新失败:"+e.getMessage());
			}
		}
		return msg;
	}

	/**
	 * 删除语言资源
	 * @param id 语言资源id
	 * @param isAll 是删除与该id的key一样的所有id
	 */
	public void deleteRes(int id, int isAll) {
		
		String idStr = id+"";
		if(isAll == 1) {
			LanguageResource res = LanguageResource.dao.findById(id);
			if(res!=null) {
				idStr = Db.queryStr("select group_concat(id) from sys_language_resource where res_key=? and category=?", res.getResKey(), res.getCategory());
			}
		}
		
		Db.delete("delete from sys_language_resource where id in ("+idStr+")");
		Redis.use().hdel(CacheKey.LANG_RES);
	}
	
	
}
