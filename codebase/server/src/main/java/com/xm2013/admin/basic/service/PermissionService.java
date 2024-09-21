package com.xm2013.admin.basic.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.jfinal.aop.Inject;
import com.jfinal.plugin.activerecord.Db;
import com.xm2013.admin.common.Kit;
import com.xm2013.admin.common.SqlKit;
import com.xm2013.admin.domain.dto.PageInfo;
import com.xm2013.admin.domain.dto.Query;
import com.xm2013.admin.domain.model.Permission;
import com.xm2013.admin.domain.model.Role;
import com.xm2013.admin.exception.BusinessErr;
import com.xm2013.admin.exception.BusinessException;
import com.xm2013.admin.shiro.dto.ShiroUser;

public class PermissionService {
	
	@Inject
	public RoleService roleService;
	
	/**
	 * 根据角色id查找权限
	 * @param roleIds = 1,2,3,4
	 * @return
	 */
	public List<Permission> findByRole(String roleIds){
		return Permission.dao.find("select t.* from sys_permission as t "
				+ " left join sys_role_permission as t1 on t1.permission_id = t.id "
				+ " where t1.role_id in (?) ", roleIds);
	}

	public Permission findById(Integer id) {
		return Permission.dao.findById(id);
	}

	public PageInfo<Permission> pageList(Query query, ShiroUser user) {
		PageInfo<Permission> page = new PageInfo<Permission>();
		
		List<Permission> roles = list(query, user);
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
	public List<Permission> list(Query query, ShiroUser user) {
		
		String sql = "select * from sys_permission "
				+ " where 1=1 ";
		
		String where = buildWhere(query, user);
		sql += where + " order by group_name asc limit "
				+query.getStart() + " , " + query.getLength();
		
//		System.out.println(query);
		
		return Permission.dao.find(sql);
	}
	
	/**
	 * 查询总数
	 * @param query
	 * @param user
	 * @return
	 */
	public int total(Query query, ShiroUser user) {
		
		String sql = " select count(*) from sys_permission as t where 1=1 ";
		
		sql += buildWhere(query, user);
		
//		System.out.println(sql);
		Integer total = Db.queryInt(sql);
		return total == null?0: total;
	}
	
	private String buildWhere(Query query, ShiroUser user) {
		String where = "";
		
		
		String basicValue = SqlKit.getSafeValue(query.getBasicValue());
		if(Kit.isNotNull(basicValue)) {
			where += " and ("
					+ " group_name like '%"+basicValue+"%' "
					+ " or name like '%"+basicValue+"%' "
					+ " or expression like '%"+basicValue+"%' "
//					+ " or phone like '"+basicValue+"%'"
					+ ")";
			return where;
		}
		
		
		return where;
	}

	public void create(Permission permission) {
		permission.save();
		
	}

	public void update(Permission permission) {
		permission.update();
	}

	public void deletes(String ids) {
		Db.delete("delete from sys_permission where id in ("+ids+")");
	}

	/**
	 * 获取所有的权限，管理员可以获取到所有的权限列表，
	 * 普通用户只能获取到分配给他的权限
	 */
	public List<Permission> all(ShiroUser user) {
		if(user.isAdmin()) {
			return Permission.dao.findAll();
		}
		
		String roleIds = user.getRoles().stream().map(s -> s.getId()+"").collect(Collectors.joining(","));
		
		return Permission.dao.find("select t.* from sys_permission as t left join sys_role_permission where role_id in ("+roleIds+")");
	}

	public List<Permission> findAll() {
		
		return Permission.dao.findAll();
	}

	/**
	 * 指定的角色的所有权限，
	 * 先判断这个角色是否拥有
	 */
	public List<Permission> byRole(int roleId, ShiroUser loginUser) {

		if(!loginUser.isAdmin()) {
			List<Role> ownerRoles = roleService.findOwnerRoles(loginUser);
			Optional<Role> exist = ownerRoles.stream().filter(r -> r.getId() == roleId).findFirst();
			if(!exist.isPresent()) {
				throw new BusinessException(BusinessErr.ERR_NO_AUTH);
			}
		}
		
		return findByRole(roleId+"");
	}
	
}
