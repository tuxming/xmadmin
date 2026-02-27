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

package com.xm2013.admin.shiro;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.stream.Collectors;

import org.apache.log4j.Logger;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.IncorrectCredentialsException;
import org.apache.shiro.authc.SimpleAuthenticationInfo;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.authz.SimpleAuthorizationInfo;
import org.apache.shiro.mgt.RealmSecurityManager;
import org.apache.shiro.realm.Realm;
import org.apache.shiro.subject.PrincipalCollection;
import org.apache.shiro.subject.SimplePrincipalCollection;
import org.apache.shiro.subject.Subject;

import com.jfinal.aop.Aop;
import com.xm2013.admin.basic.service.DeptService;
import com.xm2013.admin.basic.service.PermissionService;
import com.xm2013.admin.basic.service.RoleService;
import com.xm2013.admin.basic.service.UserService;
import com.xm2013.admin.domain.model.Dept;
import com.xm2013.admin.domain.model.Permission;
import com.xm2013.admin.domain.model.Role;
import com.xm2013.admin.domain.model.User;
import com.xm2013.admin.exception.Msg;
import com.xm2013.admin.shiro.dto.ShiroDept;
import com.xm2013.admin.shiro.dto.ShiroRole;
import com.xm2013.admin.shiro.dto.ShiroUser;
import com.xm2013.admin.shiro.dto.ShiroUserData;

public class ShiroKit {
	private static Logger log  = Logger.getLogger(ShiroKit.class);
	
	/**
     * 重新赋值权限(在比如:给一个角色临时添加一个权限,需要调用此方法刷新权限,否则还是没有刚赋值的权限)
     * @param myRealm 自定义的realm
     * @param username 用户名
     */
	public void reloadAuthorizing(String username){
        Subject subject = SecurityUtils.getSubject(); 
        String realmName = subject.getPrincipals().getRealmNames().iterator().next(); 
        //第一个参数为用户名,第二个参数为realmName,test想要操作权限的用户 
        SimplePrincipalCollection principals = new SimplePrincipalCollection(username,realmName); 
        subject.runAs(principals); 
        //((RealmSecurityManager) SecurityUtils.getSecurityManager())
        
        RealmSecurityManager manager = (RealmSecurityManager)SecurityUtils.getSecurityManager();
        Collection<Realm> realms = manager.getRealms();
        Iterator<Realm> itr = realms.iterator();
        while(itr.hasNext()) {
        	ShiroRealm realm = (ShiroRealm) itr.next();
    		realm.getAuthorizationCache().clear();
            subject.releaseRunAs();
        }
    }
	
	/**
	 * 获取当前登录的用户
	 * @return
	 */
	public static ShiroUser getLoginUser() {
		
		Object user = SecurityUtils.getSubject().getPrincipal();
		
		// 增加调试信息
		if(user == null) {
			System.out.println("DEBUG: SecurityUtils.getSubject().getPrincipal() 返回 null");
			return null;
		}
		
//		System.out.println("DEBUG: Principal 类型: " + user.getClass().getName() + ", 值: " + user);
		
		if(user!=null && user.getClass().getName().equals("java.lang.String")) {
			String username = (String)user;
			
			try {
				UserService userService = Aop.get(UserService.class);
				User u = userService.findByUsername(username);
				
				if(u == null) {
					log.info("根据用户名 '" + username + "' 未找到用户");
					return null;
				}
				
				return buildShiroUser(u, userService);
			} catch (Exception e) {
				log.error("构建 ShiroUser 时发生异常: " + e.getMessage(), e);
				return null;
			}
		}else {
			try {
				return (ShiroUser)user;
			} catch (ClassCastException e) {
				log.error("类型转换异常，期望 ShiroUser，实际: " + user.getClass().getName() + e.getMessage(), e);
				return null;
			}
		}
	}
	
	/**
	 * 构建shiroUser对象
	 * @param user
	 * @param service
	 * @return
	 */
	public static ShiroUser buildShiroUser(User user, UserService service) {
		
		int status = user.getStatus();
	    if(status != 1) {
	    	throw new IncorrectCredentialsException(Msg.SHIRO_REALM_STATUS_ERR);  
	    }
	    
	    //构建用户
	    ShiroUser account = new ShiroUser()
	    		.setId(user.getId())
	    		.setUsername(user.getUsername())
	    		.setFullname(user.getFullname())
	    		.setCode(user.getCode())
	    		.setEmail(user.getEmail())
	    		.setPhone(user.getPhone())
	    		.setPhoto(user.getPhoto())
	    		.setGender(user.getGender())
	    		.setParentId(user.getParentId())
    		;
	    
	    if(account.getId() < 3) {
	    	buildAdmin(account);
	    }else {
	    	buildNormal(account, user, service);
	    }
	    
	    return account;
	}
	
	/**
	 * 这里定义id为1-3的用户为系统的超级用户，有所有的权限
	 * id=1的角色为admin角色，1-3的用户默认拥有
	 * 角色为1的用户自动拥有 * 权限
	 * @param token
	 */
	public static SimpleAuthenticationInfo buildAuthenticationInfo(User user, UserService service, String name) {
	    
	    ShiroUser account = buildShiroUser(user, service);
	    
	    SimpleAuthenticationInfo userinfo = new SimpleAuthenticationInfo(account, user.getPassword(),name);
	    return userinfo;
	}

	/**
	 * 构建admin的账号信息
	 * @param account
	 */
	private static void buildAdmin(ShiroUser account) {
		List<ShiroRole> roles = new ArrayList<ShiroRole>();
		roles.add(new ShiroRole(1, "admin", Role.TYPE_SYSTEM));
		account.setRoles(roles);
		
		List<String> pers = new ArrayList<String>();
		pers.add("*");
		account.setPermissions(pers);
		
		ShiroDept dept = new ShiroDept(1, Dept.TYPE_SELF, "系统", "/1/", "/系统/");
		account.setDept(dept);
		account.setCompany(dept);
		account.setGroup(dept);
		
		List<ShiroUserData> userDatas = new ArrayList<ShiroUserData>();
		userDatas.add(new ShiroUserData()
			.setId(0)
			.setPath("/")
			.setPathName("系统")
			.setPathName("/系统/")
			.setType(2)
			.setRefId(1)
		);
		account.setUserDatas(userDatas);
		
//		account.getDataPath().add(new ShiroUserData());
	}
	
	/**
	 * 构建普通用户的信息
	 * @param account
	 * @param user
	 * @param service 
	 */
	private static void buildNormal(ShiroUser account, User user, UserService service) {
		 //构建角色
	    RoleService roleService = Aop.get(RoleService.class);
	    List<Role> roles = roleService.findByUser(user.getId());
	    if(!roles.isEmpty()) {
	    	
	    	for(Role role : roles) {
	    		if(role.getType() <= Role.TYPE_ADMIN) {
	    			buildAdmin(account);
	    			return;
				}
	    	}
	    	
	    	account.setRoles(roles.stream().map(s -> new ShiroRole(s.getId(), s.getRoleName(), s.getType()))
	    				.collect(Collectors.toList())
	    			);
	    	
	    	 //构建权限
		    PermissionService permissionService = Aop.get(PermissionService.class);
		    List<Permission> permissions = permissionService.findByRole(
		    		roles.stream().map(r -> r.getId()+"").collect(Collectors.joining(","))
		    	);
		    if(!permissions.isEmpty()) {
		    	account.setPermissions(permissions.stream().map(s -> s.getExpression())
		    				.collect(Collectors.toList())
		    			);
		    }
	    }
	    
	    //所在组织
	    DeptService deptService = Aop.get(DeptService.class);
	    Dept dept = deptService.findById(user.getDeptId());
	    
	    if(dept != null) {
	    	account.setDept(new ShiroDept(dept.getId(), dept.getType(), dept.getName(), dept.getPath(), dept.getPathName()));
	    }
	    
    	//设置数据权限
	    List<ShiroUserData> suds = service.findUserDataByUser(user.getId());
	    account.setUserDatas(suds);
	    
	    List<Integer> users = new ArrayList<Integer>();
	    List<String> datapaths = new ArrayList<String>();
	    
	    for (ShiroUserData sud : suds) {
	    	int type = sud.getType();
	    	if(type == 1) {
	    		users.add(sud.getRefId());
	    	}else if(type == 2) {
	    		datapaths.add(sud.getPath());
	    	}
		}
	    
	    users.add(user.getId());
	    account.setUserIds(users);
	    account.setDatapaths(datapaths);
	    
	    List<Integer> deptIds = new ArrayList<Integer>();
	    for (String datapath : datapaths) {
	    	List<Dept> ds = Dept.dao.find("select id from sys_dept where path like '"+datapath+"%'");
	    	if(!ds.isEmpty()) {
	    		ds.forEach(d -> deptIds.add(d.getId()));
	    	}
	    }
	    
	    if(!deptIds.isEmpty()) {
	    	account.setDeptIds(deptIds);
	    }
	    
	    //所在公司
	    
	    //所在集团
	    
	}
	
}
