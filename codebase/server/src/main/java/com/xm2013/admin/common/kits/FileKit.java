package com.xm2013.admin.common.kits;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Base64;

import javax.imageio.ImageIO;

import org.apache.log4j.Logger;

/**
 * @desc 文件工具类
 * @author tuxming
 * @date 2020年4月28日
 */
public class FileKit {
	
	private static Logger log = Logger.getLogger(FileKit.class);
	
	/**
	 * <pre>获取系统的临时目录路径</pre>
	 * @author tuxming
	 * @date 2020年4月29日
	 * @return String eg: C:\Users\ADMINI~1\AppData\Local\Temp\
	 */
	public static String getTempDirectoryPath() {  
        return System.getProperty("java.io.tmpdir");  
	} 
	
	/**
	 * <pre>获取代表系统临时目录的文件</pre>
	 * @author tuxming
	 * @date 2020年4月29日
	 * @return File
	 */
	public static File getTempDirectory() {  
        return new File(getTempDirectoryPath());  
	}
	
	/**
	 * <pre>获取用户的主目录路径</pre>
	 * @author tuxming
	 * @date 2020年4月29日
	 * @return String C:\Users\Administrator
	 */
	public static String getUserDirectoryPath() {  
        return System.getProperty("user.home");  
	}
	

//	/**
//     * @desc 获取一个文件的md5值(可处理大文件)
//     * @return md5 value
//     */
//    public static String getMD5(File file) {
//        return disgestFile(file, "MD5");
//    }
//    
//    /**
//     * @desc 获取文件摘要，SHA1
//     * @author tuxming
//     * @param file
//     * @return 16进制的摘要值
//     */
//    public static String getSHA1(File file) {
//    	return disgestFile(file, "SHA1");
//    }
    
    /**
     * @desc 获取文件摘要
     * @author tuxming
     * @param file
     * @param method： MD5, SHA-1, SHA-224, SHA-256,SHA-384, SHA-512
     * @return 16进制的摘要值
     */
//    public static String disgestFile(File file, String method) {
//    	FileInputStream fileInputStream = null;
//        try {
//            MessageDigest MD5 = MessageDigest.getInstance(method);
//            fileInputStream = new FileInputStream(file);
//            byte[] buffer = new byte[8192];
//            int length;
//            while ((length = fileInputStream.read(buffer)) != -1) {
//                MD5.update(buffer, 0, length);
//            }
//            return new String(Tools.byteToHex(MD5.digest()));
//        } catch (Exception e) {
//            e.printStackTrace();
//            return null;
//        } finally {
//            try {
//                if (fileInputStream != null){
//                    fileInputStream.close();
//                    }
//            } catch (IOException e) {
//                e.printStackTrace();
//            }
//        }
//    }
    
    /**
	 * @desc 组合文件路径
	 * @param paths
	 * @return
	 */
	public static String compilePath(String... paths){

		if(paths.length==0)
			return "";
		String path = "";
		for(String sub : paths){
			if(path.endsWith("/")) {
				path+=sub;
			}else {
				path+="/"+sub;
			}
		}
		
		path = path.replace("\\\\", "/").replace("//", "/").replace("//", "/");
		
		return path;
	}

	public static String read(File file) throws Exception {
		
		FileInputStream in = new FileInputStream(file);  
		
		byte[] buf = new byte[in.available()];
        in.read(buf);  
        in.close();
		
		return new String(buf, "UTF-8");
	}
	
	/**
	 * 读取文件,并转换为base64
	 * @param path
	 * @return
	 */
	public static String readImgToBase64(String path) {
		File file = new File(path);  
		Long filelength = file.length();  
		byte[] filecontent = new byte[filelength.intValue()];  
		try {  
			FileInputStream in = new FileInputStream(file);  
			in.read(filecontent);  
			in.close();  
		} catch (FileNotFoundException e) {  
			log.error(e.getMessage(),e);
			return null;
		} catch (IOException e) {  
			log.error(e.getMessage(),e);
			return null;
		}  
		return Base64.getEncoder().encodeToString(filecontent);
	}
	
	public static String readImgToBase64(BufferedImage img) {
		return readImgToBase64(img, "jpg");
	}
	
	public static String readImgToBase64(BufferedImage img, String imgType) {
		byte[] filecontent = null;  
		try {  
			ByteArrayOutputStream out = new ByteArrayOutputStream();
			ImageIO.write(img, imgType, out);
			filecontent = out.toByteArray();
			
		} catch (FileNotFoundException e) {  
			log.error(e.getMessage(),e);
			return null;
		} catch (IOException e) {  
			log.error(e.getMessage(),e);
			return null;
		}  
		return Base64.getEncoder().encodeToString(filecontent);
	}
	
}
