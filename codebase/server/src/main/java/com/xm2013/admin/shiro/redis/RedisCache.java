package com.xm2013.admin.shiro.redis;

import java.util.Collection;
import java.util.Set;

import org.apache.shiro.cache.Cache;
import org.apache.shiro.cache.CacheException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.jfinal.plugin.redis.Redis;


public class RedisCache<K,V> implements Cache<K, V> {
	private static Logger logger = LoggerFactory.getLogger(RedisCache.class);

	private String cacheName;
	private int expire;
	
	public RedisCache(String name, int expire) {
		this.cacheName = name;
		this.expire = expire;
	}
	
	@Override
	public V get(K key) throws CacheException {
		logger.debug("从cacheName："+cacheName+"中，根据key [" + key + "]获取");
		if (key == null) {
			return null;
		}
		
		return Redis.use().hget(this.cacheName, key);
		
	}

	@Override
	public V put(K key, V value) throws CacheException {
		logger.debug("存储到cacheName："+cacheName+"； key [" + key + "], expire: "+expire);
		if(key == null) {
			return value;
		}
		
		Redis.use().hset(this.cacheName, key, value);
		return value;
		
	}

	@Override
	public V remove(K key) throws CacheException {
		logger.debug("从cacheName: "+this.cacheName+"，中删除 key [" + key + "]");
		return null;
	}

	@Override
	public void clear() throws CacheException {
		logger.debug("删除cacheName："+cacheName+"中删除所有元素");
        try {
            Redis.use().del(this.cacheName);
        } catch (Throwable t) {
            throw new CacheException(t);
        }
	}

	@Override
	public int size() {
		logger.debug("获取cacheName："+cacheName+"的长度");
		Long length = Redis.use().hlen(this.cacheName);
        return length.intValue();
	}

	@SuppressWarnings("unchecked")
	@Override
	public Set<K> keys() {
		logger.debug("获取cacheName："+cacheName+"的所有的keys");
		return (Set<K>) Redis.use().hkeys(this.cacheName);
	}

	@SuppressWarnings("unchecked")
	@Override
	public Collection<V> values() {
		logger.debug("获取cacheName："+cacheName+"的所有的values");
		return Redis.use().hvals(this.cacheName);
	}

}
