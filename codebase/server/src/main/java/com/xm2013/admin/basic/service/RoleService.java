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

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.apache.shiro.SecurityUtils;
import org.apache.shiro.realm.Realm;
import org.apache.shiro.session.mgt.DefaultSessionManager;
import org.apache.shiro.mgt.DefaultSecurityManager;
import org.apache.shiro.mgt.SecurityManager;
import org.apache.shiro.subject.SimplePrincipalCollection;

import com.jfinal.aop.Aop;
import com.jfinal.aop.Inject;
import com.jfinal.plugin.activerecord.Db;
import com.xm2013.admin.common.Kit;
import com.xm2013.admin.common.SqlKit;
import com.xm2013.admin.domain.dto.PageInfo;
import com.xm2013.admin.domain.dto.basic.RoleListQuery;
import com.xm2013.admin.domain.model.Role;
import com.xm2013.admin.domain.model.RoleMenu;
import com.xm2013.admin.domain.model.RolePermission;
import com.xm2013.admin.domain.model.User;
import com.xm2013.admin.exception.BusinessErr;
import com.xm2013.admin.exception.BusinessException;
import com.xm2013.admin.exception.Msg;
import com.xm2013.admin.shiro.ShiroKit;
import com.xm2013.admin.shiro.ShiroRealm;
import com.xm2013.admin.shiro.dto.ShiroRole;
import com.xm2013.admin.shiro.dto.ShiroUser;
import com.xm2013.admin.shiro.redis.RedisCache;

public class RoleService {
	
	@Inject
	private UserService userService;
	
	
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

	/**
	 * 搜索角色
	 * @param key
	 * @param user
	 * @return
	 */
	public List<Role> search(String key, ShiroUser user) {
		
		key = SqlKit.getSafeValue(key);
		
		String sql = "select t.* from sys_role as t left join sys_user as t1 on t1.id = t.creater "
				+ " where "
				+  user.buildAuthCondition("t1")
				+ " and (t.role_name like '%"+key+"%' or t.code like '%"+key+"%')";
		
		List<Role> roles = Role.dao.find(sql);
		
		return roles;
	}

	/**
	 * 分页查询角色
	 * @param query
	 * @param user
	 * @return
	 */
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
	 * 获取指定用户的分配的所有角色
	 */
	public List<Role> userRoles(int userId, ShiroUser loginUser) {
		User user = userService.findById(userId);
		if(user==null || !loginUser.isOwnerData(user.getStr("deptPath"), user.getId())) {
			return new ArrayList<Role>();
		}
		
		String sql = "select t.id as roldId, t.role_name, t.code, t.type, t1.id "
				+ " from sys_role as t "
				+ " left join sys_user_role as t1 on t1.role_id=t.id"
				+ " where t1.user_id="+userId;
		
		return Role.dao.find(sql);
	}
	
	/**
	 * 获取当前登录的所拥有的数据权限的所有角色
	 * 自己创建的和自己下级创建的橘色
	 */
	public List<Role> findOwnerRoles(ShiroUser loginUser){
		
		String sql = "select t.* from sys_role as t "
				+ " left join sys_user as t1 on t1.id = t.creater "
				+ " where ";
		
		if(loginUser.getUserIds().size() == 0) {
			sql += " t1.id in ("+loginUser.getUserIds().stream().map(id -> id+"").collect(Collectors.joining(","))+") ";
		}else {
			sql += " t1.id ="+loginUser.getId();
		}
		
		if(loginUser.getDeptIds().size() > 0) {
			sql += " or t1.dept in ("+loginUser.getDeptIds().stream().map(id -> id+"").collect(Collectors.joining(","))+")";
		}
		
		return Role.dao.find(sql);
		
	}
	
	/**
	 * 创建角色
	 * @param role
	 * @param user 
	 */
	public void create(Role role, ShiroUser user) {
		
		List<ShiroRole> roles = user.getRoles();
		int type = role.getType();
		if(role.getType() == Role.TYPE_SYSTEM) {
			throw new BusinessException(BusinessErr.ERROR, Msg.ROLE_NOT_CREATE_SYS_ROLE);
		}else if(type == Role.TYPE_SUPER) {
			boolean exist = false;
			for (ShiroRole shiroRole : roles) {
				if(shiroRole.getType() <= Role.TYPE_SUPER) {
					exist = true;
					break;
				}
			}
			if(!exist) {
				throw new BusinessException(BusinessErr.ERROR, Msg.ROLE_NOT_CREATE_SUPER_ROLE);
			}
		}else if(type == Role.TYPE_ADMIN) {
			boolean exist = false;
			for (ShiroRole shiroRole : roles) {
				if(shiroRole.getType() <= Role.TYPE_ADMIN) {
					exist = true;
					break;
				}
			}
			if(!exist) {
				throw new BusinessException(BusinessErr.ERROR, Msg.ROLE_NOT_CREATE_ADMIN_ROLE);
			}
		}
		
		role.save();
	}

	/**
	 * 更新角色
	 * @param role
	 * @param user
	 */
	public void update(Role role, ShiroUser user) {
//		int type = role.getType();
		Role db = Role.dao.findById(role.getId());
		if(db == null) {
			throw new BusinessException(BusinessErr.NO_DATA);
		}
		
		if(role.getId()<=4) {
			throw new BusinessException(BusinessErr.ERROR, Msg.ROLE_NOT_EDIT_SYS_ROLE);
		}
		
		Integer type = role.getType();
		if(type == null) {
			role.remove("type");
		}else {
			List<ShiroRole> roles = user.getRoles();
			if(type != db.getType()) {
				if(role.getType() == 0) {
					throw new BusinessException(BusinessErr.ERROR, Msg.ROLE_NOT_CREATE_SYS_ROLE);
				}else if(type == Role.TYPE_SUPER) {
					boolean exist = false;
					for (ShiroRole shiroRole : roles) {
						if(shiroRole.getType() <= Role.TYPE_SUPER) {
							exist = true;
							break;
						}
					}
					if(!exist) {
						throw new BusinessException(BusinessErr.ERROR, Msg.ROLE_NOT_CREATE_SUPER_ROLE);
					}
				}else if(type == Role.TYPE_ADMIN) {
					boolean exist = false;
					for (ShiroRole shiroRole : roles) {
						if(shiroRole.getType() <= Role.TYPE_ADMIN) {
							exist = true;
							break;
						}
					}
					if(!exist) {
						throw new BusinessException(BusinessErr.ERROR, Msg.ROLE_NOT_CREATE_ADMIN_ROLE);
					}
				}
			}
		}
		
		//查看这个角色是否有编辑的数据权限
		if(!user.isAdmin()) {
			List<Role> ownerRoles = findOwnerRoles(user);
			Optional<Role> exist = ownerRoles.stream().filter(r -> r.getId().intValue() == role.getId()).findFirst();
			if(!exist.isPresent()) {
				throw new BusinessException(BusinessErr.ERR_NO_AUTH);
			}
		}
		
		role.update();
	}

	/**
	 * 删除角色，判断待删除的角色是否具有权限
	 * @param ids
	 * @param user
	 */
	public void deletes(String ids, ShiroUser user) {
		
		List<Role> ownerRoles = new ArrayList<Role>();
		
		if(!user.isAdmin()) {
			ownerRoles = findOwnerRoles(user);
		}
		
		List<String> roldIds = Arrays.asList(ids.split(","));
		for (String roleId : roldIds) {
			int id = Integer.parseInt(roleId);
			if(id<=4) {
				throw new BusinessException(BusinessErr.ERROR, "禁止删除系统角色");
			}
			
			if(!user.isAdmin()) {
				Optional<Role> exist = ownerRoles.stream().filter(r -> r.getId().intValue() == id).findFirst();
				if(!exist.isPresent()) {
					throw new BusinessException(BusinessErr.ERR_NO_AUTH);
				}
			}
		}
		
		Db.delete("delete from sys_role where id in ("+ids+")");
	}

	/**
	 * 分配权限
	 * @param roles
	 * @param user
	 * @return
	 */
	public String grantPermissions(int roleId, List<Integer> permissions, ShiroUser user) {
		
		//判断这个角色能不能编辑
		if(!user.isAdmin()) {
			List<Role> ownerRoles = findOwnerRoles(user);
			Optional<Role> exist = ownerRoles.stream().filter(r -> r.getId().intValue() == roleId).findFirst();
			if(!exist.isPresent()) {
				return Msg.NO_DATA_AUTH;
			}
		}
		
		List<Integer> deletes = new ArrayList<Integer>();
		List<Integer> creates = new ArrayList<Integer>();
		
		List<Integer> dbs = Db.query("select t.permission_id from sys_role_permission as t where t.role_id="+roleId);
		
		for (Integer per : permissions) {
			Integer existId = null;
			for (int db : dbs) {
				if(db == per) {
					existId = db;
					break;
				}
			}
			
			if(existId == null) {
				creates.add(per);
			}
		}
		
		for (Integer db : dbs) {
			Integer existId = null;
			for (int per : permissions) {
				if(db == per) {
					existId = per;
					break;
				}
			}
			
			if(existId == null) {
				deletes.add(db);
			}
		}
		
		if(deletes.size()>0) {
			Db.delete("delete from sys_role_permission where role_id = "+roleId+" and permission_id in ("+
					deletes.stream().map(id -> id+"").collect(Collectors.joining(","))
				+")");
		}
		
		if(creates.size()>0) {
			List<RolePermission> rps = creates.stream()
					.map(s -> new RolePermission().setRoleId(roleId).setPermissionId(s))
					.collect(Collectors.toList());
			Db.batchSave(rps, rps.size());
		}
		
		return null;
	}
	
	/**
	 * 分配角色菜单
	 * @param roleId
	 * @param roleMenus
	 * @param loginUser
	 * @return
	 */
	public String grantMenus(int roleId, List<RoleMenu> roleMenus, ShiroUser user) {
		//判断这个角色能不能编辑
		if(!user.isAdmin()) {
			List<Role> ownerRoles = findOwnerRoles(user);
			Optional<Role> exist = ownerRoles.stream().filter(r -> r.getId().intValue() == roleId).findFirst();
			if(!exist.isPresent()) {
				return Msg.NO_DATA_AUTH;
			}
		}
		
		List<Integer> deletes = new ArrayList<Integer>();
		List<RoleMenu> creates = new ArrayList<RoleMenu>();
		
		List<RoleMenu> dbs = RoleMenu.dao.find("select * from sys_role_menu as t where t.role_id="+roleId);
		
		for (RoleMenu rm : roleMenus) {
			RoleMenu existMenu = null;
			for (RoleMenu db : dbs) {
				if(rm.getMenuId() == db.getMenuId()) {
					existMenu = db;
					break;
				}
			}
			
			if(existMenu == null) {
				creates.add(rm);
			}
		}
		
		for (RoleMenu db : dbs) {
			RoleMenu existMenu = null;
			for (RoleMenu rm : roleMenus) {
				if(db.getMenuId() == rm.getMenuId()) {
					existMenu = rm;
					break;
				}
			}
			
			if(existMenu == null) {
				deletes.add(db.getId());
			}
		}
		
		if(deletes.size()>0) {
			Db.delete("delete from sys_role_menu where id in ("+
					deletes.stream().map(id -> id+"").collect(Collectors.joining(","))
				+")");
		}
		
		if(creates.size()>0) {
			for (RoleMenu roleMenu : creates) {
				roleMenu.setRoleId(roleId);
			}
			Db.batchSave(creates, creates.size());
		}
		
		
		return null;
	}
	
	/**
	 * 清除指定角色下所有用户的权限缓存 - 同时清除认证和授权缓存
	 * @param roleId 角色ID
	 */
	public void clearUserAuthorizationCache(int roleId) {
		System.out.println("开始清除角色 " + roleId + " 的用户权限缓存");
		
		// 直接清除所有授权缓存，这是最可靠的方法
		SecurityManager securityManager = SecurityUtils.getSecurityManager();
		System.out.println("SecurityManager 类型: " + securityManager.getClass().getName());
		
		if(securityManager instanceof DefaultSecurityManager) {
			DefaultSecurityManager defaultSecurityManager = (DefaultSecurityManager) securityManager;
			Collection<Realm> realms = defaultSecurityManager.getRealms();
			System.out.println("找到 " + realms.size() + " 个 Realm");
			
			for(Realm realm : realms) {
				if(realm instanceof ShiroRealm) {
					ShiroRealm shiroRealm = (ShiroRealm) realm;
					
					// 清除授权缓存
					if(shiroRealm.getAuthorizationCache() != null) {
						shiroRealm.clearAllCachedAuthorizationInfo();
					}
					
					// 清除认证缓存 - 这是关键！
					if(shiroRealm.getAuthenticationCache() != null) {
						shiroRealm.clearAllCachedAuthenticationInfo();
					}
					
					// 或者直接清除所有缓存
					// shiroRealm.clearAllCache();
					
					break;
				}
			}
		}
	}
	
}
