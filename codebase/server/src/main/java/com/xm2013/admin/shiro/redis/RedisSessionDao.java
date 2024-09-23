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

package com.xm2013.admin.shiro.redis;

import java.io.Serializable;

import org.apache.log4j.Logger;
import org.apache.shiro.cache.Cache;
import org.apache.shiro.session.Session;
import org.apache.shiro.session.UnknownSessionException;
import org.apache.shiro.session.mgt.eis.CachingSessionDAO;

public class RedisSessionDao extends CachingSessionDAO{

	private static final Logger LOGGER = Logger.getLogger(RedisSessionDao.class);
	
	private Cache<Serializable, Session> activeSessions;
	
//    /**
//     * 此编码需要与 RedisServiceImpl 类中编码一致
//     * 用于解析每个session的Key
//     */
//    private static final String DEFAULT_CHARSET = "UTF-8";
//    
//    /**
//     * 过期时间
//     */
//    private Long expireSeconds = 1800L;
 
    @Override
    public void update(Session session) throws UnknownSessionException {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("更新Session:"+session.getId());
        }
        this.saveSession(session);
    }
 
    @Override
    public void delete(Session session) {
        if (session == null || session.getId() == null) {
            LOGGER.error("session对象(或者sessionId)为空.");
            return;
        }
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("删除Session:"+session.getId());
        }
        //通过sessionId删除session
        if(activeSessions==null) {
        	this.activeSessions  = createActiveSessionsCache();
        }
        
        this.activeSessions.remove(session.getId());
 
    }
 
    @Override
    protected Serializable doCreate(Session session) {
        //分配sessionId
        final Serializable sessionId = this.generateSessionId(session);
        this.assignSessionId(session, sessionId);
        //保存session并存储到Redis集群中
        this.saveSession(session);
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("创建Session:"+sessionId);
        }
        return sessionId;
    }
 
    @Override
    protected Session doReadSession(Serializable sessionId) {
        if (sessionId == null) {
            LOGGER.error("sessionId为空.");
            return null;
        }
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("读取Session:"+ sessionId);
        }
        //与saveSession是反操作，通过sessionId获取Key的字节数据
//        final byte[] key = this.getByteKey(sessionId);
        //再通过key的字节数据找到value的字节数据
//        final byte[] value = redisService.get(key);
//        //最后再反序列化得到session对象
//        return SerializerUtil.deserialize(value);
        if(activeSessions==null) {
        	this.activeSessions  = createActiveSessionsCache();
        }
        
//        return getCachedSession(sessionId);
        return this.activeSessions.get(sessionId);
    }
 
    /**
     * 保存session
     * sessionId -> key[]
     * session   -> value[]
     *
     * @param session Session对象
     * @throws UnknownSessionException 未知Session异常
     */
    private void saveSession(Session session) throws UnknownSessionException {
        if (session == null || session.getId() == null) {
            LOGGER.error("session对象(或者sessionId)为空.");
            return;
        }
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("保存Session:"+session.getId());
        }
        //sessionId -> key[]
//        final byte[] key = getByteKey(session.getId());
//        //session   -> value[]
//        final byte[] value = SerializerUtil.serialize(session);
//        session.setTimeout(getExpireSeconds());
//        
        //save To Redis
//        this.redisService.setEx(key, value, getExpireSeconds());
//        getActiveSessionsCache().put(session.getId(), session);
        if(activeSessions==null) {
        	this.activeSessions  = createActiveSessionsCache();
        }
        this.activeSessions.put(session.getId(), session);
    }
 
	@Override
	protected void doUpdate(Session session) {
		this.update(session);
	}

	@Override
	protected void doDelete(Session session) {
		this.delete(session);
	}


}
