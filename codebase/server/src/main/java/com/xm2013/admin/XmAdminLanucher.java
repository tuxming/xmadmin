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

package com.xm2013.admin;
import com.jfinal.server.undertow.UndertowServer;
import com.xm2013.admin.jfinal.config.MainConfig;
import com.xm2013.admin.jfinal.config.UndertowSessionManager;
import com.xm2013.admin.shiro.ShiroConst;

import io.undertow.server.session.SessionCookieConfig;
import io.undertow.server.session.SessionManager;
import io.undertow.servlet.api.Deployment;
import io.undertow.servlet.api.SessionManagerFactory;

public class XmAdminLanucher {

	public static void main(String[] args) {
		UndertowServer server = UndertowServer.create(MainConfig.class,"undertow.properties");
		
//		server.addHotSwapClassPrefix("sun.misc");
//		server.addSystemClassPrefix("sun.misc");
		server.configWeb(builder -> {
//			builder.setSessionManagerFactory(new SessionManagerFactory() {
//				
//				@Override
//				public SessionManager createSessionManager(Deployment deployment) {
//					
//					return new UndertowSessionManager("xm-undertow-deployment", -1);
//				}
//			});
			builder.getDeploymentInfo().setSessionManagerFactory(new SessionManagerFactory() {
				
				@Override
				public SessionManager createSessionManager(Deployment deployment) {
					SessionCookieConfig sessionConfig = new SessionCookieConfig();
					sessionConfig.setCookieName(ShiroConst.SISSION_ID); 	//自定义sessionId的cookie的key
					return new UndertowSessionManager(sessionConfig);	//自定义sessionManager用于解决session共享到redis, 便于分布式
				}
			});
		}); 
		server.start();
	}
	
}
