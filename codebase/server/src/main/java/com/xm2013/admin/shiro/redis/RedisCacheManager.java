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
