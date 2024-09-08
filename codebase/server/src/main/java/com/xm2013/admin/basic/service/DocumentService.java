package com.xm2013.admin.basic.service;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.jfinal.kit.PropKit;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;
import com.jfinal.plugin.redis.Redis;
import com.xm2013.admin.common.CacheKey;
import com.xm2013.admin.common.Kit;
import com.xm2013.admin.common.SqlKit;
import com.xm2013.admin.common.kits.CommandKit;
import com.xm2013.admin.common.kits.FileKit;
import com.xm2013.admin.domain.dto.PageInfo;
import com.xm2013.admin.domain.dto.basic.DocumentListQuery;
import com.xm2013.admin.domain.model.Document;
import com.xm2013.admin.shiro.dto.ShiroUser;

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

	public PageInfo<Document> pageList(DocumentListQuery query, ShiroUser user) {
		
		PageInfo<Document> page = new PageInfo<Document>();
		
		List<Document> docs = list(query, user);
		page.setList(docs);
		
		
		if(query.getIsTotal() && query.getStart() == 0) {
			int total = total(query, user);
			page.setTotal(total);
		}else {
			page.setTotal(docs.size());
		}
		
		return page;
	}
	
	/**
	 * 查询列表
	 * @param query
	 * @param user
	 * @return
	 */
	public List<Document> list(DocumentListQuery query, ShiroUser user) {
		
		String sql = "select t.* from sys_document as t "
				+ " left join sys_user as t1 on t1.id = t.user_id"
				+ " where "
				+ user.buildAuthCondition("t1");
		
		String where = buildWhere(query, user);
		sql += where + " group by t.id order by t.id desc limit "
				+query.getStart() + " , " + query.getLength();
		
//		System.out.println(query);
		
		return Document.dao.find(sql);
	}
	
	private int total(DocumentListQuery query, ShiroUser user) {
			
		String sql = "select count(*) from sys_document as t "
				+ " left join  sys_user as t1 on t1.id = t.user_id "
				+ " where "
				+ user.buildAuthCondition("t1");
		sql += buildWhere(query, user);
		return Db.queryInt(sql);
	}

		
	private String buildWhere(DocumentListQuery query, ShiroUser user) {
		String where = "";
		
		String basicValue = SqlKit.getSafeValue(query.getBasicValue());
		if(Kit.isNotNull(basicValue)) {
			where += " and ("
					+ " t.file_name like '"+basicValue+"%' "
					+ " or t.type like '"+basicValue+"%' "
//					+ " or email like '"+basicValue+"%' "
//					+ " or phone like '"+basicValue+"%'"
					+ ")";
			return where;
		}
		
		where += SqlKit.likeLeft("t.file_name", query.getName());
		where += SqlKit.eq("t.user_id", query.getCreater());
		where += SqlKit.eq("t.type", query.getType());
		where += SqlKit.likeLeft("t.remark", query.getRemark());
		where += SqlKit.inNo("t.id", query.getIds());
		
		where += SqlKit.buildDateRange("t.created", query.getStartDate(), query.getEndDate());
		
		return where;
	}

	public int save(Document doc) {
		
		boolean result = Db.tx(new IAtom() {
			
			@Override
			public boolean run() throws SQLException {
				boolean result = doc.save();
				return result;
			}
		});
		
		return result?doc.getId():0;
	}

	/**
	 * 删除文件，先检查权限，在删除文件，在删除对应数据权限
	 * @param ids
	 * @param user
	 * @return
	 */
	public Map<String, String> deletes(String ids, ShiroUser user) {
		
		Map<String, String> result = new HashMap<String, String>();
		
		List<Document> documents = Document.dao.find("select id, user_id, file_name, path from sys_document"
				+ " where id in ("+ids+")");
		
		String root = PropKit.get("base_upload_path");
		
		for (Document document : documents) {
			String filename = document.getFileName();
			try {
				Integer userId = document.getUserId();
				if(!user.isAdmin() && !user.isOwnerData(null, userId)) {
					result.put(filename, "没有权限");
					continue;
				}
				
				String path = document.getPath();
				Integer id = document.getId();
				CommandKit.delete(FileKit.compilePath(root, path));
				Document.dao.deleteById(id);
				
				result.put(filename, "删除成功");
			} catch (Exception e) {
				result.put(filename, "删除出错:"+e.getMessage());
			}
		}
		
		
		return result;
	}
	
	 
}
