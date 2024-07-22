package com.xm2013.admin.jfinal.generator;

import java.io.File;

import javax.sql.DataSource;

import com.jfinal.kit.PathKit;
import com.jfinal.kit.PropKit;
import com.jfinal.plugin.activerecord.generator.Generator;
import com.jfinal.plugin.druid.DruidPlugin;
import com.xm2013.admin.jfinal.config.MainConfig;

/**
 * 本 demo 仅表达最为粗浅的 jfinal 用法，更为有价值的实用的企业级用法
 * 详见 JFinal 俱乐部: http://jfinal.com/club
 * 
 * 在数据库表有任何变动时，运行一下 main 方法，极速响应变化进行代码重构
 */
public class _JFinalTableGenerator {
	
	public static DataSource getDataSource() {
		PropKit.use("config.properties");
		DruidPlugin druidPlugin = MainConfig.getDruidPlugin();
		druidPlugin.start();
		return druidPlugin.getDataSource();
	}
	
	public static void main(String[] args) {
//		String webRoot = PathKit.getRootClassPath();
//		webRoot = new File(webRoot).getParentFile().getParent();
//		System.out.println(webRoot);
//		System.out.println(_JFinalDemoGenerator.class.getResource("xm_base_model_template.jf").getPath());
		
		// base model 所使用的包名
		String baseModelPackageName = "com.xm2013.admin.domain.base";
		// base model 文件保存路径
		String webRoot = PathKit.getRootClassPath();
		webRoot = new File(webRoot).getParentFile().getParent();
		String baseModelOutputDir = webRoot + "/src/main/java/com/xm2013/admin/domain/base";
		
		// model 所使用的包名 (MappingKit 默认使用的包名)
		String modelPackageName = "com.xm2013.admin.domain.model";
		// model 文件保存路径 (MappingKit 与 DataDictionary 文件默认保存路径)
		String modelOutputDir = baseModelOutputDir + "/../model"; 
		
		// 创建生成器
		DataSource ds = getDataSource();
		Generator generator = new Generator(ds, baseModelPackageName, baseModelOutputDir, modelPackageName, modelOutputDir);
		// 设置是否生成链式 setter 方法
		generator.setGenerateChainSetter(false);
		// 添加不需要生成的表名
//		generator.addExcludedTable("adv");
		// 设置是否在 Model 中生成 dao 对象
		generator.setGenerateDaoInModel(false); 
		
		generator.setMetaBuilder(new _MetaBuilder(ds));
		
		//设置自定义模板
//		String templatePath = _JFinalDemoGenerator.class.getResource("xm_base_model_template.jf").getPath();
		generator.setBaseModelTemplate("./xm_base_model_template.jf");
		
		//生成备注
		generator.setGenerateRemarks(true);
		//是否生成默认dao对象
		generator.setGenerateDaoInModel(true);
		
		// 设置是否生成链式 setter 方法
		generator.setGenerateChainSetter(true);
		// 设置是否生成字典文件
//		generator.setGenerateDataDictionary(true); 
		// 设置需要被移除的表名前缀用于生成modelName。例如表名 "osc_user"，移除前缀 "osc_"后生成的model名为 "User"而非 OscUser
		
		generator.setRemovedTableNamePrefixes("sys","t");		// 生成
		generator.generate();
	}
}




