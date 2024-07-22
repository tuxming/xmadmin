package com.xm2013.admin.common;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.TypeFactory;
import com.jfinal.json.Jackson;
import com.jfinal.kit.FileKit;

public class JsonKit {
	private static Logger log = Logger.getLogger(JsonKit.class);
	
	/**
	 * 将json装换成指定的对象
	 * @param data
	 * @param class
	 * @return
	 */
	public static <T> T getObject(String data, Class<T> t, String pattern){
		
		try {
			Jackson json = Jackson.getJson();
			ObjectMapper mapper = json.getObjectMapper();
			
			//json dataformat
			if(Kit.isNull(pattern)) {
				pattern = Kit.DATE_TIME_PATTERN;
			}
			mapper.setDateFormat(new SimpleDateFormat(pattern));
			
			//忽略没有对象中的字段
			mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
			// 创建只输出非Null且非Empty(如List.isEmpty)的属性到Json字符串的Mapper,建议在外部接口中使用.
//			mapper.setSerializationInclusion(Include.NON_EMPTY);
			return mapper.readValue(data, t);
		} catch (JsonParseException e) {
			log.error(e.getMessage(),e);
		} catch (JsonMappingException e) {
			log.error(e.getMessage(),e);
		} catch (IOException e) {
			log.error(e.getMessage(),e);
		}
		
		return null;
	}
	
	public static <T> T getObject(String data, Class<T> t){
		return getObject(data, t, Kit.DATE_TIME_PATTERN);
	}
	
	/**
	 * <pre>将String转换成map</pre>
	 * @author tuxming
	 * @date 2020年5月16日
	 * @param <K>
	 * @param <V>
	 * @param data
	 * @param k
	 * @param v
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public static <K,V> Map<K,V> getMap(String data, Class<K> k, Class<V> v){
		JavaType javaType = TypeFactory.defaultInstance().constructParametricType(HashMap.class, k, v);  
		return (Map<K, V>) convert(data, javaType, null);
	}
	
	public static Object convert(String data, JavaType javaType, String pattern) {
		try {
			Jackson json = Jackson.getJson();
			//忽略没有对象中的字段
			ObjectMapper mapper = json.getObjectMapper();
			mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
			
			if(Kit.isNull(pattern)) {
				pattern = Kit.DATE_TIME_PATTERN;
			}
			
			mapper.setDateFormat(new SimpleDateFormat(pattern));
			
			return mapper.readValue(data, javaType);   
			
			// 创建只输出非Null且非Empty(如List.isEmpty)的属性到Json字符串的Mapper,建议在外部接口中使用.
//			mapper.setSerializationInclusion(Include.NON_EMPTY);
			//return mapper.readValue(data, new TypeReference<List<T>>() { });
		} catch (JsonParseException e) {
			log.error(e.getMessage(),e);
		} catch (JsonMappingException e) {
			log.error(e.getMessage(),e);
		} catch (IOException e) {
			log.error(e.getMessage(),e);
		}
		return null;
	}
	
	/**
	 * 将json装换成指定的对象
	 * @param data
	 * @param class
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public static <T> List<T> getList(String data, Class<T> t, String datePattern){
		JavaType javaType = TypeFactory.defaultInstance().constructCollectionType(ArrayList.class, t); 
		return (List<T>) convert(data, javaType, datePattern);
	}
	
	/**
	 * 将json转换成List<Map<String, T> 类型的集合，
	 * 因为json的key只可能是String, 所以Map的key一定是String
	 * eg: "[{\"abc\": 1}, {\"acc\": 2}]"  
	 * eg: "[{\"abc\": "\aaa\"}, {\"acc\": \"bbb\"}]"  
	 * @param data
	 * @param class
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public static <V> List<Map<String, V>> getListMap(String data, Class<V> v ){
		JavaType mapType = TypeFactory.defaultInstance().constructParametricType(HashMap.class, String.class, v); 
		JavaType javaType = TypeFactory.defaultInstance().constructCollectionType(ArrayList.class, mapType); 
		
		return (List<Map<String, V>>) convert(data, javaType,  Kit.DATE_TIME_PATTERN);
	}
	
	public static void main(String[] args) {
		String json = "{\"2\":\"abc\", \"3\":\"abc\"}";
		Map<Integer, String> map = getMap(json, Integer.class, String.class);
		System.out.println(map);
//		System.out.println(getMap(json, Integer.class, String.class));
	}
	
	/**
	 * <pre>将string转换成List对象</pre>
	 * @author tuxming
	 * @date 2020年5月16日
	 * @param <T>
	 * @param data
	 * @param t
	 * @return
	 */
	public static <T> List<T> getList(String data, Class<T> t){
		return getList(data, t, Kit.DATE_TIME_PATTERN);
	}
	
	/**
	 * <pre>将String转换成JsonNode对象</pre> 
	 * @author tuxming
	 * @date 2020年5月16日
	 * @param data
	 * @return
	 */
	public static JsonNode getJson(String data){
		try {
			Jackson json = Jackson.getJson();
			ObjectMapper mapper = json.getObjectMapper();
			return mapper.readTree(data);
		} catch (JsonParseException e) {
			log.error(e.getMessage(),e);
		} catch (JsonMappingException e) {
			log.error(e.getMessage(),e);
		} catch (IOException e) {
			log.error(e.getMessage(),e);
		}
		
		return null;
	}
	
	/**
	 * 获取json, String值
	 * @param json
	 * @param key
	 * @return
	 */
	public static String getString(JsonNode json, String key){
		
		if(json==null)
			return "";
		if(Kit.isNull(key))
			return "";
		
		JsonNode value = getJsonNode(json, key);
		if(value==null){
			return "";
		}
		
		return value.asText();
		
	}

	/**
	 * 获取json的int 
	 * @param json
	 * @param key
	 * @return
	 */
	public static Integer getInt(JsonNode json, String key){
		
		JsonNode value = getJsonNode(json, key);
		
		return value!=null?value.asInt(0):null;
		
	}
	
	/**
	 * 获取json的double 
	 * @param json
	 * @param key
	 * @return
	 */
	public static Double getDouble(JsonNode json, String key, Double def){
		
		JsonNode value = getJsonNode(json, key);
		
		return value!=null?value.asDouble():def;
		
	}
	
	/**
	 * 获取json的int 
	 * @param json
	 * @param key
	 * @return
	 */
	public static Long getLong(JsonNode json, String key){
		
		JsonNode value = getJsonNode(json, key);
		
		return value!=null?value.asLong(0):null;
		
	}
	
	public static JsonNode getJsonNode(JsonNode json, String key){
		
		if(json==null)
			return null;
		if(Kit.isNull(key))
			return null;
		
		return json.get(key);
		
	}

	public static String toJson(Object data) {
		return toJson(data, null);
	}
	
	public static String toJson(Object data, String pattern) {
		try {
			if(Kit.isNull(pattern))
				pattern = Kit.DATE_TIME_PATTERN;
			
			Jackson json = Jackson.getJson();
//			json.setDatePattern(pattern);
			ObjectMapper mapper = json.getObjectMapper();
			mapper.setDateFormat(new SimpleDateFormat(pattern));
			// 设置输入时忽略在JSON字符串中存在但Java对象实际没有的属性
			mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
			return mapper.writeValueAsString(data);
		} catch (JsonParseException e) {
			log.error(e.getMessage(),e);
		} catch (JsonMappingException e) {
			log.error(e.getMessage(),e);
		} catch (IOException e) {
			log.error(e.getMessage(),e);
		}
		
		return null;
	}

	public static boolean getBoolean(JsonNode node, String key, boolean def) {
		JsonNode rst = node.get(key);
		if(rst!=null) {
			return rst.asBoolean();
		}
		
		return def;
	}

//	public static JsonNode getFromFile(String file) {
//		
//		try {
//			File f = new File(file);
//			if(!f.exists()) {
//				return null;
//			}
//			
//			String txt = FileKit.read(f);
//			if(txt == null || txt.length()==0) {
//				return null;
//			}
//			
//			JsonNode node = getJson(txt);
//			
//			return node;
//		} catch (Exception e) {
//			log.error(e.getMessage(), e);
//			return null;
//		}
//	}
}
