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

package com.xm2013.admin.basic.ctrl;

import java.io.File;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.net.URL;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.jfinal.aop.Inject;
import com.xm2013.admin.annotation.Op;
import com.xm2013.admin.annotation.Per;
import com.xm2013.admin.annotation.RequirePermission;
import com.xm2013.admin.annotation.RequirePermissions;
import com.xm2013.admin.basic.service.PermissionService;
import com.xm2013.admin.common.kits.JsonKit;
import com.xm2013.admin.domain.dto.JsonResult;
import com.xm2013.admin.domain.dto.PageInfo;
import com.xm2013.admin.domain.dto.Query;
import com.xm2013.admin.domain.model.Permission;
import com.xm2013.admin.exception.BusinessErr;
import com.xm2013.admin.exception.BusinessException;
import com.xm2013.admin.exception.Msg;
import com.xm2013.admin.shiro.ShiroKit;
import com.xm2013.admin.shiro.dto.ShiroUser;
import com.xm2013.admin.validator.Validator;

public class PermissionController extends BaseController{
	
	@Inject
	private PermissionService permissionService;
	
	@RequirePermission(val="sys:permission:get", name="查看权限", group="system")
	@Op("查看权限")
	public void get() {
		Integer id = getParaToInt("id", 0);
		if(id == 0) {
			renderJson(JsonResult.error(BusinessErr.INVALID_PARAM));
			return;
		}
		
		Permission permission = permissionService.findById(id);
		
		renderJson(JsonResult.ok(Msg.OK_GET, permission));
	}
	
	@RequirePermission(val="sys:permission:list", name="查看权限列表", group="system")
	@Op("查看权限列表")
	public void list() {
		Query query = JsonKit.getObject(getRawData(), Query.class);
		
		PageInfo<Permission> permissions = permissionService.pageList(query, ShiroKit.getLoginUser());
		renderJson(JsonResult.ok(Msg.OK_GET, permissions));
	}
	
	@RequirePermission(val="sys:permission:create", name="创建权限", group="system")
	@Op("创建权限")
	public void create() {
		Permission permission = JsonKit.getObject(getRawData(), Permission.class);
		
		Validator validator = new Validator();
		validator.exec(permission, "create", false);
		if(validator.hasError()) {
//			throw new BusinessException(BusinessErr.INVALID_PARAM, validator.getError());
			renderJson(JsonResult.error(BusinessErr.ERROR.setMsg(validator.getError())));
			return;
		}
		
		permissionService.create(permission);
		
		renderJson(JsonResult.ok(Msg.OK_CREATED));
		
	}
	
	@RequirePermission(val="sys:permission:edit", name="编辑权限", group="system")
	@Op("编辑权限")
	public void update() {
		Permission permission = JsonKit.getObject(getRawData(), Permission.class);
		
		Validator validator = new Validator();
		validator.exec(permission, "create", false);
		if(validator.hasError()) {
//			throw new BusinessException(BusinessErr.INVALID_PARAM, validator.getError());
			renderJson(JsonResult.error(BusinessErr.ERROR.setMsg(validator.getError())));
			return;
		} 
		
		permissionService.update(permission);
		
		renderJson(JsonResult.ok(Msg.OK_UPDATE));
	}
	
	@RequirePermission(val="sys:permission:delete", name="删除权限", group="system")
	@Op("删除权限")
	public void deletes() {
		String ids = getPara("ids");
		if(ids == null || !ids.matches("[\\d,]+")) {
//			throw new BusinessException(BusinessErr.NULL_PARAM);
			renderJson(JsonResult.error(BusinessErr.NULL_PARAM));
			return;
		}
		
		permissionService.deletes(ids);
		
		renderJson(JsonResult.ok(Msg.OK_DELETE));
		
	}
	
	/**
	 * 扫描权限整个系统权限，
	 */
	@RequirePermission(val="sys:permission:scan", name="扫描权限", group="system")
	@Op("扫描权限")
	public void scan() {
		
		String pkg = "com.xm2013.admin.basic.ctrl";
		Map<String, String> results = new HashMap<String, String>();
		try {
			List<Permission> permissions = doScan(pkg);
			for (Permission permission : permissions) {
				try {
					permissionService.create(permission);
					results.put(permission.getName()+","+permission.getExpression(), "OK");
				} catch (Exception e) {
					results.put(permission.getName()+","+permission.getExpression(), e.getMessage());
				}
			}
		} catch (Exception e) {
			renderJson(JsonResult.error(BusinessErr.ERROR.setMsg(e.getMessage()).setCode(500)));
//			throw new BusinessException(BusinessErr.ERROR, e.getMessage());
		}
		
		renderJson(JsonResult.ok(Msg.OK_CREATED, "600", results));
		
	}
	
	private List<Permission> doScan(String pkgName) throws Exception {
		
		ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        assert classLoader != null;
        String path = pkgName.replace('.', '/');
        Enumeration<URL> resources = classLoader.getResources(path);
        List<File> dirs = new ArrayList<>();
        while (resources.hasMoreElements()) {
            URL resource = resources.nextElement();
            dirs.add(new File(resource.getFile()));
        }
        List<Class<?>> classes = new ArrayList<>();
        for (File directory : dirs) {
            classes.addAll(findClasses(directory, pkgName));
        }
        
        List<Permission> permissions = new ArrayList<Permission>();
        
        for (Class<?> clazz : classes) {
        	Method[] methods = clazz.getMethods();
        	
        	for (Method method : methods) {
        			
    			RequirePermission rp = method.getAnnotation(RequirePermission.class);
    			
    			if(rp!=null) {
    				System.out.println(rp.group()+";"+rp.name()+";"+rp.val());
        			permissions.add(
    					new Permission().setGroupName(rp.group())
    						.setName(rp.name())
    						.setExpression(rp.val())
    				);
    			}
    			
    			RequirePermissions rps = method.getAnnotation(RequirePermissions.class);
    			if(rps != null) {
    				Per[] values = rps.value();
    				for(int i=0; i<values.length; i++) {
    					Per p = values[i];
    					System.out.println(p.group()+";"+p.name()+";"+p.val());
    					permissions.add(
	    					new Permission().setGroupName(p.group())
	    						.setName(p.name())
	    						.setExpression(p.val())
	    				);
    				}
    			}
			}
        	
		}
        
        return permissions;
        
	}
	
	private List<Class<?>> findClasses(File directory, String packageName) throws ClassNotFoundException {
        List<Class<?>> classes = new ArrayList<>();
        if (!directory.exists()) {
            return classes;
        }
        File[] files = directory.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isDirectory()) {
                    classes.addAll(findClasses(file, packageName + "." + file.getName()));
                } else if (file.getName().endsWith(".class")) {
                    String className = packageName + '.' + file.getName().substring(0, file.getName().length() - 6);
                    try {
                        Class<?> clazz = Class.forName(className);
                        if (!Modifier.isAbstract(clazz.getModifiers())) {
                            classes.add(clazz);
                        }
                    } catch (ClassNotFoundException e) {
                        e.printStackTrace();
                    }
                }
            }
        }
        return classes;
    }
	
//	public static void main(String[] args) {
//		new PermissionController().scan();
//	}
	
	/**
	 * 管理员可以获取所有角色的权限
	 * 普通用户只能获取自己的权限
	 */
	@Op("当前登录用户的权限列表")
	public void curr() {
		ShiroUser user = ShiroKit.getLoginUser();
		if(user.isAdmin()) {
			renderJson(JsonResult.ok(Msg.OK_GET, 
					permissionService.findAll()
				));
			
		}else {
			renderJson(JsonResult.ok(Msg.OK_GET, 
				permissionService.findByRole(
					user.getRoles().stream()
						.map(s -> s.getId()+"")
						.collect(Collectors.joining(","))
				)
			));
		}
	}
	
	/**
	 * 获取指定的角色的所有权限，
	 * 先判断这个角色是否拥有
	 */
	public void byRole() {
		int roleId = getParaToInt("id", 0);
		if(roleId == 0) {
			renderJson(JsonResult.error(BusinessErr.INVALID_PARAM));
		}
		
		renderJson(JsonResult.ok(Msg.OK_GET, permissionService.byRole(roleId, ShiroKit.getLoginUser())));
		
	}
}
