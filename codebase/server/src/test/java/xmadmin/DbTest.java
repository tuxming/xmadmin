package xmadmin;

import java.util.List;

import com.jfinal.kit.Prop;
import com.jfinal.kit.PropKit;
import com.jfinal.plugin.activerecord.ActiveRecordPlugin;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.druid.DruidPlugin;
import com.xm2013.admin.domain.model._MappingKit;

public class DbTest {
	public static void main(String[] args) {
		startArp();
		
//		Role role = Role.dao.findById(1);
//		System.out.println(role);
		List<Integer> ids = Db.query("select id from sys_role");
		System.out.println(ids);
		
	}
	
	private static void startArp() {
		Prop prop = PropKit.use("application.properties");
		
//		System.out.println(prop.get("jdbc_url"));
//		System.out.println(prop.get("user"));
//		System.out.println(prop.get("password"));
		
		DruidPlugin dp1 = new DruidPlugin(
			prop.get("jdbc_url"), 
			prop.get("user"), 
			prop.get("password")
		);
		ActiveRecordPlugin arp1 = new ActiveRecordPlugin("local",dp1);
		_MappingKit.mapping(arp1);

		// 与 jfinal web 环境唯一的不同是要手动调用一次相关插件的start()方法
		
		dp1.start();
		arp1.start();
	}
	
}
