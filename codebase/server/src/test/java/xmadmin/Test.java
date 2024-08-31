package xmadmin;

import java.io.UnsupportedEncodingException;
import java.util.Base64;
import java.util.UUID;

import com.xm2013.admin.common.Kit;

public class Test {
	public static void main(String[] args) throws UnsupportedEncodingException {
//		String en = Kit.doubleMd5WidthSalt("EFEI#F039F...F30");
//		System.out.println(en);
//		byte[] decode = Base64.getEncoder().encode(en.getBytes());
//		String base64 = new String(decode);
//		System.out.println(base64);
//		for(int i=0; i<1000; i++) {
//			System.out.println(UUID.randomUUID().toString().replace("-", "").substring(24));
//		}
		
		System.out.println("AA-0012".matches("[a-zA-Z]{1,2}.{1}[0-9]{3,4}"));
	}
	
}
