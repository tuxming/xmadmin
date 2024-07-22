package com.xm2013.admin.common.http;

import java.io.BufferedWriter;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import java.lang.reflect.Method;
import java.net.HttpURLConnection;
import java.net.Proxy;
import java.net.URL;
import java.net.URLEncoder;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLSocketFactory;

/**
 * <pre>发送http请求的request</pre>
 * @author tuxming
 * @date 2020年6月3日
 */
public class Request {
	/**
	 * 请求的url
	 */
	private String url;
	/**
	 * 请求方法： GET,POST, DELETE, PUT
	 */
	private String method;
	/**
	 * 连接超时时间
	 */
	private int connectTimeout = 60000;
	/**
	 * 读取数据超时时间
	 */
	private int readTimeout = 60000;
	/**
	 * 请求类型
	 */
	private String conentType;
	/**
	 * 请求的cookie
	 */
	private Map<String, String> cookies;
	/**
	 * 其他的请求头信息
	 */
	private Map<String, String> headers;
	/**
	 * 发送文件
	 */
	private List<RequestFile> files;
	/**
	 * 发送内容的输入流
	 */
	private byte[] bytes;
	/**
	 * 请求参数
	 */
	private Map<String, String> params;
	
	private String saveDir; 
	private String filename;
	
	/**
	 * :指定请求的是否文件
	 */
	private boolean isFile = false;
	
	private String requestCharset = DefSetting.CHARSET;
	
	/**
	 * 如果是https请求，请设置sslfactory
	 */
	private SSLSocketFactory sslFactory = null;
	
	/**
	 * 请求参数body,body仅用POST，PUT方法，如果设置body, datas放在url上面，同时忽略, files的数据，具体请参考http协议
	 */
	private String body;
	/**
	 * 是否使用代理
	 */
	private Proxy proxy;
	
	public Request() {
		this(false);
	}
	
	public Request(boolean sort) {
		if(sort) {
			cookies = new LinkedHashMap<String, String>();
			headers = new LinkedHashMap<String, String>();
			params = new LinkedHashMap<String, String>();
		}else {
			cookies = new HashMap<String, String>();
			headers = new HashMap<String, String>();
			params = new HashMap<String, String>();
		}
		files = new ArrayList<RequestFile>();
	}
	
	public String getUrl() {
		return url;
	}
	/**
	 * 设置请求的url
	 */
	public Request setUrl(String url) {
		this.url = url;
		return  this;
	}
	public String getMethod() {
		return method;
	}
	/**
	 *设置 请求方法： GET,POST, DELETE, PUT
	 * @author tuxming
	 * @date 2020年6月3日
	 * @param method
	 */
	public Request setMethod(String method) {
		this.method = method;
		return  this;
	}
	public int getConnectTimeout() {
		return connectTimeout;
	}
	/**
	 * 设置连接超时时间
	 */
	public Request setConnectTimeout(int connectTimeout) {
		this.connectTimeout = connectTimeout;
		return  this;
	}
	public int getReadTimeout() {
		return readTimeout;
	}
	/**
	 * 设置读取数据超时时间
	 */
	public Request setReadTimeout(int readTimeout) {
		this.readTimeout = readTimeout;
		return  this;
	}
	public Map<String, String> getCookies() {
		return cookies;
	}
	public Request setCookies(Map<String, String> cookies) {
		this.cookies = cookies;
		return  this;
	}
	public Map<String, String> getHeaders() {
		return headers;
	}
	/**
	 * 添加一个header
	 */
	public Request addHeader(String name, String value) {
		this.headers.put(name, value);
		return this;
	}
	public Request setHeaders(Map<String, String> headers) {
		this.headers = headers;
		return  this;
	}
	
	public String getConentType() {
		return conentType;
	}
	
	/**
	 * :指定返回的结果是否文件，如果是，则尝试获取文件名，和后缀名
	 * @return
	 */
	public Request markFile() {
		this.isFile = true;
		return this;
	}
	
	/**
	 * 设置请求类型
	 */
	public Request setConentType(String conentType) {
		this.conentType = conentType;
		return  this;
	}
	public List<RequestFile> getFiles() {
		return files;
	}
	/**
	 * 设置发送文件
	 * @author tuxming
	 * @date 2020年6月3日
	 * @param files
	 */
	public Request setFiles(List<RequestFile> files) {
		this.files = files;
		return  this;
	}
	public Map<String, String> getParams() {
		return params;
	}
	/**
	 * 设置请求参数
	 */
	public Request setParams(Map<String, String> datas) {
		this.params = datas;
		return  this;
	}
	
	public String getBody() {
		return body;
	}
	/**
	 * 请求参数body,body仅用POST，PUT方法，具体请参考http协议，
	 * 如果设置body，datas的数据则拼接在url上面，同时忽略files的数据，
	 */
	public Request setBody(String body) {
		this.body = body;
		return  this;
	}
	/**
	 * 添加一条cookie
	 */
	public Request addCookies(String name, String value) {
		this.cookies.put(name, value);
		return  this;
	}
	
	/**
	 * 添加一条cookie
	 */
	public Request addCookies(Map<String, String> cookies) {
		this.cookies = cookies;
		return  this;
	}
	
	/**
	 * 添加一条参数
	 */
	public Request addParam(String key, String value) {
		this.params.put(key,value);
		return  this;
	}
	
	/**
	 * 添加一个待发送的文件
	 */
	public Request addFile(String name, String filepath) {
		this.files.add(new RequestFile(name,new File(filepath)));	
		return  this;
	}
	/**
	 * 添加一个待发送的文件
	 */
	public Request addFile(String name, String contentType, String filepath) {
		this.files.add(new RequestFile(name,contentType, new File(filepath)));	
		return  this;
	}
	
	/**
	 * 添加一个待发送的文件
	 */
	public Request addFile(String name, File file) {
		this.files.add(new RequestFile(name,file));	
		return  this;
	}
	/**
	 * 添加一个待发送的文件
	 */
	public Request addFile(String name, String contentType, File file) {
		this.files.add(new RequestFile(name,contentType, file));	
		return  this;
	}
	/**
	 * 添加一个待发送的流
	 */
	public Request addBytes(byte[] bytes) {
		this.bytes = bytes;
		return  this;
	}

	public Proxy getProxy() {
		return proxy;
	}
	
	/**
	 * 将返回结果保存到文件，如果设置了则将返回结果保存在指定的文件
	 * 此时response的datas中，将无任何数据
	 * response中将返回保存的文件名，
	 * 主要用于解决下载大文件是导致内存不足的问题
	 */
	public Request setSaveResponseDataDir(String dir) {
		this.saveDir = dir;
		this.isFile =true;
		return this;
	}
	/**
	 * 如果没有指定文件，则随机生成文件名
	 */
	public Request setSaveResponseDateFilename(String filename) {
		this.filename = filename;
		this.isFile = true;
		return this;
	}
	
	/**
	 * 将返回结果保存到文件，如果设置了则将返回结果保存在指定的文件
	 * 此时response的datas中，将无任何数据
	 * response中将返回保存的文件名，
	 * 主要用于解决下载大文件是导致内存不足的问题
	 */
	public Request setSave(String dir, String filename) {
		this.saveDir = dir;
		this.filename = filename;
		this.isFile = true;
		return this;
	}
	
	/**
	 * 将返回结果保存到文件，如果设置了则将返回结果保存在指定的文件, 文件名系统自己生成
	 * 此时response的datas中，将无任何数据
	 * response中将返回保存的文件名，
	 * 主要用于解决下载大文件是导致内存不足的问题
	 */
	public Request setSave(String dir) {
		this.saveDir = dir;
		return this;
	}
	
	/**
	 * 设置请求编码
	 */
	public void setRequestCharset(String requestCharset) {
		this.requestCharset = requestCharset;
	}

	/**
	 * 设置代理
	 * @author tuxming
	 * @date 2020年6月3日
	 * @param proxy
	 */
	public Request setProxy(Proxy proxy) {
		this.proxy = proxy;
		return  this;
	}
	
	public SSLSocketFactory getSslFactory() {
		return sslFactory;
	}
	
	/**
	 * 解决https的请求验证，默认忽略所有验证
	 */
	public Request setSslFactory(SSLSocketFactory sslFactory) {
		this.sslFactory = sslFactory;
		return this;
	}
	
	/**
	 * 使用get方法发送请求
	 */
	public Response get() {
		this.method = "GET";
		return this.execute();
	}
	
	/**
	 * 使用post方法发送请求
	 */
	public Response post() {
		this.method = "POST";
		return this.execute();
	}

	/**
	 * 使用put方法发送请求
	 */
	public Response put() {
		this.method = "PUT";
		return this.execute();
	}
	
	/**
	 * 发起请求
	 * @author tuxming
	 */
	private HttpURLConnection execute(URL url) throws IOException {
		
		HttpURLConnection con = buildConnection(url);
		con.connect();
		
		if(con.getResponseCode() == 301){
			String location = con.getHeaderField("Location");
			URL redirectURL = new URL(location);
			Map<String, String> cookies = getResponseCookie(con);
			this.cookies = cookies;
			con.disconnect();
			return execute(redirectURL);
		}
		return con;
	}
	
	/**
	 * 自己发起请求，前提是必须设置url和请求方法
	 */
	public Response execute() {
		HttpURLConnection con = null;
		InputStream is = null;
		try {
			String url = this.url;
			if("GET".equals(this.method) || isnull(this.body) == false) {
				url = addQueryStringURL(url);
			}
			
			con = execute(new URL(url));
			
			Response response = new Response();
			response.setStatusCode(con.getResponseCode());
			response.setResponseMsg(con.getResponseMessage());
			response.setHeader(con.getHeaderFields());
			if(con.getResponseCode()==200) {
				is = con.getInputStream();
				setResponseData(response, con, is);
				response.setContentType(con.getContentType());
				response.setCookies(getResponseCookie(con));
			}
			
			return response;
		} catch (Exception e) {
			DefSetting.log.error(e.getMessage(), e);
			throw new RuntimeException(e);
		} finally {
			try {
				is.close();
			} catch (Exception e) {
			}
			con.disconnect();
		}
	}
	
	/**
	 * 构建url参数
	 */
	private String addQueryStringURL(String url) throws UnsupportedEncodingException {
		
		if(this.params.size()>0) {
			String[] strs = new String[this.params.size()];
			int i=0; 
			for(String key : this.params.keySet()) {
				strs[i] = key+"="+URLEncoder.encode(this.params.get(key), DefSetting.CHARSET);
				i++;
			}
			String prefix = "";
			if(url.indexOf("?") == -1) {
				prefix = "?";
			}
			
			url += prefix + String.join("&", strs);
		}
		return url;
		
	}

	/**
	 * 构建请求信息
	 */
	private HttpURLConnection buildConnection(URL url) throws IOException {
		HttpURLConnection connection;
		
		connection = this.proxy == null ? (HttpURLConnection) url.openConnection()
				: (HttpURLConnection) url.openConnection(proxy);
		
		if(this.url.startsWith("https") && connection instanceof HttpsURLConnection) {
			if(this.sslFactory == null) {
				this.sslFactory = DefSetting.getSSLFactory();
			}
			
			((HttpsURLConnection)connection).setSSLSocketFactory(this.sslFactory);
			
		}
		
		connection.setRequestMethod(this.method);
		connection.setConnectTimeout(this.connectTimeout);
		connection.setReadTimeout(this.readTimeout);
		connection.setDoInput(true);
		connection.setDoOutput(true);
		
		setRequestCookies(connection);
		setRequestHeaders(connection);
		setRequestParams(connection);
		
		return connection;
	}
	
	/**
	 * 添加http请求头
	 * @author tuxming
	 * @date 2020年6月5日
	 * @param conn
	 */
	private void setRequestHeaders(HttpURLConnection conn) {
		if(this.headers.size()>0) {
			for(String key : this.headers.keySet()) {
				conn.addRequestProperty(key, this.headers.get(key));
			}
		}
	}

	/**
	 * 添加请求参数
	 * @author tuxming
	 * @date 2020年6月5日
	 * @param conn
	 * @throws UnsupportedEncodingException
	 * @throws IOException
	 */
	private void setRequestParams(HttpURLConnection conn) throws UnsupportedEncodingException, IOException {
		
		if("GET".equals(this.method)) return;
		
		//设置请求头，一定要在getOutputStream之前。
		if(isnull(body) ==false) {
			conn.addRequestProperty("Content-Type", this.conentType);
		}
		
		String bound = buildBound();
		if (files.size() > 0) {
			bound = buildBound();
			conn.addRequestProperty("Content-Type", DefSetting.MULTIPART_FORM_DATA+"; boundary=" + bound);
		}else {
			if(this.params.size()>0) {
				if(this.conentType == null || this.conentType.indexOf(DefSetting.FORM_URL_ENCODED)>-1) {
					conn.addRequestProperty("Content-Type", DefSetting.FORM_URL_ENCODED);
				}else if(this.conentType.indexOf(DefSetting.JSON_TYPE)>-1){
					conn.addRequestProperty("Content-Type", this.conentType);
				}
			}
		}
		
		OutputStream out = conn.getOutputStream();
		
		final BufferedWriter w = new BufferedWriter(new OutputStreamWriter(out, this.requestCharset));
		
		try {
			if(isnull(body) ==false) {
				w.write(this.body);
				return;
			}
			
			if(files.size()>0) {
				for (RequestFile file : files) {
					
					if(!file.getFile().exists())
						continue;
					
	                w.write("--");
	                w.write(bound);
	                w.write("\r\n");
	                w.write("Content-Disposition: form-data; name=\"");
	                w.write(file.getName().replace("\"", "%22")); // encodes " to %22
	                w.write("\"");
	                w.write("; filename=\"");
	                w.write(file.getFile().getName().replace("\"", "%22"));
	                w.write("\"\r\nContent-Type: ");
	                w.write(file.getContentType());
	                w.write("\r\n\r\n");
	                w.flush(); // flush
	                writeToOutStream(file.getFile(), out);
	                out.flush();
	                //DataUtil.crossStreams(keyVal.inputStream(), outputStream);
	                //outputStream.flush();
	                w.write("\r\n");
	            }
				
				if(this.params.size()>0) {
					for(String key : this.params.keySet()) {
						String value = this.params.get(key);
						if(isnull(value)) {
							value="";
						}
						w.write("--");
	                    w.write(bound);
	                    w.write("\r\n");
	                    w.write("Content-Disposition: form-data; name=\"");
	                    w.write(key.replace("\"", "%22")); // encodes " to %22
	                    w.write("\"");
	                    w.write("\r\n\r\n");
                        w.write(value);
						w.write("\r\n");
					}
				}
				
	            w.write("--");
	            w.write(bound);
	            w.write("--");
	            return;
			}
			
			if(this.params.size()>0) {
				
				if(this.conentType == null || this.conentType.indexOf(DefSetting.FORM_URL_ENCODED)>-1) {
					String[] ds = new String[this.params.size()];
					int i=0; 
					for(String key : this.params.keySet()) {
						String value = this.params.get(key);
						if(isnull(value)) {
							value="";
						}
						ds[i] = URLEncoder.encode(key, requestCharset)+"="+URLEncoder.encode(value, requestCharset);
						i++;
					}
					w.write(String.join("&", ds));
//					conn.addRequestProperty("Content-Type", DefSetting.FORM_URL_ENCODED);
				}else if(this.conentType.indexOf(DefSetting.JSON_TYPE)>-1){
					w.write(toJson(this.params));
//					conn.addRequestProperty("Content-Type", this.conentType);
				}
			}

			if (bytes != null) {
				writeToOutStream(bytes, out);
				out.flush();
			}
		}finally {
			w.flush();
			w.close();
		}
		
	}

	/**
	 * 添加请求cookie
	 * @author tuxming
	 * @date 2020年6月5日
	 * @param conn
	 */
	private void setRequestCookies(HttpURLConnection conn) {
		if(cookies.size()>0) {
			String[] cks = new String[this.cookies.size()];
			int i=0; 
			for(String key : this.cookies.keySet()) {
				cks[i] = key+"="+this.cookies.get(key);
				i++;
			}
			String cookie = String.join("; ", cks);
			conn.addRequestProperty("Cookie", cookie);
		}
	}

	private void setResponseData(Response response,HttpURLConnection connection, InputStream is) throws IOException {
		// 获得输出流
		if(saveDir == null) {
			ByteArrayOutputStream bos = new ByteArrayOutputStream();
	        readFromInputStream(is, bos);
	        response.setDatas(bos.toByteArray());
	        bos.close();
	        
	        if(isFile) {
	        	String ext = getExtions(connection);
	        	response.setExt(ext);
	        }
	        
		}else {
			File file = getSaveFile(connection, response);
			FileOutputStream fos = new FileOutputStream(file);
			readFromInputStream(is, fos);
			fos.close();
			response.setSaveFilePath(file.getAbsolutePath());
		}
		
	}

	private File getSaveFile(HttpURLConnection connection, Response response) throws IOException {
		String fname = null;
		String ext = null;
		if(this.filename==null) {
			fname = System.currentTimeMillis()+String.format("%04d", new Random().nextInt(9999));
			ext = getExtions(connection);
			if(ext!=null) {
				fname += "."+ext;
			}
		}else {
			if(this.filename.lastIndexOf(".") == -1) {
				ext = getExtions(connection);
				if(ext!=null) {
					this.filename += "."+ext;
				}
			}
			
			fname = this.filename;
		}
		
		File file = new File(saveDir, fname);
		File parent = file.getParentFile();
		if(parent.exists()==false) {
			parent.mkdirs();
		}
		
		if(file.exists()==false) {
			file.createNewFile();
		}
		
		response.setFileName(fname);
		response.setExt(ext);
		
		return file;
	}
	
	/**
	 * 获取后缀名
	 * @author tuxming
	 * @date 2020年8月6日
	 * @return
	 */
	private String getExtions(HttpURLConnection connection) {
		String cd = connection.getHeaderField("Content-Disposition");
		
		String ext = null;
		if(isnull(cd) == false) {
			int dotidx = cd.lastIndexOf(".");
			if(dotidx>-1) {
				ext = cd.substring(dotidx+1).replace("\"", "");
			}
		}else {
			String type = connection.getContentType();
			if(type != null) {
				type = type.toLowerCase();
				if(type.indexOf("image/png")>-1) {
					ext = "png";
				}else if(type.indexOf("image/bmp")>-1) {
					ext = "bmp";
				}else if(type.indexOf("image/gif")>-1){
					ext = "gif";
				}else if(type.indexOf("image/jpeg")>-1){
					ext = "jpg";
				}else if(type.indexOf("image/jpg")>-1) {
					ext = "jpg";
				}
			}
		}
		return ext;
	}

	private void writeToOutStream(File file, OutputStream out) throws IOException {
		InputStream in = new FileInputStream(file);

		final byte[] buffer = new byte[1024];
		int len;
		while ((len = in.read(buffer)) != -1) {
			out.write(buffer, 0, len);
		}
		in.close();
	}

	private void writeToOutStream(byte[] bytes, OutputStream out) throws IOException {
		out.write(bytes);
	}
	
	private void readFromInputStream(InputStream is, OutputStream os) throws IOException {
		byte[] buff = new byte[1024];
        int rc = 0;
        while ((rc = is.read(buff)) != -1) {
        	os.write(buff, 0, rc); 
        }
	}
	
	private Map<String, String> getResponseCookie(HttpURLConnection con) {
		String cookieStr = con.getHeaderField("Set-Cookie");
		Map<String, String> cookies = new HashMap<String, String>();
		if(isnull(cookieStr)) return cookies;
		
		
		Map<String,List<String>> headers = con.getHeaderFields();
		for(String key : headers.keySet()) {
			if("Set-Cookie".equals(key)) {
				List<String> cookieList = headers.get(key);
				
				for(String ck : cookieList) {
					try {
						String cks = ck.split(";")[0];
						String[] kv = cks.split("=");
						cookies.put(kv[0], kv[1]);
					}catch (Exception e) {
					}
				}
			}
		}
		return cookies;
	}

	private boolean isnull(String src) {
		return src == null || src.trim().length()==0;
	}
	
	/**
	 * 这里使用了jackson，如果你的参数是params，并且content-type='application/json'，则会调用此方法，请确保在项目中是否需要使用该方法，
	 * 如果你想使用改工具类，又不想使用jaskson, 请直接使用将对象转换成json String设置到body里面，此时data里面的参数将会作为url参数。
	 */
	private String toJson(Object data) {
		try {
			Class<?> clazz = Class.forName("com.fasterxml.jackson.databind.ObjectMapper");
			Object instance = clazz.newInstance();
			
			Method method = clazz.getDeclaredMethod("setDateFormat", DateFormat.class);
			method.invoke(instance, new SimpleDateFormat("YYYY-MM-dd HH:mm:ss"));
			
			
			com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper(); ;
			mapper.setDateFormat(new SimpleDateFormat("YYYY-MM-dd HH:mm:ss"));
			//mapper.disable(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
			
			Method writeValueAsString = clazz.getDeclaredMethod("writeValueAsString", Object.class);
			writeValueAsString.invoke(instance, data);
			
			return (String) writeValueAsString.invoke(instance, data);
		} catch (Exception e) {
			DefSetting.log.error(e.getMessage(),e);
		}
		
		return null;
	}
	
	private String buildBound() {
		String bound = "";
		Random rnd = new Random();
		String chars = "1234567890QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm";
		int length = chars.length();
		while(bound.length()<16) {
			bound += chars.charAt(rnd.nextInt(length))+"";
		}
		return "--------"+bound+"--------";
	}
	
}

