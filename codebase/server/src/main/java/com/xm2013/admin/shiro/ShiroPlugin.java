package com.xm2013.admin.shiro;

import org.apache.shiro.SecurityUtils;
import org.apache.shiro.config.Ini;
import org.apache.shiro.config.Ini.Section;
import org.apache.shiro.config.IniSecurityManagerFactory;
import org.apache.shiro.util.Factory;

import com.jfinal.plugin.IPlugin;
import com.jfinal.plugin.redis.Redis;

public class ShiroPlugin implements IPlugin{

	protected volatile boolean isStarted = false;
	
	@Override
	public boolean start() {
		if (isStarted) {
			return true;
		}
		
		//将shiro中的urls配置放入到chache中
		IniSecurityManagerFactory iniFactory = new IniSecurityManagerFactory("classpath:shiro.ini");
		Ini ini = iniFactory.getIni();
		Section section = ini.getSection("urls");
		
		for (String key : section.keySet()) {
			Redis.use().hset(ShiroConst.CACHE_URLS, key, section.get(key));
		}
		
		//初始化shiro
		Factory<org.apache.shiro.mgt.SecurityManager> factory = iniFactory;
		org.apache.shiro.mgt.SecurityManager securityManager = factory.getInstance();
		SecurityUtils.setSecurityManager(securityManager);
		
		return true;
	}

	@Override
	public boolean stop() {
		
		isStarted = false;
		return true;
	}

}
