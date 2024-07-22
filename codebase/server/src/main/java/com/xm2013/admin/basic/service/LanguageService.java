package com.xm2013.admin.basic.service;

import java.util.List;

import com.xm2013.admin.domain.model.Language;
import com.xm2013.admin.domain.model.LanguageResource;

public class LanguageService {

	public List<LanguageResource> findResources(String lng, String ns) {
		return LanguageResource.dao.find("select t.* from sys_language_resource as t "
				+ " left join sys_language as t1 on t1.id = t.language_id "
				+ " where t1.code=? and t.category=? ", lng, ns);
	}

	public Language findLangByKey(String key) {
		return Language.dao.findFirst("select * from sys_language where code=?", key);
	}

	public void saveResource(LanguageResource res) {
		res.save();
	}
	
	
	
}
