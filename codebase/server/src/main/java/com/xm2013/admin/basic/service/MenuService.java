package com.xm2013.admin.basic.service;

import java.util.List;

import com.xm2013.admin.domain.model.Menu;

public class MenuService {

	public List<Menu> list(int id) {
		return Menu.dao.find("select * from sys_menu where parent_id=?", id);
	}
	
}
