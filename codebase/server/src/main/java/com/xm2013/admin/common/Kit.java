package com.xm2013.admin.common;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.security.MessageDigest;
import java.util.Formatter;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.servlet.http.HttpServletRequest;

import com.jfinal.kit.Base64Kit;

/**
 * 工具类
 */
public class Kit {
	
//	private static Logger log = Logger.getLogger(Kit.class);
	public static String DATE_TIME_PATTERN = "yyyy-MM-dd HH:mm:ss";
	public static String DATE_PATTERN = "yyyy-MM-dd";
	
	public static boolean isNull(String text) {
		if(text == null || text.trim().length() == 0) {
			return true;
		}
		return false;
	}
	
	public static boolean isNotNull(String text) {
		
		if(text!=null && text.trim().length()>0) {
			return true;
		}
		return false;
		
	}
	
	/**
	 * byte[] 转16进制的字符串
	 * @param hash
	 * @return
	 */
	public static String byteToHex(byte[] hash) {
		Formatter formatter = new Formatter();
		for (byte b : hash)
		{
			formatter.format("%02x", b);
		}
		String result = formatter.toString();
		formatter.close();
		return result;
	}
	
	/**
	 * HmacSHA256，消息摘要
	 * @author tuxming
	 * @date 2021年5月26日
	 * @param data
	 * @param key
	 * @return
	 * @throws Exception
	 */
	public static String HmacSHA256ToHex(String data, String key) throws Exception {
		byte[] encrypt = HmacSHA256(data, key);
		return byteToHex(encrypt);
	}
	
	
	/**
	 * HmacSHA256，消息摘要
	 * @author tuxming
	 * @date 2021年5月26日
	 * @param data
	 * @param key
	 * @return
	 * @throws Exception
	 */
	public static String HmacSHA256ToBase64(String data, String key) throws Exception {
		byte[] encrypt = HmacSHA256(data, key);
		return Base64Kit.encode(encrypt);
	}
	
	/**
	 * HmacSHA256，消息摘要
	 * @author tuxming
	 * @date 2021年5月26日
	 * @param data
	 * @param key
	 * @return
	 * @throws Exception
	 */
	public static byte[] HmacSHA256(String data, String key) throws Exception {

		Mac sha256_HMAC = Mac.getInstance("HmacSHA256");

		SecretKeySpec secret_key = new SecretKeySpec(key.getBytes("UTF-8"), "HmacSHA256");

		sha256_HMAC.init(secret_key);

		byte[] array = sha256_HMAC.doFinal(data.getBytes("UTF-8"));

//		StringBuilder sb = new StringBuilder();
//
//		for (byte item : array) {
//			sb.append(Integer.toHexString((item & 0xFF) | 0x100).substring(1, 3));
//		}

		return array;

	}
	
	
	/** 
	 * 获取当前网络ip 
	 * @param request 
	 * @return 
	 */  
	public static String getIpAddr(HttpServletRequest request) {
		String ipAddress = request.getHeader("x-forwarded-for");  
		if(ipAddress == null || ipAddress.length() == 0 || "unknown".equalsIgnoreCase(ipAddress)) {  
			ipAddress = request.getHeader("Proxy-Client-IP");  
		}  
		if(ipAddress == null || ipAddress.length() == 0 || "unknown".equalsIgnoreCase(ipAddress)) {  
			ipAddress = request.getHeader("WL-Proxy-Client-IP");  
		}  
		if(ipAddress == null || ipAddress.length() == 0 || "unknown".equalsIgnoreCase(ipAddress)) {  
			ipAddress = request.getRemoteAddr();  
			if(ipAddress.equals("127.0.0.1") || ipAddress.equals("0:0:0:0:0:0:0:1")){  
				//根据网卡取本机配置的IP  
				InetAddress inet=null;  
				try {  
					inet = InetAddress.getLocalHost();  
				} catch (UnknownHostException e) {  
					e.printStackTrace();  
				}  
				ipAddress= inet.getHostAddress();  
			}  
		}  
		//对于通过多个代理的情况，第一个IP为客户端真实IP,多个IP按照','分割  
		if(ipAddress!=null && ipAddress.length()>15){ //"***.***.***.***".length() = 15  
			if(ipAddress.indexOf(",")>0){  
				ipAddress = ipAddress.substring(0,ipAddress.indexOf(","));  
			}  
		}  
		return ipAddress;  
	}
	
	/**
	 * 获取MD5值
	 * @param pwd
	 * @return
	 */
	public static String MD5(String pwd) {  
		//用于加密的字符  
		char md5String[] = { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',  
				'A', 'B', 'C', 'D', 'E', 'F' };  
		try {  
			//使用平台的默认字符集将此 String 编码为 byte序列，并将结果存储到一个新的 byte数组中  
			byte[] btInput = pwd.getBytes();  

			//信息摘要是安全的单向哈希函数，它接收任意大小的数据，并输出固定长度的哈希值。  
			MessageDigest mdInst = MessageDigest.getInstance("MD5");  

			//MessageDigest对象通过使用 update方法处理数据， 使用指定的byte数组更新摘要  
			mdInst.update(btInput);  

			// 摘要更新之后，通过调用digest（）执行哈希计算，获得密文  
			byte[] md = mdInst.digest();  

			// 把密文转换成十六进制的字符串形式  
			int j = md.length;  
			char str[] = new char[j * 2];  
			int k = 0;  
			for (int i = 0; i < j; i++) {   //  i = 0  
				byte byte0 = md[i];  //95  
				str[k++] = md5String[byte0 >>> 4 & 0xf];    //    5   
				str[k++] = md5String[byte0 & 0xf];   //   F  
			}  

			//返回经过加密后的字符串  
			return new String(str).toLowerCase();  

		} catch (Exception e) {  
			return null;  
		}  
	}  
	
	public static String SALT = "XM/fie#!89";
	public static String doubleMd5WidthSalt(String text) {
		String encrypt = MD5(text);
		return MD5(encrypt+SALT);
	}
}
