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
import java.util.List;
import java.util.stream.Collectors;

import com.jfinal.aop.Inject;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;
import com.xm2013.admin.common.Kit;
import com.xm2013.admin.domain.dto.PageInfo;
import com.xm2013.admin.domain.dto.basic.DictQuery;
import com.xm2013.admin.domain.model.Dict;
import com.xm2013.admin.domain.model.DictGroup;
import com.xm2013.admin.exception.Msg;
import com.xm2013.admin.shiro.dto.ShiroUser;

public class DictService {
	@Inject
	private DocumentService documentService;
	

	public List<DictGroup> groups() {
		return DictGroup.dao.findAll();
	}

	public PageInfo<Dict> dicts(DictQuery query) {
		
		String sql = "select t.*, t1.label as groupLabel from sys_dict as t left join sys_dict_group as t1 on t1.code = t.group_name where t.group_name=?";
		
		String basicValue = query.getBasicValue();
		if(Kit.isNotNull(basicValue)) {
			sql += " and ( t.dict_key like '%"+basicValue+"%' "
					+ " or t.dict_label like '%"+basicValue+"%')";
		}
		
		List<Dict> dicts = Dict.dao.find(sql, query.getGroupName());
		PageInfo<Dict> page = new PageInfo<Dict>(dicts.size(), dicts);
		
		return page;
	}

	/**
	 * 更新或者保存字段分组
	 * @param dictGroup
	 * @return
	 */
	public String saveOrUpdateGroup(DictGroup dictGroup) {
		
		if(dictGroup.getOldCode()!=null && dictGroup.getOldCode().equals(dictGroup.getCode())== false) {
			Db.delete("delete from sys_dict_group where code=?", dictGroup.getOldCode());
			Db.update("update sys_dict set group_name=? where group_name=?", dictGroup.getCode(), dictGroup.getOldCode());
			dictGroup.save();
			return Msg.OK_UPDATE;
		}else {
			boolean res = dictGroup.update();
			if(res) {
				return Msg.OK_UPDATE;
			}
			
			if(dictGroup.save()) {
				return Msg.OK_CREATED;
			}
		}
		
		return Msg.ERR_UPDATE;
		
	}

	/**
	 * 删除字典
	 * @param groupName
	 */
	public void deleteGroup(String groupName, ShiroUser user) {
		Db.tx(new IAtom() {
			
			@Override
			public boolean run() throws SQLException {
				List<Dict> dicts = Dict.dao.find("select * from sys_dict where group_name=? and type=3", groupName);
				if(!dicts.isEmpty()) {
					dicts.forEach(d -> documentService.deletes(
							dicts.stream().map(s -> s.getId()+"").collect(Collectors.joining(","))
							, user));
				}
				Db.delete("delete from sys_dict_group where code=?", groupName);
				Db.delete("delete from sys_dict where group_name=?", groupName);
				return true;
			}
		});
	}

	/**
	 * 保存字典数据
	 * @param dict
	 */
	public void save(Dict dict) {
		try {
			new DictGroup().setCode(dict.getGroupName())
				.setLabel(dict.getGroupName())
				.save();
		} catch (Exception e) {
			// TODO: handle exception
		}
		
		if(Kit.isNull(dict.getRemark())) {
			dict.remove(Dict.COL_REMARK);
		}
		dict.save();
		
	}

	/**
	 * 更新字典数据
	 * @param dict
	 */
	public void update(Dict dict) {
		if(Kit.isNull(dict.getRemark())) {
			dict.remove(Dict.COL_REMARK);
		}
		dict.update();
	}

	/**
	 * 删除字典数据
	 * @param id
	 */
	public void delete(int id, ShiroUser user) {
		Dict dict = Dict.dao.findById(id);
		if(dict!=null && dict.getType() == 3) {  //删除对应的图片
			documentService.deletes(dict.getId()+"", user);
		}
		Db.delete("delete from sys_dict where id=?", id);
	}

	public List<Dict> byKey(String key) {
		return Dict.dao.find("select * from sys_dict where group_name=?", key);
	}
	
	
}
