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

package com.xm2013.admin.validator;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.jfinal.plugin.activerecord.Model;
import com.xm2013.admin.basic.ctrl.BaseController;
import com.xm2013.admin.common.Kit;

/**
 * 验证器验证类
 * @author tuxming@sina.com
 * @created 2018年12月15日
 */
public class Validator {
	private boolean hasError = false;
	private boolean validateAll = true; //true: 验证完所有配置， false: 遇到验证不通过就返回
	private Map<String, List<String>> errors = new LinkedHashMap<>();  //所有的错误消息
	
	public Validator() {}
	public Validator(boolean validateAll) {this.validateAll = validateAll;}
	
	public void init() {
		this.hasError = false;
		this.errors = new LinkedHashMap<String, List<String>>();
	}
	
	/**
	 * true: 验证完所有配置， false: 遇到验证不通过就返回
	 * @param validateAll
	 */
	public void setValidateAll(boolean validateAll) {
		this.validateAll = validateAll;
	}
	
	/**
	 * 默认验证所有需要验证的字段
	 * @author tuxming@sina.com
	 * @created	2018年12月15日
	 * @param bean
	 * @param group
	 * @return
	 */
	public boolean exec(Object bean, String group) {
		return exec(bean, group, true);
	}
	
	/**
	 * 解析并验证配置是否正确，如果不正确，则返回无错误
	 * @author tuxming@sina.com
	 * @created	2018年12月15日
	 * @param bean
	 * @param group
	 * @param validateAll 是否验证所有，false:遇到验证不通过的就完成， true：验证完所有的字段
	 * @return
	 */
	public boolean exec(Object bean, String group, boolean validateAll){
		this.validateAll = validateAll;
		Validate[] validates = getValidates(bean, group);
		prepareValidate(bean, validates);
		return hasError;
	}

	private Validate[] getValidates(Object bean, String group) {
		if(bean == null) {
			hasError = true;
			addMsg("bean", "待校验对象为空");
			return null;
		}
		
		V v = bean.getClass().getAnnotation(V.class);
		if(v==null) {
			addMsg("bean", "未找到验证配置");
			hasError = true;
			return null;
		}
		
		ValidateGroup[] vgs = v.value();
		if(vgs==null || vgs.length==0) {
			addMsg("bean", "未找到验证配置");
			hasError = true;
			return null;
		}
		
		ValidateGroup vg = null;
		for(ValidateGroup tmp : vgs) {
			if(tmp.name().equals(group)) {
				vg=tmp;
				break;
			}
		}
		
		if(vg==null) {
			addMsg("bean", "未找到验证配置");
			hasError = true;
			return null;
		}
		
		Validate[] validates = vg.validates();
		if(validates==null || validates.length==0) {
			addMsg("bean", "未找到验证配置");
			return null;
		}
		
		return validates;
	}
	
	/**
	 * 准备执行验证
	 * @author tuxming@sina.com
	 * @created	2018年12月15日
	 * @param validates
	 * @param validateAll
	 */
	private void prepareValidate(Object bean, Validate[] validates) {
		
		Class<?> clazz = bean.getClass();
		//将验证类型按字段分组
		Map<String, List<Validate>> maps = new LinkedHashMap<>();
		for(Validate v : validates) {
			
			List<Validate> vds = maps.get(v.field());
			if(vds==null) {
				vds = new ArrayList<Validate>();
				maps.put(v.field(), vds);
			}
			
			vds.add(v);
		}
		
		for(String field : maps.keySet()) {
			
			Object value = null;
			try {
				value = getValue(clazz, bean, field);
			} catch (Exception e) {
				//如果抛出异常，说明待验证的字段不在该对象里面，跳过该字段的验证
				continue;
			}
			
			for(Validate validate : maps.get(field)) {
				doValidate(clazz, bean, validate, field, value);
				if(hasError && !validateAll) {
					return;
				}
			}
			
		}
		
	}

	/**
	 * 验证组， 默认验证所有需要验证的字段
	 * @author tuxming@sina.com
	 * @created	2024年07月10日
	 * @param bean 要验证的对象
	 * @param name 要验证的名称：ValidateUnion#name
	 * @return
	 */
	public boolean execUnion(Object bean, String name) {
		
		return execUnion(bean, name, true);
	}
	
	/**
	 * 验证组， 默认验证所有需要验证的字段
	 * @author tuxming@sina.com
	 * @created	2024年07月10日
	 * @param bean 要验证的对象
	 * @param name 要验证的名称：ValidateUnion#name
	 * @param validateAll 是否验证所有字段： true验证所有字段，false遇到验证的字段不通过的时候，就返回
	 * @return
	 */
	public boolean execUnion(Object bean, String name, boolean validateAll) {
		if(Kit.isNull(name)) {
			addMsg("bean", "未指定配置名");
			hasError = true;
			return hasError;
		}
		this.validateAll = validateAll;
		@SuppressWarnings("unused")
		Class<?> clazz = bean.getClass();
		
		ValidateUnions unions = bean.getClass().getAnnotation(ValidateUnions.class);
		if(unions==null) {
			addMsg("bean", "未找到验证配置");
			hasError = true;
			return hasError;
		}
		
		ValidateUnion[] values = unions.values();
		if(values == null || values.length == 0) {
			addMsg("bean", "未找到验证配置");
			hasError = true;
			return hasError;
		}
		
		ValidateUnion validateUnion = null;
		for (ValidateUnion vn : values) {
			if(name.equals(vn.name())) {
				validateUnion = vn;
			}
		}
		
		if(validateUnion == null) {
			addMsg("bean", "未找到验证配置");
			hasError = true;
			return hasError;
		}
		
		List<Validate> validates = new ArrayList<Validate>();
		String[] names = validateUnion.values();
		for (String vname : names) {
			Validate[] vs = getValidates(bean, vname);
			if(vs!=null && vs.length > 0) {
				for (Validate v : vs) {
					validates.add(v);
				}
			}
		}
		
		if(validates.size()==0) {
			addMsg("bean", "未找到验证配置");
			return hasError;
		}
		
		prepareValidate(bean, validates.toArray(new Validate[validates.size()]));
		
		return hasError;
	}
	
	/**
	 * 执行验证
	 * @author tuxming@sina.com
	 * @created	2018年12月15日
	 * @param validate
	 * @param field
	 * @param value
	 */
	private void doValidate(Class<?> clazz, Object bean, Validate validate, String field, Object value) {
		
		if(ValidateType.NULLABLE.equals(validate.type())) {
			processNullable(validate, value);
		}else if(ValidateType.NOEMPTY.equals(validate.type())) {
			processEmpty(validate, value);
		}else if(ValidateType.MAX.equals(validate.type())) {
			processMax(validate, value);
		}else if(ValidateType.MIN.equals(validate.type())) {
			processMim(validate, value);
		}else if(ValidateType.MAXLENGTH.equals(validate.type())) {
			processMaxLength(validate, value);
		}else if(ValidateType.MINLENGTH.equals(validate.type())) {
			processMinLength(validate, value);
		}else if(ValidateType.EQUALS.equals(validate.type())) {
			processEquals(clazz, bean, validate, value);
		}else if(ValidateType.CHAR_AND_NUMBER.equals(validate.type())){
			processCharAndNumber(validate, value);
		}else if(ValidateType.REG.equals(validate.type())) {
			processRegexp(validate, value);
		}
	}

	/**
	 * 验证是不是满足指定的正则表达式
	 * @author tuxming@sina.com
	 * @created	2018年12月15日
	 * @param validate
	 * @param value
	 */
	private void processRegexp(Validate validate, Object value) {

		String reg = validate.value();
		if(Kit.isNull(reg)) {
			throw new ValidateException("字段："+validate.field()+", REGEXP类型的value为正则表达式字符串，该值不能为空！");
		}
		
		try {
			String val = (String)value;
			if(value == null || !val.matches(reg)) {
				hasError = true;
				addMsg(validate);
			}
			
		}catch (Exception e) {
			throw new ValidateException("字段："+validate.field()+", REGEXP类型只支持验证String类型");
		}
	}

	/**
	 * 验证是否相等
	 * @author tuxming@sina.com
	 * @created	2018年12月15日
	 * @param validate
	 * @param value
	 */
	private void processEquals(Class<?> clazz, Object bean, Validate validate, Object value) {
		
		Object target = null;
		
		target = getValue(clazz, bean, validate.value());
		
		if(target == null && value!=null) {
			hasError = true;
			addMsg(validate);
		}
		
		if(target!=null && !target.equals(value)) {
			hasError = true;
			addMsg(validate);
		}
	}

	/**
	 * 验证最小长度限制
	 * @author tuxming@sina.com
	 * @created	2018年12月15日
	 * @param validate
	 * @param value
	 */
	private void processMinLength(Validate validate, Object value) {
		
		try {
			String val = (String)value;
			try {
				Integer length = Integer.parseInt(validate.value());
				if(val!=null && val.trim().length()<length) {
					hasError = true;
					addMsg(validate.field(), validate.msg());
				}
			}catch (Exception e) {
				throw new ValidateException("字段："+validate.field()+", 验证类型错误， MINLENGTH类型的value值不是正确的数值类型");
			}
			
			if(val == null || val.trim().length()==0) {
				hasError = true;
				addMsg(validate);
			}
		}catch(Exception e) {
			throw new ValidateException("字段："+validate.field()+", 验证类型错误， MINLENGTH类型只支持验证String类型");
		}
	}
	
	/**
	 * 验证最大长度限制
	 * @author tuxming@sina.com
	 * @created	2018年12月15日
	 * @param validate
	 * @param value
	 */
	private void processMaxLength(Validate validate, Object value) {
		
		try {
			String val = (String)value;
			try {
				Integer length = Integer.parseInt(validate.value());
				if(val!=null && val.trim().length()>length) {
					hasError = true;
					addMsg(validate.field(), validate.msg());
				}
			}catch (Exception e) {
				throw new ValidateException("字段："+validate.field()+", 验证类型错误， MAXLENGTH类型的value值不是正确的数值类型");
			}
			
			if(val == null || val.trim().length()==0) {
				hasError = true;
				addMsg(validate);
			}
		}catch(Exception e) {
			throw new ValidateException("字段："+validate.field()+", 验证类型错误， MAXLENGTH类型只支持验证String类型");
		}
	}

	/**
	 * 验证最小值界限
	 * @author tuxming@sina.com
	 * @created	2018年12月15日
	 * @param validate
	 * @param value
	 */
	private void processMim(Validate validate, Object value) {
		Number number = (Number) value;
		if(number != null) {
			try {
				BigDecimal target = new BigDecimal(validate.value());
				if(number.doubleValue()<target.doubleValue()) {
					hasError = true;
					addMsg(validate.field(), validate.msg());
				}
			}catch (Exception e) {
				throw new ValidateException("字段："+validate.field()+", 验证类型错误，MIN类型的value值不是正确的数值类型");
			}
			
		}
	}

	/**
	 * 验证最大值界限
	 * @author tuxming@sina.com
	 * @created	2018年12月15日
	 * @param validate
	 * @param value
	 */
	private void processMax(Validate validate, Object value) {
		
		Number number = (Number) value;
		if(number != null) {
			try {
				BigDecimal target = new BigDecimal(validate.value());
				if(number.doubleValue()>target.doubleValue()) {
					hasError = true;
					addMsg(validate.field(), validate.msg());
				}
			}catch (Exception e) {
				throw new ValidateException("字段："+validate.field()+", 验证类型错误，MAX类型的value值不是正确的数值类型");
			}
			
		}
		
	}

	/**
	 * 验证空白字符串
	 * @author tuxming@sina.com
	 * @created	2018年12月15日
	 * @param validate
	 * @param value
	 */
	private void processEmpty(Validate validate, Object value) {
		try {
			String val = (String)value;
			if(val == null || val.trim().length()==0) {
				hasError = true;
				addMsg(validate);
			}
		}catch(Exception e) {
			throw new ValidateException("字段："+validate.field()+", 验证类型错误，EMPTY类型只支持验证String类型");
		}
	}
	
	/**
	 * 验证是否值包含数字，包括A-Za-z0-9-_
	 * @param validate
	 * @param value
	 */
	private void processCharAndNumber(Validate validate, Object value) {
		try {
			String val = (String)value;
			if(val == null || val.trim().length()==0) {
				hasError = true;
				addMsg(validate);
			}
			
			String reg = "[A-Za-z0-9\\-\\_]+";
			if(!val.matches(reg)) {
				hasError = true;
				addMsg(validate.field(), validate.msg());
			}
			
		}catch(Exception e) {
			throw new ValidateException("字段："+validate.field()+", 验证类型错误，CHAR_AND_NUMBER类型只支持验证String类型");
		}
	}
	

	/**
	 * 验证空对象
	 * @author tuxming@sina.com
	 * @created	2018年12月15日
	 * @param validate
	 * @param value
	 */
	private void processNullable(Validate validate, Object value) {
		if(null==value) {
			hasError = true;
			addMsg(validate);
		}
	}
	
	private Object getValue(Class<?> clazz, Object bean, String field){
		Method method = null;
		boolean isModel = false;
		try {
			String getter = buildGetter(field);
			method = clazz.getMethod(getter, new Class<?>[] {});
			 
		} catch (NoSuchMethodException e) {
		} catch (SecurityException e) {
		} 
		
		//value = method.invoke(bean, new Object[] {});
		
		if(method == null) {
			if(bean instanceof Model) {
				Model<?> model = (Model<?>) bean;
				String[] keys = model._getAttrNames();
				
				for(String key : keys) {
					if(key.equals(field)) {
						isModel = true;
						break;
					}
				}
				
			}
		}
		
		//即没有getter,也不是jfinal的module的类，说明字段不存在，则不验证
		if(method==null && ! isModel) {
			throw new ValidateException("该对象没有对应的字段："+field);
		}
		
		Object value = null;
		if(method!=null) {
			try {
				value = method.invoke(bean, new Object[] {});
			} catch (IllegalAccessException e) {
			} catch (IllegalArgumentException e) {
			} catch (InvocationTargetException e) {
			}
			
		}else if(isModel){
			Model<?> model = (Model<?>) bean;
			value = model.get(field);
		}
		return value;
	}
	
	private void addMsg(String field, String msg) {
		List<String> msgs = errors.get(field);
		
		if(msgs == null) {
			msgs = new ArrayList<String>();
			errors.put(field, msgs);
		}
		msgs.add(msg);
	}
	
	private void addMsg(Validate validate) {
		
		List<String> msgs = errors.get(validate.field());
		
		if(msgs == null) {
			msgs = new ArrayList<String>();
			errors.put(validate.field(), msgs);
		}
		msgs.add(validate.msg());
	}
	
	private String buildGetter(String field) {
		return "get"+field.substring(0, 1).toUpperCase()+field.substring(1);
	}
	
	public Boolean hasError() {
		return hasError;
	}

	public Map<String, List<String>> getErrors() {
		return errors;
	}
	
	public String getStringErrors() {
		
		StringBuffer buffer = new StringBuffer();
		for(String field : errors.keySet()) {
			List<String> msgs = errors.get(field);
			for(String msg : msgs) {
				buffer.append(msg).append(",");
			}
			
		}
		
		if(buffer.length()>0) {
			buffer.deleteCharAt(buffer.lastIndexOf(","));
		}
		
		return buffer.toString();
		
	}
	
	public String getStringErrors(BaseController ctrl) {
		
		StringBuffer buffer = new StringBuffer();
		for(String field : errors.keySet()) {
			List<String> msgs = errors.get(field);
			for(String msg : msgs) {
				buffer.append(msg).append(",");
			}
			
		}
		
		if(buffer.length()>0) {
			buffer.deleteCharAt(buffer.lastIndexOf(","));
		}
		
		return buffer.toString();
		
	}
	public String getError() {
		for(String field : errors.keySet()) {
			List<String> msgs = errors.get(field);
			for(String msg : msgs) {
				return msg;
			}
		}
		return null;
	}
	
}
