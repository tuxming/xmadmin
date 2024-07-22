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

public class JsonResult {
	private Boolean status;
	private String msg;
	private Boolean format = false;
	private String args[];
	private Object data;
	
	@JsonIgnore
	private Object tmpData;
	
	private String code = "200";  //code默认是200：成功
	
	public static JsonResult create(Object data) {
		return create(data, true);
	}
	
	public static JsonResult create(Object data, boolean status) {
		return create(data, status, null);
	}
	
	public static JsonResult create(Object data, boolean status, String msg) {
		JsonResult dto = new JsonResult();
		dto.setData(data);
		dto.setStatus(status);
		dto.setMsg(msg);

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
			dto.setCode("-20");
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
	
	public static String error(String msg, Object data) {
		JsonResult dto = create(data, false, msg);
		return dto.toString();
	}
	
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
