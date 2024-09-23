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


package com.xm2013.admin.jfinal.config;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.util.Base64;
import java.util.Collections;
import java.util.Set;

import com.jfinal.kit.Prop;
import com.jfinal.kit.PropKit;
import com.jfinal.plugin.redis.IKeyNamingPolicy;
import com.jfinal.plugin.redis.serializer.FstSerializer;
import com.jfinal.plugin.redis.serializer.ISerializer;
import com.xm2013.admin.common.Kit;

import io.undertow.UndertowMessages;
import io.undertow.server.HttpServerExchange;
import io.undertow.server.session.SecureRandomSessionIdGenerator;
import io.undertow.server.session.Session;
import io.undertow.server.session.SessionConfig;
import io.undertow.server.session.SessionIdGenerator;
import io.undertow.server.session.SessionListener;
import io.undertow.server.session.SessionListeners;
import io.undertow.server.session.SessionManager;
import io.undertow.server.session.SessionManagerStatistics;
import io.undertow.util.AttachmentKey;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;
import redis.clients.jedis.Transaction;

/**
 * 实现自定义SessionManager主要用于处理session存入到redis中，这样就可以共享session,以达到分布式的目的
 * 由于这里由redis接管了session，所以必须先启动redis才能正常启动项目
 */
public class UndertowSessionManager implements SessionManager, SessionManagerStatistics {
	private final static String CACHE_KEY_SESSION_ID = "undertow_session_id";
	private final static String CACHE_KEY_SESSION_ATTR = "undertow_session_attr";

	private final static String DEFAULT_DEPLOYMENT_NAME = "SESSION_MANAGER";

    private final AttachmentKey<SessionImpl> NEW_SESSION = AttachmentKey.create(SessionImpl.class);
    private final SessionIdGenerator sessionIdGenerator;
    private final String deploymentName;
    private final SessionListeners sessionListeners = new SessionListeners();
    private volatile long defaultSessionTimeout = 30 * 60;
    private final SessionConfig sessionConfig;
    private JedisPool jedisPool;

    private volatile long startTime;

    public UndertowSessionManager(final SessionConfig sessionConfig) {
        this(DEFAULT_DEPLOYMENT_NAME, new SecureRandomSessionIdGenerator(), sessionConfig);
    }

    public UndertowSessionManager(final String deploymentName, final SessionIdGenerator sessionIdGenerator,
                               final SessionConfig sessionConfig) {
        this.deploymentName = deploymentName;
        this.sessionIdGenerator = sessionIdGenerator;
        this.sessionConfig = sessionConfig;

        this.initCache();
    }

    /**
     * 这写法并没有主动关闭，因此这里必须要手动调用close()
     * try (Jedis jedis = jedisPool.getResource()) {jedis.close();}
     */
    /**
     * 初始化redis
     */
    private void initCache() {
    	
    	Prop prop=PropKit.use("application.properties");
		if(prop==null){
			throw new RuntimeException("application.properties not exist!");
		}
		//读取当前配置的部署环境类型 dev是开发环境 pro是生产环境
		String PDEV=prop.get("pdev", "dev").trim();
		if("pro".equalsIgnoreCase(PDEV)) {
			prop = PropKit.append("config-pro.properties");
		}else {
			prop = PropKit.append("config.properties");
		}
    	
    	String redisPwd = PropKit.get("redis.password");
		String redisServer = PropKit.get("redis.server");
		Integer redisPort = PropKit.getInt("redis.port");
		JedisPoolConfig jedisPoolConfig = new JedisPoolConfig();
		int timeout = 1800;
		
		ISerializer serializer = null;
		IKeyNamingPolicy keyNamingPolicy = null;
		
		if(Kit.isNotNull(redisPwd)) {
			jedisPool = new JedisPool(jedisPoolConfig, redisServer, redisPort, timeout, redisPwd);
		}else {
			jedisPool = new JedisPool(jedisPoolConfig, redisServer, redisPort);
		}
		
		if (serializer == null)
			serializer = FstSerializer.me;
		if (keyNamingPolicy == null)
			keyNamingPolicy = IKeyNamingPolicy.defaultKeyNamingPolicy;
		
//		cache = new Cache("xmundertow", jedisPool, serializer, keyNamingPolicy);
    }
    
    public String getDeploymentName() {
    	//System.out.println("getDeploymentName");
        return deploymentName;
    }

    public void start() {
    	//System.out.println("start");
        startTime = System.currentTimeMillis();
    }

    public void stop() {
    	//System.out.println("stop");
        jedisPool.destroy();
    }

    public Session createSession(final HttpServerExchange serverExchange, final SessionConfig sessionConfig) {
    	//System.out.println("createSession");
        if (sessionConfig == null) {
            throw UndertowMessages.MESSAGES.couldNotFindSessionCookieConfig();
        }
        String sessionId = sessionConfig.findSessionId(serverExchange);
        int count = 0;

        while (sessionId == null) {
        	
        	//这是直接以字符串形式存在resdis中，改成存在set中
            sessionId = sessionIdGenerator.createSessionId();
            Jedis jedis = jedisPool.getResource();
            if (jedis.exists(sessionId)) {
                sessionId = null;
            }
//            if (jedis.hexists(CACHE_KEY_SESSION_ID, sessionId)) {
//            	sessionId = null;
//            }

        	jedis.close();
            if (count++ == 100) {
                //this should never happen
                //but we guard against pathological session id generators to prevent an infinite loop
                throw UndertowMessages.MESSAGES.couldNotGenerateUniqueSessionId();
            }
        }
        final long created = System.currentTimeMillis();
        try (Jedis jedis = jedisPool.getResource()) {
            jedis.set(CACHE_KEY_SESSION_ID+"#"+sessionId, String.valueOf(created));
//        	jedis.hset(CACHE_KEY_SESSION_ID, sessionId, String.valueOf(created));
//        	jedis.expire(CACHE_KEY_SESSION_ID, defaultSessionTimeout);
        	jedis.close();
        }
        final SessionImpl session = new SessionImpl(sessionId, created, (int) defaultSessionTimeout,
                sessionConfig, this);

        sessionConfig.setSessionId(serverExchange, session.getId());
        session.bumpTimeout();
        sessionListeners.sessionCreated(session, serverExchange);
        serverExchange.putAttachment(NEW_SESSION, session);

        return session;
    }

    public Session getSession(final HttpServerExchange serverExchange, final SessionConfig sessionConfig) {
    	//System.out.println("getSession");
        if (serverExchange != null) {
            SessionImpl newSession = serverExchange.getAttachment(NEW_SESSION);
            if (newSession != null) {
                return newSession;
            }
        }
        String sessionId = sessionConfig.findSessionId(serverExchange);
        return getSession(sessionId);
    }

    public Session getSession(final String sessionId) {
    	//System.out.println("getSession1");
        if (sessionId == null) {
            return null;
        }
        try (Jedis jedis = jedisPool.getResource()) {
        	//这里的目的就是判断session是否过期，如果session过期，就返回null
            //这里返回的是session剩余时间，
        	//如果没有过期，就刷新session
        	String key = CACHE_KEY_SESSION_ID+"#"+sessionId;
            if (jedis.exists(key)) {
                long created = Long.valueOf(jedis.get(key));
                int ttl = jedis.ttl(key).intValue();
                SessionImpl session = new SessionImpl(sessionId, created, ttl, sessionConfig, this);
//                long timeout = defaultSessionTimeout*1000;
//                System.out.println(timeout);
//                jedis.expire(key, timeout); 
                jedis.close();
                return session;
            } else {
            	jedis.close();
                return null;
            }
        }
    }

    public synchronized void registerSessionListener(final SessionListener listener) {
    	//System.out.println("registerSessionListener");
        sessionListeners.addSessionListener(listener);
    }

    public synchronized void removeSessionListener(final SessionListener listener) {
    	//System.out.println("removeSessionListener");
        sessionListeners.removeSessionListener(listener);
    }

    public void setDefaultSessionTimeout(final int timeout) {
        defaultSessionTimeout = timeout;
    }

    public Set<String> getTransientSessions() {
    	//System.out.println("getTransientSessions");
        // No sessions should be lost when shutting down a node
        return Collections.emptySet();
    }

    public Set<String> getActiveSessions() {
        return getAllSessions();
    }

    public Set<String> getAllSessions() {
        try (Jedis jedis = jedisPool.getResource()) {
//            return jedis.keys("*");
//            Set<String> all = jedis.hkeys(CACHE_KEY_SESSION_ID);
            Set<String> all = jedis.keys(CACHE_KEY_SESSION_ATTR+"#");

        	jedis.close();
        	return all;
        }
    }

    // TODO: support statistics
    public SessionManagerStatistics getStatistics() {
        return null;
    }

    private static class SessionImpl implements Session {
        private String sessionId;
        private final long creationTime;
        private volatile int maxInactiveInterval;
        private final SessionConfig sessionConfig;
        private final UndertowSessionManager sessionManager;

        private SessionImpl(final String sessionId, final long creationTime,
                            final int maxInactiveInterval, final SessionConfig sessionConfig,
                            final UndertowSessionManager sessionManager) {
            this.sessionId = sessionId;
            this.creationTime = creationTime;
            this.maxInactiveInterval = maxInactiveInterval;
            this.sessionConfig = sessionConfig;
            this.sessionManager = sessionManager;
            //System.out.println("init sessionImpl:"+maxInactiveInterval);
        }

        public String getId() {
            return sessionId;
        }

        public void requestDone(HttpServerExchange serverExchange) {

        }

        public long getCreationTime() {
            return creationTime;
        }

        public long getLastAccessedTime() {
        	//System.out.println("getLastAccessedTime");
            try (Jedis jedis = sessionManager.jedisPool.getResource()) {
//                long t = System.currentTimeMillis() - ((maxInactiveInterval * 100) - jedis.pttl(CACHE_KEY_SESSION_ATTR));
            	long t = System.currentTimeMillis() - ((maxInactiveInterval * 100) - jedis.pttl(CACHE_KEY_SESSION_ID+"#"+sessionId));
            	jedis.close();
                return t;
            }
        }

        public void setMaxInactiveInterval(final int interval) {
        	//System.out.println("setMaxInactiveInterval:"+interval);
            maxInactiveInterval = interval;
            bumpTimeout();
        }

        public int getMaxInactiveInterval() {
        	//System.out.println("getMaxInactiveInterval");
            return maxInactiveInterval;
        }

        public Object getAttribute(String name) {
        	//System.out.println("getAttribute");
            try (Jedis jedis = sessionManager.jedisPool.getResource()) {
//                final String attribute = jedis.hget(CACHE_KEY_SESSION_ATTR, sessionId+"#"+name);
                final String attribute = jedis.hget(CACHE_KEY_SESSION_ATTR+"#"+sessionId, name);

                if (attribute == null) {
                    return null;
                }
                bumpTimeout();

            	jedis.close();
                return deserialize(attribute);
            }
        }

        private Object deserialize(String data) {
        	//System.out.println("deserialize");
            if (data == null) {
                return null;
            }
            byte[] attributeBytes = Base64.getDecoder().decode(data);
            try (BufferedInputStream bis = new BufferedInputStream(new ByteArrayInputStream(attributeBytes));
                 ObjectInputStream ois = new ObjectInputStream(bis)) {

                return ois.readObject();
            } catch (IOException | ClassNotFoundException e) {
                e.printStackTrace();
                return null;
            }
        }

        @Override
        public Set<String> getAttributeNames() {
        	//System.out.println("getAttributeNames");
            bumpTimeout();
            try (Jedis jedis = sessionManager.jedisPool.getResource()) {
//                return jedis.hkeys(CACHE_KEY_SESSION_ATTR+"#");
//            	Set<String> set = jedis.hkeys(CACHE_KEY_SESSION_ATTR);
            	Set<String> set = jedis.hkeys(CACHE_KEY_SESSION_ATTR+"#"+sessionId);

            	jedis.close();
            	return set;
            }
        }

        @Override
        public Object setAttribute(String name, Object value) {
        	//System.out.println("setAttribute");
            try (ByteArrayOutputStream bos = new ByteArrayOutputStream();
                 ObjectOutputStream oos = new ObjectOutputStream(new BufferedOutputStream(bos))) {
                oos.writeObject(value);
                oos.flush();

                Object existing;
                try (Jedis jedis = sessionManager.jedisPool.getResource()) {
                    existing = deserialize(jedis.hget(CACHE_KEY_SESSION_ATTR+"#"+sessionId, name));

                    jedis.hset(CACHE_KEY_SESSION_ATTR+"#"+sessionId, name, Base64.getEncoder().encodeToString(bos.toByteArray()));

                	jedis.close();
                }
                if (existing == null) {
                    sessionManager.sessionListeners.attributeAdded(this, name, value);
                } else {
                    sessionManager.sessionListeners.attributeUpdated(this, name, value, existing);
                }
                bumpTimeout();
                return value;
            } catch (IOException e) {
                e.printStackTrace();
                return null;
            }
        }

        @Override
        public Object removeAttribute(String name) {
        	//System.out.println("removeAttribute");
            final Object existing = getAttribute(name);
            try (Jedis jedis = sessionManager.jedisPool.getResource()) {
                jedis.hdel(CACHE_KEY_SESSION_ATTR+"#"+sessionId, name);

            	jedis.close();
            }
            sessionManager.sessionListeners.attributeRemoved(this, name, existing);
            bumpTimeout();

            return existing;
        }

        @Override
        public void invalidate(HttpServerExchange exchange) {
        	//System.out.println("invalidate");
            try (Jedis jedis = sessionManager.jedisPool.getResource()) {
                Transaction transaction = jedis.multi();
//                transaction.hdel(CACHE_KEY_SESSION_ATTR,sessionId);
////                transaction.hdel(CACHE_KEY_SESSION_ID, sessionId);
//                
//                Set<String> set = jedis.hkeys(CACHE_KEY_SESSION_ATTR);
//                for (String key : set) {
//					if(key.startsWith(sessionId+"#")) {
//						transaction.hdel(CACHE_KEY_SESSION_ATTR, key);
//					}
//				}
                transaction.del(CACHE_KEY_SESSION_ID+"#"+sessionId);
                transaction.del(CACHE_KEY_SESSION_ATTR+"#"+sessionId);
                
                
                transaction.exec();

            	jedis.close();
            }

            if (exchange != null) {
                sessionConfig.clearSession(exchange, this.getId());
            }
        }

        @Override
        public SessionManager getSessionManager() {
        	//System.out.println("getSessionManager");
            return sessionManager;
        }

        @Override
        public String changeSessionId(HttpServerExchange exchange, SessionConfig config) {
        	//System.out.println("changeSessionId");
            final String oldId = sessionId;
            String newId = sessionManager.sessionIdGenerator.createSessionId();
            this.sessionId = newId;
            try (Jedis jedis = sessionManager.jedisPool.getResource()) {
                jedis.rename(CACHE_KEY_SESSION_ID+"#"+oldId, CACHE_KEY_SESSION_ID+"#"+newId);
//            	String val = jedis.hget(CACHE_KEY_SESSION_ID, oldId);
//            	jedis.hdel(CACHE_KEY_SESSION_ID, oldId);
//            	jedis.hset(CACHE_KEY_SESSION_ID, newId, val);

            	jedis.close();
            }
            config.setSessionId(exchange, this.getId());
            sessionManager.sessionListeners.sessionIdChanged(this, oldId);
            return newId;
        }

        private void bumpTimeout() {
        	//System.out.println("bumpTimeout:"+maxInactiveInterval);
            try (Jedis jedis = sessionManager.jedisPool.getResource()) {
                Transaction transaction = jedis.multi();
                transaction.expire(CACHE_KEY_SESSION_ATTR+"#"+sessionId, (long)maxInactiveInterval);
//                transaction.expire(CACHE_KEY_SESSION_ID+"#"+sessionId, sessionManager.defaultSessionTimeout);
                transaction.exec();
                jedis.expire(CACHE_KEY_SESSION_ID+"#"+sessionId, sessionManager.defaultSessionTimeout);
            	jedis.close();
            }
        }
    }

	@Override
	public long getCreatedSessionCount() {
		//System.out.println("getCreatedSessionCount");
		try (Jedis jedis = jedisPool.getResource()) {
//			long t= jedis.scard(CACHE_KEY_SESSION_ID);
			long t = jedis.keys(CACHE_KEY_SESSION_ID+"#").size();
        	jedis.close();
			return t;
        }
	}

	@Override
	public long getMaxActiveSessions() {
		//System.out.println("getMaxActiveSessions");
		// TODO Auto-generated method stub
		return 9999;
	}

	@Override
	public long getActiveSessionCount() {
		//System.out.println("getActiveSessionCount");
//		try (Jedis jedis = jedisPool.getResource()) {
////			return jedis.keys(CACHE_KEY_SESSION_ID+"#").size();
//			return jedis.scard(CACHE_KEY_SESSION_ID);
//        }
		return getCreatedSessionCount();
	}

	@Override
	public long getExpiredSessionCount() {
		//System.out.println("getExpiredSessionCount");
		return 0;
	}

	@Override
	public long getRejectedSessions() {
		//System.out.println("getRejectedSessions");
//		return 0;
		return getCreatedSessionCount();
	}

	@Override
	public long getMaxSessionAliveTime() {
		//System.out.println("getCreatedSessionCount");
		return defaultSessionTimeout;
	}

	@Override
	public long getAverageSessionAliveTime() {
		//System.out.println("getAverageSessionAliveTime");
		return defaultSessionTimeout;
	}
	@Override
	public long getStartTime() {
		return startTime;
	}

}