package com.xm2013.admin.basic.service;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.jfinal.aop.Inject;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;
import com.xm2013.admin.domain.model.Menu;
import com.xm2013.admin.domain.model.Role;
import com.xm2013.admin.exception.BusinessErr;
import com.xm2013.admin.exception.BusinessException;
import com.xm2013.admin.shiro.dto.ShiroUser;

public class MenuService {
	
	@Inject
	public RoleService roleService;
	
	public List<Menu> list(int id) {
		return Menu.dao.find("select * from sys_menu where parent_id=?", id);
	}

	public void create(Menu menu, ShiroUser user) {
		Db.tx(new IAtom() {
			
			@Override
			public boolean run() throws SQLException {
				Integer parentId = menu.getParentId();
				if(parentId!=null && parentId > 0) {
					Db.update("update sys_menu set type = 0 where id = ?", parentId);
				}else {
					menu.setParentId(0);
				}
				menu.save();
				return true;
			}
		});
	}

	public void update(Menu menu, ShiroUser user) {
		Db.tx(new IAtom() {
			
			@Override
			public boolean run() throws SQLException {
				
				Menu db = Menu.dao.findById(menu.getId());
				if(db == null) {
					throw new BusinessException(BusinessErr.NO_DATA);
				}
				
				Integer parentId = menu.getParentId();
				
				if(parentId!=null && parentId > 0) {
					if(menu.getId().intValue() == parentId ) {
						throw new BusinessException(BusinessErr.ERROR, "父级菜单不能是本身");
					}
					Db.update("update sys_menu set type = 0 where id = ?", parentId);
				}else {
					menu.setParentId(0);
				}
				menu.update();
				return true;
				
			}
		});
		
	}

	public void delete(int id) {
		Db.tx(new IAtom() {
			
			@Override
			public boolean run() throws SQLException {
				Db.delete("delete from sys_menu where id=?", id);
				Db.delete("delete from sys_menu where parent_id=?", id);
				return true;
			}
		});
		
	}

	public List<Menu> curr(ShiroUser user) {
		
		List<Menu> menus = null;
		if(user.isAdmin()) {
			menus = Menu.dao.find("select * from sys_menu");
		}else {
			String roleIds = user.getRoles().stream().map(s -> s.getId()+"").collect(Collectors.joining(","));
			
			menus = Menu.dao.find("select t.* from sys_menu as t "
					+ " left join sys_role_menu as t1 on t1.menu_id = t.id"
					+ " where t1.role_id in ("+roleIds+")");
			
		}
		
		
//		Map<Integer, Menu> menuMap = new HashMap<Integer, Menu>();
//		for (Menu menu : menus) {
//			menuMap.put(menu.getId(), menu);
//		}
//		
//		for (Menu menu : menus) {
//			Integer parentId = menu.getParentId();
//			if(parentId == null || parentId == 0) {
//				continue;
//			}
//			
//			Menu parent = menuMap.get(parentId.intValue());
//			if(parent != null) {
//				parent.getChildren().add(menu);
//			}
//		}
//		
//		return menuMap.get(1).getChildren();
		return menus;
	}

	/**
	 * 获取指定角色的所有菜单
	 * @param roleId
	 * @param loginUser
	 * @return
	 */
	public List<Menu> findByRole(int roleId, ShiroUser loginUser) {
		if(!loginUser.isAdmin()) {
			List<Role> ownerRoles = roleService.findOwnerRoles(loginUser);
			Optional<Role> exist = ownerRoles.stream().filter(r -> r.getId() == roleId).findFirst();
			if(!exist.isPresent()) {
				throw new BusinessException(BusinessErr.ERR_NO_AUTH);
			}
		}
		
		return Menu.dao.find("select t.*, t1.checked from sys_menu as t "
				+ " left join sys_role_menu as t1 on t1.menu_id = t.id"
				+ " where t1.role_id in ("+roleId+")");
	}
	
}
