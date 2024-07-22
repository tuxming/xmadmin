package com.xm2013.admin.jfinal.config;

import com.jfinal.plugin.activerecord.cache.ICache;
import com.jfinal.plugin.redis.Redis;

/**
 * 实现redis的ActiveRecord的缓存，
 * Db.findByCacche(); 这样的代码将有redis接管，在MainConfig中arp.setCache(new ActiveRecordRedisCache());
 */
public class ActiveRecordRedisCache implements ICache{
	
	@Override
	public <T> T get(String cacheName, Object key) {
		  if (key == null) {
            return null;
        } else {
            return Redis.use().hget(cacheName, key);
        }
	}

	@Override
	public void put(String cacheName, Object key, Object value) {
		Redis.use().hset(cacheName, key, value);
	}

	@Override
	public void remove(String cacheName, Object key) {
		Redis.use().hdel(cacheName, key);
	}

	@Override
	public void removeAll(String cacheName) {
		Redis.use().del(cacheName);
	}

}
