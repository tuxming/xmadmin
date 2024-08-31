package com.xm2013.admin.basic.service;

import java.util.List;

import com.jfinal.plugin.activerecord.Db;
import com.xm2013.admin.common.Kit;
import com.xm2013.admin.common.SqlKit;
import com.xm2013.admin.domain.dto.PageInfo;
import com.xm2013.admin.domain.dto.basic.RoleListQuery;
import com.xm2013.admin.domain.model.Role;
import com.xm2013.admin.exception.BusinessErr;
import com.xm2013.admin.exception.BusinessException;
import com.xm2013.admin.exception.Msg;
import com.xm2013.admin.shiro.dto.ShiroRole;
import com.xm2013.admin.shiro.dto.ShiroUser;

public class RoleService {
	
	/**
	 * 根据用户id查找角色
	 * @param userId
	 * @return
	 */
	public List<Role> findByUser(int userId){
		
		List<Role> roles = Role.dao.find("select t.* from sys_role as t "
				+ " left join sys_user_role as t1 on t1.role_id=t.id "
				+ " where t1.user_id=?", userId);
		
		return roles;
	}

	public List<Role> search(String key, ShiroUser user) {
		
		key = SqlKit.getSafeValue(key);
		
		String sql = "select t.* from sys_role as t left join sys_user as t1 on t1.id = t.creater "
				+ " where "
				+  user.buildAuthCondition("t1")
				+ " (t.role_name like '%"+key+"%' or t.code like '%"+key+"%')";
		
		List<Role> roles = Role.dao.find(sql);
		
		return roles;
	}

	public PageInfo<Role> pageList(RoleListQuery query, ShiroUser user) {
		PageInfo<Role> page = new PageInfo<Role>();
		
		List<Role> roles = list(query, user);
		page.setList(roles);
		
		
		if(query.getStart() == 0) {
			int total = total(query, user);
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
	public List<Role> list(RoleListQuery query, ShiroUser user) {
		
		String sql = "select t.*, t1.fullname as createrName from sys_role as t "
				+ " left join sys_user as t1 on t1.id = t.creater "
				+ " where "
				+ user.buildAuthCondition("t1");
		
		String where = buildWhere(query, user);
		sql += where + " order by t.id desc limit "
				+query.getStart() + " , " + query.getLength();
		
//		System.out.println(query);
		
		return Role.dao.find(sql);
	}
	
	/**
	 * 查询总数
	 * @param query
	 * @param user
	 * @return
	 */
	public int total(RoleListQuery query, ShiroUser user) {
		
		String sql = " select count(*) from sys_role as t"
				+ " left join sys_user as t1 on t1.id = t.creater "
				+ " where " 
				+ user.buildAuthCondition("t1");
		
		sql += buildWhere(query, user);
		
//		System.out.println(sql);
		Integer total = Db.queryInt(sql);
		return total == null?0: total;
	}
	
	private String buildWhere(RoleListQuery query, ShiroUser user) {
		String where = "";
		
		String basicValue = SqlKit.getSafeValue(query.getBasicValue());
		if(Kit.isNotNull(basicValue)) {
			where += " and ("
					+ " t.role_name like '%"+basicValue+"%' "
					+ " or t.code like '%"+basicValue+"%' "
//					+ " or email like '"+basicValue+"%' "
//					+ " or phone like '"+basicValue+"%'"
					+ ")";
			return where;
		}
		
		where += SqlKit.like("t.role_name", query.getName());
		where += SqlKit.eq("t.code", query.getCode());
		where += SqlKit.inNo("t.type", query.getTypes());
		where += SqlKit.inNo("t.creater", query.getCreaters());
		
		return where;
	}
	
	/**
	 * 创建角色
	 * @param role
	 * @param user 
	 */
	public void create(Role role, ShiroUser user) {
		
		List<ShiroRole> roles = user.getRoles();
		int type = role.getType();
		if(role.getType() == 0) {
			throw new BusinessException(BusinessErr.ERR_NO_AUTH, Msg.ROLE_NOT_CREATE_SYS_ROLE);
		}else if(type == 1) {
			boolean exist = false;
			for (ShiroRole shiroRole : roles) {
				if(shiroRole.getType() <= 1) {
					exist = true;
					break;
				}
			}
			if(!exist) {
				throw new BusinessException(BusinessErr.ERR_NO_AUTH, Msg.ROLE_NOT_CREATE_SUPER_ROLE);
			}
		}else if(type == 2) {
			boolean exist = false;
			for (ShiroRole shiroRole : roles) {
				if(shiroRole.getType() <= 2) {
					exist = true;
					break;
				}
			}
			if(!exist) {
				throw new BusinessException(BusinessErr.ERR_NO_AUTH, Msg.ROLE_NOT_CREATE_ADMIN_ROLE);
			}
		}
		
		role.save();
	}

	public void update(Role role, ShiroUser user) {
//		int type = role.getType();
		if(role.getId()<=4) {
			throw new BusinessException(BusinessErr.ERR_NO_AUTH, Msg.ROLE_NOT_EDIT_SYS_ROLE);
		}
		
		role.update();
	}

	public void deletes(String ids) {
		Db.delete("delete from sys_role where id in ("+ids+")");
	}
	
}
