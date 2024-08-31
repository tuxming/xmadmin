package com.xm2013.admin.basic.service;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;
import com.xm2013.admin.domain.model.Menu;
import com.xm2013.admin.exception.BusinessErr;
import com.xm2013.admin.exception.BusinessException;
import com.xm2013.admin.shiro.dto.ShiroUser;

public class MenuService {

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

	public List<Menu> curr(ShiroUser loginUser) {
		
		List<Menu> menus = Menu.dao.find("select * from sys_menu");
		
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
	
}
