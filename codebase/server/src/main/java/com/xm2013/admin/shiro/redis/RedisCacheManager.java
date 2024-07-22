package com.xm2013.admin.shiro.redis;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.apache.log4j.Logger;
import org.apache.shiro.cache.Cache;
import org.apache.shiro.cache.CacheException;
import org.apache.shiro.cache.CacheManager;


@SuppressWarnings({"unchecked","rawtypes"})
public class RedisCacheManager implements CacheManager{

	private final Logger logger = Logger.getLogger(RedisCacheManager.class);
	private final ConcurrentMap<String, Cache> caches = new ConcurrentHashMap<>();
	
	
	public static final int DEFAULT_EXPIRE = 1800;
	private int expire = DEFAULT_EXPIRE;
	
	public RedisCacheManager() {
//		logger.info("启用Redis缓存");
	}
	
	@Override
	public <K, V> Cache<K, V> getCache(String cacheName) throws CacheException {
//		logger.debug("get cache, name=" + cacheName);
		
		Cache<K, V> cache = caches.get(cacheName);

		if (cache == null) {
			cache = new RedisCache<K, V>(cacheName, expire);
			caches.put(cacheName, cache);
		}
		return cache;
	}

}
