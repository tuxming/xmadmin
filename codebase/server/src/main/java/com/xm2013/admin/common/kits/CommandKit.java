package com.xm2013.admin.common.kits;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStream;
import java.io.InputStreamReader;

import org.apache.log4j.Logger;

public class CommandKit {
	private static Logger log = Logger.getLogger(CommandKit.class);
	public static String exec(String cmd) {
		
		String result = "";
		
		log.debug(cmd);
		try {
			
			Process p = Runtime.getRuntime().exec(cmd);
			
			//取得命令结果的输出流    
			InputStream fis=p.getInputStream();    
			//用一个读输出流类去读    
			InputStreamReader isr=new InputStreamReader(fis);    
			//用缓冲器读行    
			BufferedReader br=new BufferedReader(isr);    
			String line=null;   
			
			//直到读完为止    
			while((line = br.readLine())!=null)    
			{    
				result += line+"\n";
			}  
			log.debug(result);  
		} catch (Exception e) {
			log.error(e.getMessage(), e);
		}
		
		
		return result;
	}
	
	
	public static void mkdirs(String path) {
		
		String os = System.getProperty("os.name").toLowerCase();
		if(os.indexOf("windows")>-1) {
			File dir = new File(path);
			dir.mkdirs();
		}else {
			exec("mkdir -p "+path);
			exec("chown txm.txm -R "+path);
			exec("chmod 755 "+path);
		}
	}
	
	/**
	 * 防止被非法删除
	 * @param path
	 */
	public static void delete(String path) {
		
		path = path.replace("\\", "/");
		if(path.split("/").length<3) {  //正常的业务文件一般不会小于3级目录，这里做的一个简单防止非法删除逻辑
			return;
		}
		
		String os = System.getProperty("os.name").toLowerCase();
		if(os.indexOf("windows")>-1) {
//			path = path.replace("/", "\\");
			exec("del /Q /F /S "+path);
//			File file = new File(path);
//			boolean res = file.delete();
			System.out.println("rm -rf "+path);
//			System.out.println(path+":"+res);
			
		}else {
			exec("rm -rf "+path);
		}
	}
	
}
