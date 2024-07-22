package com.xm2013.admin.shiro.jwt;

import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.shiro.crypto.SecureRandomNumberGenerator;

import com.xm2013.admin.common.Kit;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

public class JwtUtil {
	// 过期时间1天
	private static final long EXPIRE_TIME = 1 * 24 * 60 * 60 * 1000l;
//	private static final long EXPIRE_TIME = 60 *1000l;

	// 私钥
	public static final String SECRET = "XM2013admin20240623";

	/**
	 * 验证token是否正确
	 */
	public static boolean verify(String token, String username, String secret) {
		try {
			 //签名秘钥，和生成的签名的秘钥一模一样
			return getClaim(token)!=null;
		} catch (JwtException exception) {
			return false;
		}
	}

	public static Claims getClaim(String token) {
		
		SecretKey key = generalKey();
     	Claims claims = Jwts.parser()  //得到DefaultJwtParser
             .setSigningKey(key)         //设置签名的秘钥
             .parseClaimsJws(token).getBody();
		
     	return claims;
	}
	
	/**
     * 由字符串生成加密key
     *
     * @return
     */
    public static SecretKey generalKey() {
        String stringKey = SECRET;
        byte[] encodedKey = Base64.getDecoder().decode(stringKey);
        SecretKey key = new SecretKeySpec(encodedKey, 0, encodedKey.length, "AES");
        return key;
    }
	
	/**
	 * 获得token中的自定义信息，无需secret解密也能获得
	 */
	public static String getClaimFiled(String token, String filed) {
		return getClaim(token).get(filed, String.class);
	}

	/**
	 * 生成签名
	 */
	public static String sign(String username) {
		SignatureAlgorithm signatureAlgorithm = SignatureAlgorithm.HS256; //指定签名的时候使用的签名算法，也就是header那部分，jjwt已经将这部分内容封装好了。
        Date now = new Date(System.currentTimeMillis());

        Map<String, Object> claims = new HashMap<String, Object>();
        claims.put("username", username);
        
        SecretKey secretKey = generalKey();
        long nowMillis = System.currentTimeMillis();//生成JWT的时间
        //下面就是在为payload添加各种标准声明和私有声明了
        JwtBuilder builder = Jwts.builder() //这里其实就是new一个JwtBuilder，设置jwt的body
                .setClaims(claims)          //如果有私有声明，一定要先设置这个自己创建的私有的声明，这个是给builder的claim赋值，一旦写在标准的声明赋值之后，就是覆盖了那些标准的声明的
                .setId(username)                  //设置jti(JWT ID)：是JWT的唯一标识，根据业务需要，这个可以设置为一个不重复的值，主要用来作为一次性token,从而回避重放攻击。
                .setIssuedAt(now)           //iat: jwt的签发时间
                .signWith(signatureAlgorithm, secretKey);//设置签名使用的签名算法和签名使用的秘钥
        
        long expMillis = nowMillis + EXPIRE_TIME;
        Date exp = new Date(expMillis);
        builder.setExpiration(exp);     //设置过期时间
        return builder.compact();
	}

	/**
	 * 获取 token的签发时间
	 */
	public static Date getIssuedAt(String token) {
		return getClaim(token).getIssuedAt();
	}

	/**
	 * 验证 token是否过期
	 */
	public static boolean isTokenExpired(String token) {
		return getClaim(token).getExpiration().getTime()-System.currentTimeMillis()<0;
	}

	/**
	 * 刷新 token的过期时间
	 */
	public static String refreshTokenExpired(String token, String secret) {
		
		Claims claims = getClaim(token);
		Date expire = claims.getExpiration();
		Date date = new Date(System.currentTimeMillis());
		
//		System.out.println("当前时间："+date.getTime()+", 过期时间；"+expire);

		long duration = (expire.getTime() - date.getTime())/1000l;
		if( duration > 0 && duration< 60*30) {  //30分钟内自动刷新
//		if( duration > 0 && duration< 10) {
			return sign(claims.get("username", String.class));
		}
		return token;
	}

	/**
	 * 生成16位随机盐
	 */
	public static String generateSalt() {
		SecureRandomNumberGenerator secureRandom = new SecureRandomNumberGenerator();
		String hex = secureRandom.nextBytes(16).toHex();
		return hex;
	}
	
	public static void writeTokenToResponse(String key, String token, HttpServletResponse response) {
		
		Cookie cookie = new Cookie(key, token);
        cookie.setMaxAge(60*60*24);
        cookie.setPath("/");
//        cookie.setDomain(".shunyunbaoerp.com");
        cookie.setHttpOnly(true);
        response.addCookie(cookie);
		
	}

}
