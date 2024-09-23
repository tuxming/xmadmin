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

import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.xm2013.admin.common.Kit;
import com.xm2013.admin.common.SqlKit;
import com.xm2013.admin.domain.dto.PageInfo;
import com.xm2013.admin.domain.dto.basic.HistoryQuery;
import com.xm2013.admin.domain.model.History;
import com.xm2013.admin.shiro.dto.ShiroUser;

public class HistoryService {

	public History get(String historyId) {
		
		String sql = "select user_id, username, ip_addr, type, created, group_concat(remark order by id SEPARATOR '') as remark "
				+ " from sys_history "
				+ " where history_id=? group by history_id limit 1";
		
		return History.dao.findFirst(sql, historyId);
	}

	public PageInfo<History> pageList(HistoryQuery query, ShiroUser user) {
		PageInfo<History> page = new PageInfo<History>();
		
		List<History> users = list(query, user);
		page.setList(users);
		
		
		if(query.getStart() == 0) {
			int total = total(query, user);
			page.setTotal(total);
		}
		
		return page;
	}

	private List<History> list(HistoryQuery query, ShiroUser user) {
		String sql = "select t.* from sys_history as t "
				+ " where 1=1 ";
		
		String where = buildWhere(query, user);
		sql += where + " order by t.id desc limit "
				+query.getStart() + " , " + query.getLength();
		
		
		return History.dao.find(sql);
	}
	
	private int total(HistoryQuery query, ShiroUser user) {
		String sql ="select count(*) from sys_history as t where 1=1 "+buildWhere(query, user);
		Integer total = Db.queryInt(sql);
		return total == null?0: total;
	}
	
	private String buildWhere(HistoryQuery query, ShiroUser user) {
		String where = "";
		String basicValue = SqlKit.getSafeValue(query.getBasicValue());
		if(Kit.isNotNull(basicValue)) {
			where += " and ("
					+ " t.username like '"+basicValue+"%' "
					+ " or t.type like '"+basicValue+"%' "
					+ ")";
			return where;
		}
		
		where += SqlKit.eq("t.user_id", query.getUserId());
		where += SqlKit.eq("t.ip_addr", query.getIpAddr());
		where += SqlKit.in("t.type", query.getTypes());
		where += SqlKit.like("t.remark", query.getRemark());
		
		
		where += SqlKit.buildDateRange("t.created", query.getStartDate(), query.getEndDate());
		return where;
	}

	public void deletes(String ids) {
		Db.delete("delete from sys_history where id in ("+ids+")");
	}


}
