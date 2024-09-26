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

package com.xm2013.admin.domain.dto;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.jfinal.json.Jackson;
import com.jfinal.plugin.activerecord.Model;
import com.xm2013.admin.common.Kit;
import com.xm2013.admin.exception.BusinessErr;
import com.xm2013.admin.exception.BusinessException;

/**
 * 返回消息的建议： 
 * 返回业务自定义错误消息： JsonResult.error(BusinessErr.ERROR.setMsg("自定义消息内容"));  //这个会设置code=10
 * 返回系统规定的自定义业务消息： JsonResult.error(BusinesseErr.NO_LOGIN);  //BusinesseErr里面除了ERROR的类型
 * 返回format业务消息： JsonResult.create(null, false, msg).setArgs();  //msg要替换的参数使用%s占位
 * 如果是批量业务，要返回每一条数据的处理结果，code设置为600，data=map(key, msg)
 * JsonResult.create(map, true, msg).setCode(6000);
 */
public class JsonResult {
	private Boolean status;
	private String msg;
	private Boolean format = false;
	private String args[];
	private Object data;
	
	@JsonIgnore
	private Object tmpData;
	
	/**
	 * BusinessErr：和这个错误消息： 
	 * 10:消息是自定义的消息，其他的错误消息是固定的
	 * 以下是拓展的code
	 * 200: 成功
	 * 500: 系统错误，这个错误，可以不用调用国际化
	 * 600: 这个不分对错，具体消息会方在data中，Map<String, String> 错误的key, 具体的错误消息
	 */
	private String code = "200";  //code默认是200：成功
	
	public static JsonResult create(Object data) {
		return create(data, true);
	}
	
	public static JsonResult create(Object data, boolean status) {
		return create(data, status, null);
	}
	
	public static JsonResult create(Object data, boolean status, String msg) {
		return create(data, status, msg, null);
	}
	
	public static JsonResult create(Object data, boolean status, String msg, String code) {
		JsonResult dto = new JsonResult();
		dto.setData(data);
		dto.setStatus(status);
		dto.setMsg(msg);
		dto.setCode(code);

//		if(Kit.isNotNull(msg)) {
//			dto.setMsg(msg);
//		}else if(!status && data!=null) {
//			@SuppressWarnings("unchecked")
//			Map<String, Object> responseData = (Map<String, Object>) data;
//			dto.setMsg((String)responseData.get("msg"));
//		}
		
		return dto;
	}
	
	public static String error(BusinessErr err) {
		JsonResult dto = create(null, false, err.getMsg());
		dto.setCode(err.getCode()+"");
		return dto.toString();
	}
	
	public static String error(BusinessException e) {
		JsonResult dto = create(null, false, e.getMsg());
		if(e.isFormat()) {
			dto.setFormat(true);
			dto.setArgs(e.getArgs());
		}
		dto.setCode(e.getCode()+"");
		return dto.toString();
	}
	
	public static String error(Exception e) {
		if(e instanceof BusinessException) {
			return error((BusinessException)e);
		}else {
			JsonResult dto = create(null, false, e.getMessage());
			dto.setCode("500");
			return dto.toString();
		}
	}
	
	public static String error(String msg) {
		JsonResult dto = create(null, false, msg);
		return dto.toString();
	}
	
	public static String error(String msg, String code) {
		JsonResult dto = create(null, false, msg);
		dto.setCode(code);
		return dto.toString();
	}
	
//	public static String error(String msg, Object data) {
//		JsonResult dto = create(data, false, msg);
//		return dto.toString();
//	}
	
	public static String ok(String msg) {
		JsonResult dto = create(null, true, msg);
		return dto.toString();
	}
	
	public static String ok(String msg, String code) {
		JsonResult dto = create(null, true, msg);
		dto.setCode(code);
		return dto.toString();
	}
	
	public static String ok(String msg, Object data) {
		JsonResult dto = create(data, true, msg);
		return dto.toString();
	}
	
	public static String ok(String msg, String code, Object data) {
		JsonResult dto = create(data, true, msg);
		dto.setCode(code);
		return dto.toString();
	}
	
	public static String ok(String msg, Object data, String pattern) {
		JsonResult dto = create(data, true, msg);
		return dto.toString(pattern);
	}
	
	public static String ok(String msg, String code, Object data, String pattern) {
		JsonResult dto = create(data, true, msg);
		dto.setCode(code);
		return dto.toString(pattern);
	}

	@Override
	public String toString() {
		return toString("yyyy-MM-dd HH:mm:ss");
		
	}
	
	@SuppressWarnings("rawtypes")
	public String toString(String datePattern) {
		
		Jackson json = Jackson.getJson();
		if(Kit.isNotNull(datePattern))
			json.setDatePattern(datePattern);
		
		if(this.data instanceof Model) {
			Map<String, Object> data2 = processModel(this.data);
			this.data = data2;
		}else if(this.data instanceof List){
			this.data = processList(this.data);
		}else if(this.data instanceof Map) {
			this.data = processMap(this.data);
		}
		
		String result = json.toJson(this);
		
		try {
			if(data instanceof PageInfo) {
				PageInfo p = (PageInfo) data;
				p.clear();
			}
			
			this.data = null;
		} catch (Exception e) {
		}
		
		return result;
		
	}
	
	@SuppressWarnings({ "unchecked", "rawtypes" })
	private Object processMap(Object data2) {
		Map datas = (Map) data2;
		Map rows = new HashMap();
		
		for(Object key : datas.keySet()) {
			
			Object val = datas.get(key);
			if(val instanceof Model) {
				rows.put(key, processModel(val));
			}else if(val instanceof List){
				rows.put(key, processList(val));
			}else if(val instanceof Map) {
				rows.put(key, processMap(val));
			}else {
				rows.put(key, val);
			}
		}
		
		return rows;
	}

	/**
	 * <pre>将Model转化为Map</pre>
	 * @author tuxming
	 * @date 2020年5月11日
	 * @param data2
	 * @param tmpData2
	 */
	@SuppressWarnings("rawtypes")
	private Map<String, Object> processModel(Object tmpData2) {
		Map<String, Object> data2 = new HashMap<String, Object>();
		Model model = (Model) tmpData2;
		Method[] methods = tmpData2.getClass().getMethods();
		
		List<String> fieldNames = new ArrayList<String>();
		for(Method m : methods) {
			String name = m.getName();
			if(name.startsWith("get") && m.getParameterCount()==0 && !"getClass".equals(name)) {
				
				name = name.substring(3);
				name = name.substring(0,1).toLowerCase()+name.substring(1);
				
				try {
					Object data = m.invoke(model, new Object[] {});
					if(data!=null) {
						if(data instanceof List) {
							data2.put(name, processList(data));
						}else {
							data2.put(name, data);
						}
					}
				} catch (IllegalAccessException | IllegalArgumentException | InvocationTargetException e) {
					e.printStackTrace();
				}
				
				String fname = "";
				for(int i=0; i<name.length(); i++) { 
					
					char c = name.charAt(i);
					if((int)c<97) {
						fname += "_"+String.valueOf(c).toLowerCase();
					}else {
						fname +=String.valueOf(c);
					}
				}
				fieldNames.add(fname);
			}
			
		}
		
		List<String> exists = new ArrayList<String>();
		String[] attrNameSet = model._getAttrNames();
		for(String attr : attrNameSet) {
			if(!fieldNames.contains(attr)) {
				exists.add(attr);
			}
		}
		
		for(String exist : exists) {
			data2.put(exist, model.get(exist));
		}
		
		model.clear();
		
		return data2;
	}
	
	@SuppressWarnings({ "rawtypes", "unchecked" })
	private List processList(Object data2) {
		
		List datas = (List) data2;
		List rows = new ArrayList();
		
		for(Object data : datas) {
			if(data instanceof Model) {
				rows.add(processModel(data));
			}else if(data instanceof List) {
				rows.add(processList(data));
			}else if(data instanceof Map) {
				rows.add(processMap(data));
			}else {
				rows.add(data);
			}
		}
		
		return rows;
	}

	public String getMsg() {
		return msg;
	}
	public void setMsg(String msg) {
		this.msg = msg;
	}
	
	public String getCode() {
		return code;
	}
	public JsonResult setCode(String code) {
		this.code = code;
		return this;
	}
	public Boolean getStatus() {
		return status;
	}
	public JsonResult setStatus(Boolean status) {
		this.status = status;
		return this;
	}
	public Object getData() {
		return data;
	}
	public JsonResult setData(Object data) {
		this.data = data;
		return this;
	}

	public Boolean getFormat() {
		return format;
	}

	public void setFormat(Boolean format) {
		this.format = format;
	}

	public String[] getArgs() {
		return args;
	}

	public void setArgs(String[] args) {
		this.args = args;
	}
	
}
