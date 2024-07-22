package com.xm2013.admin.basic.service;

import com.jfinal.plugin.redis.Redis;
import com.xm2013.admin.common.CacheKey;
import com.xm2013.admin.domain.model.Document;

/**
 * 文件管理类
 */
public class DocumentService {
	
	public void removeCache(Document doc) {
		Redis.use().hdel(CacheKey.DOCUMENT_ID, doc.getId());
	}
	
	public Document findById(int id) {
		return Document.dao.findFirstByCache(CacheKey.DOCUMENT_ID, id, "select * from sys_document where id=?", id);
	}
	
	
}
