package com.xm2013.admin.jfinal.config;

import com.alibaba.druid.DbType;
import com.alibaba.druid.filter.stat.StatFilter;
import com.alibaba.druid.wall.WallFilter;
import com.jfinal.config.Constants;
import com.jfinal.config.Handlers;
import com.jfinal.config.Interceptors;
import com.jfinal.config.JFinalConfig;
import com.jfinal.config.Plugins;
import com.jfinal.config.Routes;
import com.jfinal.ext.interceptor.SessionInViewInterceptor;
import com.jfinal.kit.Prop;
import com.jfinal.kit.PropKit;
import com.jfinal.plugin.activerecord.ActiveRecordPlugin;
import com.jfinal.plugin.activerecord.OrderedFieldContainerFactory;
import com.jfinal.plugin.activerecord.dialect.MysqlDialect;
import com.jfinal.plugin.druid.DruidPlugin;
import com.jfinal.plugin.redis.RedisPlugin;
import com.jfinal.render.ViewType;
import com.jfinal.template.Engine;
import com.xm2013.admin.basic.ctrl.AuthController;
import com.xm2013.admin.basic.ctrl.HistoryController;
import com.xm2013.admin.basic.ctrl.MenuController;
import com.xm2013.admin.basic.ctrl.PublicApiController;
import com.xm2013.admin.basic.ctrl.RoleController;
import com.xm2013.admin.basic.ctrl.UserController;
import com.xm2013.admin.common.Kit;
import com.xm2013.admin.domain.model._MappingKit;
import com.xm2013.admin.filter.CROSInterceptor;
import com.xm2013.admin.filter.GlobalInterceptor;
import com.xm2013.admin.index.IndexController;
import com.xm2013.admin.shiro.ShiroInterceptor;
import com.xm2013.admin.shiro.ShiroPlugin;
public class MainConfig extends JFinalConfig {
	//将全局配置提出来 方便其它地方重用
	private static Prop prop;
	//Druid防火墙
	private WallFilter wallFilter;
	//当前application的项目运行环境是开发(dev) or 生产(pro)
	public static String PDEV = "dev";
	//终端ID
	public static long WORKER_ID = 0;
	//数据中心ID
	public static long DATACENTER_ID = 0;
	//默认数据库类型
	public static String DB_TYPE = DbType.mysql.name();
	//id生成模式
	public static String ID_GEN_MODE = "auto";
	
	//项目否是开发模式 只要用于配置sql输出和模板热加载等
	public static boolean DEV_MODE=false;
	
	/**
	 * 配置JFinal常量
	 */
	@Override
	public void configConstant(Constants me) {
		//读取数据库配置文件
		loadConfig();
		//设置当前是否为开发模式
		me.setDevMode(prop.getBoolean("dev_mode"));
		//设置默认上传文件保存路径 getFile等使用
		me.setBaseUploadPath(prop.get("base_upload_path"));
		//设置上传最大限制尺寸
		//me.setMaxPostSize(1024*1024*10);
		//设置默认下载文件路径 renderFile使用
		me.setBaseDownloadPath(prop.get("base_download_path"));
		//设置默认视图类型
		me.setViewType(ViewType.JFINAL_TEMPLATE);
		//设置404渲染视图
		//me.setError404View("404.html");
		
		//设置启用依赖注入
		me.setInjectDependency(true);
		//设置是否对超类进行注入
		me.setInjectSuperClass(true);
		//开启使用SLF4j
		//me.setToSlf4jLogFactory();
		
		
		
	}
	/**
	 * 配置项目路由
	 * 路由拆分到 FrontRutes 与 AdminRoutes 之中配置的好处：
	 * 1：可分别配置不同的 baseViewPath 与 Interceptor
	 * 2：避免多人协同开发时，频繁修改此文件带来的版本冲突
	 * 3：避免本文件中内容过多，拆分后可读性增强
	 * 4：便于分模块管理路由
	 */
	@Override
	public void configRoute(Routes me) {
		//推荐拆分方式 如果需要就解开注释 创建对应的 Routes
		//me.add(new AdminRoutes());//配置后台管理系统路由
		
		//me.add(new WechatRoutes());//配置微信端访问路由
		
		
		//普通不拆分的方式配置 如下
		//设置默认访问首页路由 可使用http://localhost:port 直接访问 如果80端口 port可以省略
		me.add("/",IndexController.class);
		me.add("/sys/",IndexController.class);
		me.add("/public", PublicApiController.class);
		me.add("/auth", AuthController.class);
		
		
		me.add("/am/user", UserController.class);
		me.add("/am/menu", MenuController.class);
		me.add("/am/role", RoleController.class);
		me.add("/am/history", HistoryController.class);
	}
	/**
	 * 是否是生产环境
	 * @return
	 */
	public static boolean pdevIsPro() {
		return "pro".equalsIgnoreCase(PDEV);
	}
	
	/**
	 * 加载配置文件
	 */
	public static void loadConfig() {
		if (prop == null) {
			prop=PropKit.use("application.properties");
			if(prop==null){
				throw new RuntimeException("application.properties not exist!");
			}
			//读取当前配置的部署环境类型 dev是开发环境 pro是生产环境
			PDEV=prop.get("pdev", "dev").trim();
			if(pdevIsPro()) {
				prop = PropKit.append("config-pro.properties");
			}else {
				prop = PropKit.append("config.properties");
			}
			//设置当前数据库类型
			DB_TYPE=prop.get("db_type", DB_TYPE).trim();
			//设置当前是否为开发模式
			DEV_MODE=prop.getBoolean("dev_mode",false);
			//设置ID主键生成模式 默认是auto
			ID_GEN_MODE=prop.get("id_gen_mode","auto").trim();
			//设置当前节点所在数据中心ID
			DATACENTER_ID=prop.getLong("datacenter_id",0L).longValue();
			//设置当前节点所在数据中心中的终端ID
			WORKER_ID=prop.getLong("woker_id",0L).longValue();
		}
	}
	/**
	 * 获取数据库插件
	 * 抽取成独立的方法，便于重用该方法，减少代码冗余
	 */
	public static DruidPlugin getDruidPlugin() {
		loadConfig();
		return new DruidPlugin(prop.get("jdbc_url"), prop.get("user"), prop.get("password"));
	}
	/**
	 * 配置JFinal插件
	 * 数据库连接池
	 * ActiveRecordPlugin
	 * 缓存
	 * 定时任务
	 * 自定义插件
	 */
	@Override
	public void configPlugin(Plugins me) {
		loadConfig();
		
		
//		System.out.println("in mainConfig: "+getClass().getClassLoader());
		//启用shiro插件
		String redisPwd = PropKit.get("redis.password");
		String redisServer = PropKit.get("redis.server");
		Integer redisPort = PropKit.getInt("redis.port");
		RedisPlugin redis = null;
		if(Kit.isNull(redisPwd)) {
			redis = new RedisPlugin("main", redisServer, redisPort, 1800);
		}else {
			redis = new RedisPlugin("main", PropKit.get("redis.server"), PropKit.getInt("redis.port"), 1800, redisPwd);
		}
	
		me.add(redis);
		
		//配置数据库连接池插件
		DruidPlugin dbPlugin=getDruidPlugin();
		wallFilter = new WallFilter();			// 加强数据库安全
		wallFilter.setDbType("mysql");
		dbPlugin.addFilter(wallFilter);
		dbPlugin.addFilter(new StatFilter());	// 添加 StatFilter 才会有统计数据
		
		//数据映射 配置ActiveRecord插件
		ActiveRecordPlugin arp=new ActiveRecordPlugin(dbPlugin);
		arp.setShowSql(prop.getBoolean("dev_mode"));
		arp.setDialect(new MysqlDialect());
		
		//启用findByCache()切换成redis缓存，前提是启用redisPlugin插件
		arp.setCache(new ActiveRecordRedisCache());
		//查询出来的字段是按查询时的字段的顺序排序
		arp.setContainerFactory(new OrderedFieldContainerFactory());
		
		dbPlugin.setDriverClass("com.mysql.cj.jdbc.Driver");
		/********在此添加数据库 表-Model 映射*********/
		//如果使用了JFinal Model 生成器 生成了BaseModel 把下面注释解开即可
		_MappingKit.mapping(arp);
		
		//添加到插件列表中
		me.add(dbPlugin);
		me.add(arp);
		
		//启用shiro插件
		ShiroPlugin plugin = new ShiroPlugin();
		me.add(plugin);
		
		
	}
	/**
	 * 配置全局拦截器
	 */
	@Override
	public void configInterceptor(Interceptors me) {
		me.addGlobalActionInterceptor(new CROSInterceptor());
		me.addGlobalActionInterceptor(new SessionInViewInterceptor());
		me.addGlobalActionInterceptor(new ShiroInterceptor());
		me.addGlobalActionInterceptor(new GlobalInterceptor());
	}
	/**
	 * 配置全局处理器
	 */
	@Override
	public void configHandler(Handlers me) {
		//说明：druid的统计页面涉及安全性 需要自行处理根据登录权限判断是否能访问统计页面 
		//me.add(DruidKit.getDruidStatViewHandler()); // druid 统计页面功能
	}
	/**
	 * 项目启动后调用
	 */
	@Override
	public void onStart() {
		// 让 druid 允许在 sql 中使用 union
		// https://github.com/alibaba/druid/wiki/%E9%85%8D%E7%BD%AE-wallfilter
		wallFilter.getConfig().setSelectUnionCheck(false);
	}
	
	/**
	 * 配置模板引擎 
	 */
	@Override
	public void configEngine(Engine me) {
		//配置模板支持热加载
		me.setDevMode(prop.getBoolean("engine_dev_mode", false));
		//这里只有选择JFinal TPL的时候才用
		//配置共享函数模板
		//me.addSharedFunction("/view/common/layout.html")
	}
	

}
