package com.xm2013.admin.domain.dto;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.jfinal.plugin.activerecord.Model;

public class PageInfo<T> {
	private int total = 0;
	private List<T> list = null;
	private boolean isModel = false;
	private boolean fromGet = true;
	
	List<Map<String, Object>> modelList = null;
	
	public PageInfo() {
		super();
	}
	
	public PageInfo(int total, List<T> list) {
		this();
		this.total = total;
		this.list = list;
		
	}
	public PageInfo(int total, List<T> list, boolean fromGet) {
		this();
		this.fromGet = fromGet;
		this.total = total;
		this.list = list;
		
	}
	
	/**
	 * <pre>将Model转化为Map</pre>
	 * @author tuxming
	 * @date 2020年5月11日
	 * @param data2
	 * @param tmpData2
	 */
	@SuppressWarnings("rawtypes")
	private void processModel(Map<String, Object> data2, Object tmpData2) {
		
		Model model = (Model) tmpData2;
		
		if(fromGet) {
			Method[] methods = model.getClass().getMethods();
			List<String> fieldNames = new ArrayList<String>();
			for(Method m : methods) {
				String name = m.getName();
				if(name.startsWith("get") && m.getParameterCount()==0 && !"getClass".equals(name)) {
					
					name = name.substring(3);
					name = name.substring(0,1).toLowerCase()+name.substring(1);
					
					try {
						Object data = m.invoke(model, new Object[] {});
//						if(data!=null) {
//							System.out.println("name="+name+", type="+data.getClass().getName()+", data="+data.toString());
//						}
						data2.put(name, data);
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
			for(String attr : model._getAttrNames()) {
				if(!fieldNames.contains(attr)) {
					exists.add(attr);
				}
			}
			
			for(String exist : exists) {
				data2.put(exist, model.get(exist));
			}
		}else {
			for(String attr : model._getAttrNames()) {
				String key = attr;
				if(attr.indexOf("_") > -1) {
					key = lineToHump(key);
				}
				
				data2.put(key, model.get(attr));
			}
		}
	}
	
	private static String pattern = "_(\\w)";
	/** 下划线转驼峰 */
	public static String lineToHump(String str) {
		str = str.toLowerCase();
		Pattern linePattern = Pattern.compile(pattern);
		Matcher matcher = linePattern.matcher(str);
		StringBuffer sb = new StringBuffer();
		while (matcher.find()) {
			matcher.appendReplacement(sb, matcher.group(1).toUpperCase());
		}
		matcher.appendTail(sb);
		return sb.toString();
	}
	
	public int getTotal() {
		return total;
	}
	public PageInfo<T> setTotal(int total) {
		this.total = total;
		return this;
	}
	
	@JsonIgnore
	public List<T> getRealList() {
		return list;
	}
	
	@SuppressWarnings("rawtypes")
	public List getList() {
		
		if(isModel) {
			return modelList;
		}else {
			if(this.list.size()>0) {
				T t = list.get(0);
				if(t instanceof Model) {
					this.isModel = true;
					this.modelList = new ArrayList<Map<String, Object>>();
					for(T obj : list) {
						Map<String, Object> row = new HashMap<String, Object>();
						processModel(row, obj);
						modelList.add(row);
					}
					return modelList;
				}
			}
		}
		return list;
	}
	
	public PageInfo<T> setList(List<T> list) {
		this.list = list;
		return this;
	}
	
	@SuppressWarnings("rawtypes")
	public void clear() {
		if(modelList!=null) {
			modelList.clear();
		}
		
		if(this.list!=null) {
			if(this.list.size()>0) {
				T t = list.get(0);
				if(t instanceof Model) {
					Model m = (Model) t;
					m.clear();
				}
			}
			
			this.list.clear();
		}
		
		modelList = null;
		list = null;
	}
	
}
