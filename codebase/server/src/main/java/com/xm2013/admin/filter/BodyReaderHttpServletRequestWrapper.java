package com.xm2013.admin.filter;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.Vector;

import javax.servlet.ReadListener;
import javax.servlet.ServletInputStream;
import javax.servlet.ServletRequest;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;


/**
 * 因為Shiro会读取inputstream, 导致后端在此调用inputstream的时候，inputstream异常，所以这里将inputstream缓存起来，
 * 但是也是因为这个操作导致在contentType=application/x-www-form-urlencoded时， getParameter获取不到body中的值，所以需要自己解析body中的数据
 */
public class BodyReaderHttpServletRequestWrapper extends HttpServletRequestWrapper{

	private byte[] body;
	private Map<String, String[]> parameterMap = new HashMap<String, String[]>();	 
    public BodyReaderHttpServletRequestWrapper(HttpServletRequest request) throws IOException {
        super(request);
        body = getBodyString(request).getBytes(Charset.forName("UTF-8"));
        this.parameterMap.putAll(request.getParameterMap());
        buildBodyParam(request);
    }

    public byte[] getBody(){
        return body;
    }
    /**
     * 如果是 application/x-www-form-urlencoded 的body请求，则手动解析，不然导致后台参数获取不到
     * @param request
     */
    private void buildBodyParam(HttpServletRequest request) {
    	
    	String contentType = request.getContentType();
    	if(contentType == null || contentType.toLowerCase().contains("application/x-www-form-urlencoded") == false) return;
	
		try {
			if(body == null || body.length == 0) return;
			
			String bodyStr = new String(body, "utf-8");
			if(bodyStr.trim().length() == 0) return;
			
			String[] cells = bodyStr.split("&");
			for(int i=0; i<cells.length; i++) {
				String[] kv = cells[i].split("=");
				
				String key = kv[0];
				String value = kv.length == 2? kv[1] : null;
				
				if(parameterMap.containsKey(key)) {
					if(value == null) {
						continue;
					}
					
					String[] values = parameterMap.get(key);
					parameterMap.put(key, addToArray(values, value));
					
				}else {
					parameterMap.put(key, new String[] {value});
				}
				
			}
			
			
		} catch (Exception e) {
			e.printStackTrace();
		}
    	
	}
    
    private String[] addToArray(String[] arr, String value) {
    	
    	String[] newArr = new String[arr.length+1];
    	for (int i = 0; i < arr.length; i++) {
    		newArr[i] = arr[i];
    	}
    	
    	newArr[newArr.length - 1] = value;
    	
    	return newArr;
    }

	@Override
    public BufferedReader getReader() throws IOException {
        return new BufferedReader(new InputStreamReader(getInputStream()));
    }
 
    @Override
    public ServletInputStream getInputStream() throws IOException {
 
        final ByteArrayInputStream bais = new ByteArrayInputStream(body);
 
        return new ServletInputStream() {
 
            @Override
            public int read() throws IOException {
                return bais.read();
            }

			@Override
			public int read(byte[] b, int off, int len) throws IOException {
				return bais.read(b, off, len);
			}

			public boolean isFinished() {
				return false;
			}

			public boolean isReady() {
				return false;
			}

			public void setReadListener(ReadListener readListener) {
				
			}
 
        };
    }
 
    public void setInputStream(byte[] body){
        this.body = body;
    }
    
    /**
      * 获取请求Body
     * @param request
     * @return
     */
    public static String getBodyString(ServletRequest request) {
        StringBuilder sb = new StringBuilder();
        InputStream inputStream = null;
        BufferedReader reader = null;
        try {
            inputStream = request.getInputStream();
            reader = new BufferedReader(new InputStreamReader(inputStream, Charset.forName("UTF-8")));
            String line = "";
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (inputStream != null) {
                try {
                    inputStream.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            if (reader != null) {
                try {
                    reader.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        return sb.toString();
    }
    
    /**
     * 获取所有参数名
     *
     * @return 返回所有参数名
     */
    @Override
    public Enumeration<String> getParameterNames() {
        Vector<String> vector = new Vector<String>(parameterMap.keySet());
        return vector.elements();
    }
    
    /**
     * 获取指定参数名的值，如果有重复的参数名，则返回第一个的值 接收一般变量 ，如text类型
     *
     * @param name 指定参数名
     * @return 指定参数名的值
     */
    @Override
    public String getParameter(String name) {
    	try {
    		String[] results = parameterMap.get(name);
    		return results[0];
    	}catch(Exception e) {
    		return null;
    	}
    }


    /**
     * 获取指定参数名的所有值的数组，如：checkbox的所有数据
     * 接收数组变量 ，如checkobx类型
     */
    @Override
    public String[] getParameterValues(String name) {
        return parameterMap.get(name);
    }

    @Override
    public Map<String, String[]> getParameterMap() {
        return parameterMap;
    }
}
