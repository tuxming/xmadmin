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
		if(key == null) {
			return null;
		}
		
		// 先获取要删除的值
		V value = Redis.use().hget(this.cacheName, key);
		// 然后删除
		Redis.use().hdel(this.cacheName, key);
		return value;
	}

	@Override
	public void clear() throws CacheException {
		logger.debug("删除cacheName："+cacheName+"中删除所有元素");
		try {
			// 确保删除整个 hash
			Redis.use().del(this.cacheName);
			logger.debug("成功清除缓存：" + this.cacheName);
		} catch (Throwable t) {
			logger.error("清除缓存失败：" + this.cacheName, t);
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

	public String getCacheName() {
		return this.cacheName;
	}

}
