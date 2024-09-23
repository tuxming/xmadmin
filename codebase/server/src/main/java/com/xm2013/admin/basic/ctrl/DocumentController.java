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

package com.xm2013.admin.basic.ctrl;


import java.io.File;
import java.io.IOException;
import java.util.Date;
import java.util.Map;
import java.util.Random;

import org.apache.log4j.Logger;

import com.jfinal.aop.Inject;
import com.jfinal.upload.UploadFile;
import com.xm2013.admin.annotation.Op;
import com.xm2013.admin.annotation.RequirePermission;
import com.xm2013.admin.basic.service.DocumentService;
import com.xm2013.admin.common.kits.FileKit;
import com.xm2013.admin.common.kits.ImgKit;
import com.xm2013.admin.common.kits.CommandKit;
import com.xm2013.admin.common.kits.JsonKit;
import com.xm2013.admin.domain.dto.JsonResult;
import com.xm2013.admin.domain.dto.PageInfo;
import com.xm2013.admin.domain.dto.basic.DocumentListQuery;
import com.xm2013.admin.domain.model.Document;
import com.xm2013.admin.exception.BusinessErr;
import com.xm2013.admin.exception.BusinessException;
import com.xm2013.admin.exception.Msg;
import com.xm2013.admin.shiro.ShiroKit;
import com.xm2013.admin.shiro.dto.ShiroUser;

public class DocumentController extends BaseController{
	private static Logger log = Logger.getLogger(DocumentController.class);
	
	@Inject
	private DocumentService documentService ;
	
	@RequirePermission(val="sys:doc:list", name="文档列表", group="system")
	@Op("文档列表")
	public void list() {
		DocumentListQuery query = JsonKit.getObject(getRawData(), DocumentListQuery.class);
		
		if(query == null) {
//			throw new BusinessException(BusinessErr.NULL_PARAM);
			renderJson(JsonResult.error(BusinessErr.NULL_PARAM));
			return;
		}
		
		PageInfo<Document> users = documentService.pageList(query, ShiroKit.getLoginUser());
		renderJson(JsonResult.ok(Msg.OK_GET, users));
	}
	
	
	/**
	 * <pre>文件，不需要权限</pre>
	 * @param type: 文件类型, 也就是子路径
	 * @param press: 是否压缩：0-不压缩，1-压缩， 仅对图片有效
	 * @author tuxming
	 * @date 2020年5月21日
	 */
	@Op("上传文件")
	@RequirePermission(val="sys:doc:upload", name="上传文件", group="system")
	public void upload(){
		
		UploadFile picFiles=getFile();
		File file = picFiles.getFile();
		
		String originFilename = picFiles.getOriginalFileName();
		String path = file.getAbsolutePath();
		
		String type = getPara("type", "common");
		String press = getPara("press", "1");
		
		String uploadPath = picFiles.getUploadPath();
		
		ShiroUser user = ShiroKit.getLoginUser();
		
		String ext = "";
		int idx = originFilename.lastIndexOf(".");
		if(idx > -1) {
			ext = originFilename.substring(idx+1).toLowerCase();
		}
		
		String targetFilename = System.currentTimeMillis()+String.format("%03d", new Random().nextInt(100))+"."+ext;
		String relativeFile = FileKit.compilePath(user.getId()+"",type, targetFilename);
		
		String targetPath = FileKit.compilePath(uploadPath, user.getId()+"", type);
		
		log.debug("curr:"+file.getAbsolutePath()+", target path:"+targetPath);
		
		File dir = new File(targetPath);
		if(!dir.exists()){
			CommandKit.mkdirs(dir.getAbsolutePath());
//			dir.mkdirs();
		}
		
		boolean saved = false;
		if("jpg,jpeg,png".indexOf(ext)>-1 && press.equals("1")) {
			String filepath = targetPath+"/"+targetFilename;
			try {
				ImgKit.of(file).size(1600, 1600).quality(0.8f).toFile(filepath);
				saved = true;
			} catch (IOException e) {
				log.error(e.getMessage(), e);
				saved = false;
			} finally {
				try {
					file.delete();
				} catch (Exception e2) {
				}
			}
		}else {
			saved = file.renameTo(new File(targetPath, targetFilename));
		}
		
		//添加
		if(saved) {
			Document doc = new Document();
			
			doc.setFileName(originFilename);
			doc.setPath(relativeFile);
			doc.setCreated(new Date());
			doc.setUserId(user.getId());
			doc.setType(type);
			int id = documentService.save(doc);
			if(id > 0){
				renderJson(JsonResult.ok(Msg.OK_UPLOAD, doc.getId()));
			}else{
				renderJson(JsonResult.error(Msg.ERR_UPLOAD));
			}

		}else {
			renderJson(JsonResult.error(Msg.ERR_UPLOAD));
		}
		
//		try {
//			CommandKit.delete(path);
//		} catch (Exception e) {
//			log.error(e.getMessage(), e);
//		}
//		try {
//			File tmpFile = new File(path);
//			if(tmpFile.exists()) {
//				tmpFile.delete();
//			}
//		}catch (Exception e) {
//			log.error(e.getMessage(),e);
//		}
		
	}
	
	@RequirePermission(val="sys:doc:delete", name="删除文档", group="system")
	@Op("删除文档")
	public void deletes() {
		String ids = getPara("ids");
		if(ids == null || !ids.matches("[\\d,]+")) {
			renderJson(JsonResult.error(BusinessErr.NULL_PARAM));
			return;
		}
		
		Map<String, String> results = documentService.deletes(ids, ShiroKit.getLoginUser());
		
//		System.out.println(results);
		renderJson(JsonResult.ok(Msg.OK_DELETE, "600", results));
	}
	
}
