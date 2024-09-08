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
