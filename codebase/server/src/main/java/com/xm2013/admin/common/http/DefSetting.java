package com.xm2013.admin.common.http;

import java.security.SecureRandom;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.X509TrustManager;

import org.apache.log4j.Logger;

public class DefSetting {
	
	public static String USER_AGENT_FF = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:77.0) "
			+ "Gecko/20100101 "
			+ "Firefox/77.0";
	public static String USER_AGENT_SAFARI = "";
	public static String USER_AGENT_CHROME = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
			+ "AppleWebKit/537.36 (KHTML, like Gecko) "
			+ "Chrome/81.0.4044.138 "
			+ "Safari/537.36";
	public static String USER_AGENT_EDGE = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
			+ "AppleWebKit/537.36 (KHTML, like Gecko) "
			+ "Chrome/83.0.4103.116 "
			+ "Safari/537.36 "
			+ "Edg/83.0.478.56";
	
	public static final String MULTIPART_FORM_DATA = "multipart/form-data";
    public static final String FORM_URL_ENCODED = "application/x-www-form-urlencoded";
    public static final String JSON_TYPE = "application/json";
    public static final String TEXT_TYPE = "text/plain";
    
    public static final String DefaultUploadType = "application/octet-stream";
	
	public static String CHARSET = "UTF-8";

	public static Logger log = Logger.getLogger("com.xm.http.kit");
	
	public static SSLSocketFactory getSSLFactory() {
		try {
            HttpsURLConnection.setDefaultHostnameVerifier(new HostnameVerifier() {
                public boolean verify(String hostname, SSLSession session) {
                    return true;
                }
            });

            SSLContext context = SSLContext.getInstance("TLS");
            context.init(null, new X509TrustManager[] { new X509TrustManager() {
                public void checkClientTrusted(X509Certificate[] chain, String authType) throws CertificateException {
                }

                public void checkServerTrusted(X509Certificate[] chain, String authType) throws CertificateException {
                }

                public X509Certificate[] getAcceptedIssuers() {
                    return new X509Certificate[0];
                }
            } }, new SecureRandom());
           return context.getSocketFactory();
        } catch (Exception e) {
            // e.printStackTrace();
        }
		return null;
	}
}
