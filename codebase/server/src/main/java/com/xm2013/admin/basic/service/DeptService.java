package com.xm2013.admin.basic.service;

import com.xm2013.admin.domain.model.Dept;

public class DeptService {
	
	public Dept findById(int deptId) {
		return Dept.dao.findById(deptId);
	}
	
	
}
