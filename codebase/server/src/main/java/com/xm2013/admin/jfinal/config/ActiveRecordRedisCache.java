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
