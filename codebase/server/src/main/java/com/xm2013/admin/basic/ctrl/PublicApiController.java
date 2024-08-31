package com.xm2013.admin.basic.ctrl;

import java.io.File;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.jfinal.aop.Inject;
import com.jfinal.kit.PropKit;
import com.xm2013.admin.basic.service.DocumentService;
import com.xm2013.admin.basic.service.LanguageService;
import com.xm2013.admin.common.Kit;
import com.xm2013.admin.common.http.Http;
import com.xm2013.admin.common.http.Response;
import com.xm2013.admin.common.kits.JsonKit;
import com.xm2013.admin.domain.dto.JsonResult;
import com.xm2013.admin.domain.model.Document;
import com.xm2013.admin.domain.model.Language;
import com.xm2013.admin.domain.model.LanguageResource;
import com.xm2013.admin.domain.model.LanguageResourceGroup;
import com.xm2013.admin.exception.Msg;


public class PublicApiController extends BaseController{
	
	@Inject
	private DocumentService documentService;
	@Inject
	private LanguageService languageService;
	
//	public void pddjs() throws Exception {
//		
//		HttpServletResponse response = getResponse();
//		response.setContentType("application/javascript");
//		response.setHeader("Pragma","no-cache");
//		response.setHeader("Cache-Control","max-age=31536000");
//		response.setHeader("Access-Control-Allow-Origin","*");
//		
//		InputStream fis = PublicApiController.class.getResourceAsStream("/react_goods_8c8de440d4ab469ad81b_1026.js");
//		byte[] bs = new byte[fis.available()];
//		fis.read(bs);
//		fis.close();
//		getResponse().getOutputStream().write(bs);
//		
////		renderFile(file);
//	}
	
	/**
	 * 加载图片
	 * w: 宽
	 * h: 高
	 * id: 图片id
	 */
	public void img() {
		
		int id = getParaToInt("id", 0);
		
		if(id == 0) {
			renderLogo();
			return;
		}
		
		Document doc = documentService.findById(id);
		if(doc == null) {
			renderLogo();
			return;
		}
		
		String root = PropKit.get("base_upload_path");
		if(Kit.isNull(root)) {
			renderLogo();
			return;
		}
		
		String filepath = doc.getPath();
		File file = new File(root, filepath);
		if(!file.exists()) {
			renderLogo();
			return;
		}
		
		String ext = filepath.substring(filepath.lastIndexOf(".")+1);
		
		renderImage(file, doc.getFileName(), ext);
	}
	
	/**
	 * 返回一个logo图片
	 */
	private void renderLogo() {
		String path = "/logo.png";
		try {
			path = this.getClass().getResource("/").toURI().getRawPath();
		} catch (URISyntaxException e) {
			renderNull();
		}
		renderImage(path+"/logo.png", "logo.png", "png");
	}
	
	/**
	 * 加载360壁纸分类的api
	 */
	public void wallpaperAllCategories() {
		
		Response response = Http.xdo("http://cdn.apc.360.cn/index.php?c=WallPaper&a=getAllCategoriesV2&from=360chrome")
			.addHeader("User-Agent","Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
			.get();
		renderJson(response.getString());
	}
	
	/**
	 * 加载360壁纸列表的api
	 */
	public void wallpaperImageList() {
		String id = getPara("id");
		String count = getPara("count", "20");
		String start = getPara("start", "0");
		
		
		Response response = Http.xdo("http://wallpaper.apc.360.cn/index.php?c=WallPaper&a=getAppsByCategory&cid="+id+"&start="+start+"&count="+count+"&from=360chrome")
				.addHeader("User-Agent","Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
				.get();
			renderJson(response.getString());
	}
	
	/**
	 * 加载i18n资源
	 */
	public void locales() {
//		String lng = getAttr("lng");
//		String ns = getAttr("ns");
		String lng = getPara("lng");
		String ns = getPara("ns");
		
//		System.out.println(lng + ", "+ ns);
		
		List<LanguageResource> resoureces = languageService.findResources(lng, ns);
		
		Map<String, String> resMap = resoureces.stream().collect(Collectors.toMap(s -> s.getResKey(), s-> s.getResValue(), (k1, k2)->k1));
		
		renderJson(JsonKit.toJson(resMap));
		
	}
	
	/**
	 * 添加i18n的key
	 */
	public void localesAdd() {
		String lng = getPara("lng");
		String ns = getPara("ns");
		
		Map<String, String> kv = JsonKit.getMap(getRawData(), String.class, String.class);
		
		if(lng == null || ns == null || kv == null || kv.size()==0) {
			renderNull();
			return;
		}
		
		String key = null;
		String value = null;
		for(String k: kv.keySet()) {
			key = k;
			value = kv.get(k);
		}
		
		Language lang = languageService.findLangByKey(lng);
		if(lang== null) {
			renderNull();
			return;
		}
		
		try {
			LanguageResourceGroup g = new LanguageResourceGroup();
			g.setName(ns);
			g.save();
		} catch (Exception e) {
			// TODO: handle exception
		}
		
		LanguageResource res = new LanguageResource()
				.setLanguageId(lang.getId())
				.setCategory(ns)
				.setResKey(key)
				.setResValue(value);
		
		languageService.saveResource(res);
		renderJson(JsonResult.ok(Msg.OK_UPDATE));
	}
	
	
}
