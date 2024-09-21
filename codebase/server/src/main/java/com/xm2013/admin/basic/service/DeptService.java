package com.xm2013.admin.basic.service;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.jfinal.aop.Inject;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.IAtom;
import com.jfinal.plugin.activerecord.Record;
import com.jfinal.plugin.redis.Redis;
import com.xm2013.admin.common.CacheKey;
import com.xm2013.admin.common.kits.FileKit;
import com.xm2013.admin.domain.dto.PageInfo;
import com.xm2013.admin.domain.dto.basic.DeptQuery;
import com.xm2013.admin.domain.model.Dept;
import com.xm2013.admin.domain.model.User;
import com.xm2013.admin.exception.BusinessErr;
import com.xm2013.admin.exception.BusinessException;
import com.xm2013.admin.shiro.dto.ShiroUser;
import static com.xm2013.admin.common.CacheKey.SESSION_KEY_DEPT_ID;
import static com.xm2013.admin.common.CacheKey.SESSION_KEY_DEPT_PARENT_ID;
import static com.xm2013.admin.common.CacheKey.SESSION_KEY_DEPT_PATH;
import static com.xm2013.admin.common.CacheKey.SESSION_KEY_DEPT_CHILD_PATH;

public class DeptService {
		
	private static String sql = "select t.*, "
			+ " t1.name as parentName, t1.path as parentPath, t1.path_name as parentPathName "
			+ " from sys_dept as t left "
			+ " join sys_dept as t1 on t1.id = t.id "
			+ " where ";
	
	@Inject
	private UserService userService;
	
	public Dept findById(int deptId) {
		return Dept.dao.findFirstByCache(SESSION_KEY_DEPT_ID, deptId, sql + " t.id = ?", deptId);
	}

	public List<Dept> findByParent(int id) {
		return Dept.dao.findByCache(SESSION_KEY_DEPT_PARENT_ID, id, sql + " t.parent_id=?", id);
	}
	
	public Dept findByPath(String path){
		return Dept.dao.findFirstByCache(SESSION_KEY_DEPT_PATH, path, sql + " t.path = ?", path); 
	}
	
	public List<Dept> findByChildPath(String path){
		return Dept.dao.find(SESSION_KEY_DEPT_CHILD_PATH, path, sql + " t.like = '"+path+"%'"); 
	}
	
	private void removeCache(Dept dept) {
		if(dept == null) {
			return;
		}
		Redis.use().hdel(CacheKey.SESSION_KEY_DEPT_ID, dept.getId());
		Redis.use().hdel(CacheKey.SESSION_KEY_DEPT_PARENT_ID, dept.getParentId());
		Redis.use().hdel(CacheKey.SESSION_KEY_DEPT_PATH, dept.getPath());
		Redis.use().hdel(CacheKey.SESSION_KEY_DEPT_CHILD_PATH, dept.getPath());
	}
	

	/**
	 * 新建节点, 只能保存在自己具有数据权限的组织下面，如果没有组织权限，则不能保存
	 * @param dept
	 * @param user
	 * @return
	 */
	public int create(Dept dept, ShiroUser user) {
		
		int parentId = dept.getParentId();
		final Dept parentDb = Dept.dao.findById(parentId);
		
		//判断是否拥有上级节点的权限
		if(!user.isAdmin()) {
			if(parentDb == null || !user.isOwnerData(parentDb.getPath())) {
				throw new BusinessException(BusinessErr.ERR_NO_DATA_AUTH);
			}
		}
		Db.tx(new IAtom() {
			
			@Override
			public boolean run() throws SQLException {
				//保存组织：
				dept.setPath("");
				dept.setPathName("");
				dept.save();
				//生成path, 和pathname
				Dept updateDept = new Dept();
				updateDept.setId(dept.getId())
					.setPath(FileKit.compilePath(parentDb.getPath(), dept.getId()+""))
					.setPathName(FileKit.compilePath(parentDb.getPathName(), dept.getName()))
				;
				updateDept.update();
				
				return true;
			}
		});
		
		return dept.getId();
	}

	/**
	 * 根据parentId获取组织节点， 如果parentId==null则获取当前登录用户的数据权限的组织节点
	 * @param query
	 * @param user
	 * @return
	 */
	@SuppressWarnings("rawtypes")
	public PageInfo<Dept> pageList(DeptQuery query, ShiroUser user) {
		PageInfo<Dept> page = new PageInfo<Dept>();
		
		List<Dept> depts = list(query, user);
		
		if(!depts.isEmpty()) {
			String parentIds = depts.stream().map(d -> d.getId()+"").collect(Collectors.joining(","));
			List<Record> counts = Db.find("select parent_id, count(*) as total from sys_dept where parent_id in ("+parentIds+") group by parent_id");
			Map<Integer, Record> maps = counts.stream()
					.collect(Collectors.toMap(s -> s.getInt("parent_id"), s -> s));
			
			depts.forEach(d -> {
				Record totalRecord = maps.get(d.getId().intValue());
				
				int total = 0;
				if(totalRecord != null ) {
					Integer t = totalRecord.getInt("total");
					if(t!=null && t>0) {
						total = t;
					}
				}
				
				d.put("hasChildren", total > 0);
				d.put("isLeaf", total == 0);
				d.put("children", total>0?new ArrayList() : null);
				if(total>0) {
					d.put("total", total);
				}
			});
		}
		
		page.setList(depts);
		
		
//		if(query.getStart() == 0) {
//			int total = total(query, user);
//			page.setTotal(total);
//		}
		page.setTotal(depts.size());
		
		return page;
	}

	
//	private int total(DeptQuery query, ShiroUser user) {
//		String sql = "select count(*) from sys_dept as t ";
//		sql += buildWhere(query, user);
//		
//		return Db.queryInt(sql);
//	}
	

	private List<Dept> list(DeptQuery query, ShiroUser user) {
		
		String sql = "select t.*, t1.name as parentName from sys_dept as t "
				+ " left join sys_dept as t1 on t1.id = t.parent_id "
				;
		
		sql += buildWhere(query, user);
		
		return Dept.dao.find(sql);
	}
	
	private String buildWhere(DeptQuery query, ShiroUser user) {
		String where = "";
		
		String parentId = "";
		
		if(!user.isAdmin()) {
			if(user.getDeptIds()!=null && user.getDeptIds().size()>0) {
				where += " and dept_id in ("+user.getDeptIds().stream().map(s -> s+"").collect(Collectors.joining(","))+") ";
			}else {
				where += " and dept_id = null";
			}
			
			if(query.getParentId() == null) {
				List<Integer> deptIds = user.getDeptIds();
				if(deptIds==null || deptIds.isEmpty()) {
					parentId = "-1";
				}else {
					parentId = deptIds.stream().map(s -> s + "").collect(Collectors.joining(","));
				}
			}else {
				parentId = query.getParentId()+"";
			}
			
		}else {
			if(query.getParentId()== null) {
				parentId = "0";
			}else {
				parentId = query.getParentId()+"";
			}
		}
		
		if(parentId.contains(",")) {
			where += " and t.parent_id in ("+parentId+")";
		}else {
			where += " and t.parent_id="+parentId;
		}
		
		where = where.trim();
		if(where.startsWith("and")) {
			where = where.substring(3);
		}
		
		if(where.length() == 0) {
			return "";
		}else {
			return " where "+where;
		}
		
	}
	
	/**
	 * 更新组织， 如果修改了组织节点，则只能在自己数据权限下面的节点移动
	 * @param dept
	 * @param loginUser
	 */
	public void update(Dept dept, ShiroUser user) {
		
		Dept db = Dept.dao.findById(dept.getId());
		if(db == null) {
			throw new BusinessException(BusinessErr.NO_DATA);
		}
		
		if(!user.isOwnerData(dept.getName())) {
			throw new BusinessException(BusinessErr.ERR_NO_DATA_AUTH);
		}
		
		Db.tx(new IAtom() {
			
			@Override
			public boolean run() throws SQLException {
				
				Dept updateDept = new Dept()
						.setId(dept.getId());
				
				List<Dept> updateChilds = null;
				
				//是否修改了父级节点
				Integer parentId = dept.getParentId();
				if(parentId!=null && parentId.intValue()!=db.getParentId()) {
					//不能把上级节点设置为自己
					if(dept.getParentId() == dept.getId()) {
						throw new BusinessException(BusinessErr.ERROR, "上级节点不能是自己");
					}
					
					//判断修改后的节点是否具有权限
					Dept targetParent = Dept.dao.findById(parentId);
					
					if(targetParent == null) {
						throw new BusinessException(BusinessErr.ERROR, "目标节点不存在");
					}
					
					//不能把上级节点设置为自己的下级
					if(targetParent.getPath().startsWith(db.getPath())) {
						throw new BusinessException(BusinessErr.ERROR, "上级节点不能是自己的子节点");
					}
					
					if(!user.isOwnerData(targetParent.getPath())) {
						throw new BusinessException(BusinessErr.ERROR, "没有目标节点的权限");
					}
					
					updateDept.setParentId(parentId);
					updateDept.setPath(FileKit.compilePath(targetParent.getPath(), dept.getId()+"/"));
					updateDept.setPathName(FileKit.compilePath(targetParent.getPathName(), dept.getName()+"/"));
					
					//更新所有子节点
					updateChilds=updateChildrens(db.getPath(), updateDept.getPath(), db.getPathName(), updateDept.getPathName());
				}
				
				if(!db.getName().equals(dept.getName())) {
					updateDept.setName(dept.getName().trim());
					Dept parent = Dept.dao.findById(db.getParentId());
					//更新子节点
					String newPathName = FileKit.compilePath(parent.getPathName(), dept.getName()+"/");
					updateDept.setPathName(newPathName);
					if(updateChilds!=null) {
						updateChilds.forEach(d -> {
							d.setPathName(d.getPathName().replace(db.getPathName(), newPathName).replace("//", "/"));
						});
					}else {
						updateChilds = updateChildrens(db.getPath(), db.getPath(), db.getPathName(), newPathName);
					}
				}
				
				
				if(dept.getType()!=null && db.getType().intValue()!= dept.getType()) {
					updateDept.setType(dept.getType());
				}
				
				updateDept.update();
				if(updateChilds!=null && updateChilds.size()>0) {
					Db.batchUpdate(updateChilds, updateChilds.size());
				}
				
				removeCache(db);
				return true;
			}
		});
	}
	
	private List<Dept> updateChildrens(String oldPath, String newPath, String oldPathName, String newPathName){
		List<Dept> depts = findByChildPath(oldPath);
		List<Dept> udepts = new ArrayList<Dept>();
		if(!depts.isEmpty()) {
			depts.forEach(d -> {
				udepts.add(
					new Dept().setId(d.getId())
						.setPath(d.getPath().replace(oldPath, newPath).replace("//", "/"))
						.setPathName(d.getPathName().replace(oldPathName, newPathName).replace("//", "/"))
				);
			});
		}
		return udepts;
	}

	/**
	 * 删除节点及其所有的子节点
	 * @param id
	 * @param user
	 * @return
	 */
	public String delete(int id, ShiroUser user) {
		Dept dept = Dept.dao.findById(id);
		if(dept == null) {
			return "数据不存在";
		}
		
		if(!user.isOwnerData(dept.getPath())) {
			return "没有数据权限";
		}
		dept.delete();
		
		Db.delete("delete from sys_dept where path like '"+dept.getPath()+"%'");
		removeCache(dept);
		
		return null;
	}

	public List<Dept> dataPermissions(int userId, int type, ShiroUser loginUser) {
		User user = userService.findById(userId);
		if(user==null || !loginUser.isOwnerData(user.getStr("deptPath"), user.getId())) {
			return new ArrayList<Dept>();
		}
		
		String sql = "select t.id as deptId, t.path, t.name, t.path_name, t1.id as id from sys_dept as t "
				+ " left join sys_user_data as t1 on t1.ref_id = t.id "
				+ " where ";
		sql += " t1.user_id="+userId;
		sql += " and t1.type="+type;
		
		return Dept.dao.find(sql);
	}

	
}
