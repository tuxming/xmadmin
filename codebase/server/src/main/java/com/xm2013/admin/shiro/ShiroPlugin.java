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
