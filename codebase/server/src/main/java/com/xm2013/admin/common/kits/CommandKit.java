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

package com.xm2013.admin.common.kits;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStream;
import java.io.InputStreamReader;

import org.apache.log4j.Logger;

public class CommandKit {
	private static Logger log = Logger.getLogger(CommandKit.class);
	public static String exec(String[] cmd) {
		
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
			String[] cmds = new String[] {
					"mkdir -p "+path,
					"chown txm.txm -R "+path,
					"chmod 755 "+path
			};
			exec(cmds);
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
			path = path.replace("/", "\\");
			String cmd = "del /Q /F /S "+path;
			System.out.println(cmd);
			exec(new String[] {
					"cmd.exe",
					"/c", "del", "/Q", "/F", "/S",
					path
			});
			
//			File file = new File(path);
//			boolean res = file.delete();
//			System.out.println(path+":"+res);
			
		}else {
			exec(new String[] {"rm -rf "+path});
		}
	}
	
}
