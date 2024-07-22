package com.xm2013.admin.common.http;

public class Http {
	public static Request xdo(String url) {
		return connect(url);
	}

	private static Request connect(String url) {
		return new Request().setUrl(url);
	}
	
	public static Request xdo(String url, boolean paramSort) {
		return connect(url, paramSort);
	}
	
	private static Request connect(String url, boolean paramSort) {
		return new Request(paramSort).setUrl(url);
	}
	
	public static void main(String[] args) {
		Response resp = Http.xdo("https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm")
//				.setSave("d:/", "2.html")
				.get();
		System.out.println(resp.getString());
//		byte[] datas = resp.getDatas();
		
//		for (byte b : datas) {
//			System.out.println(Integer.toBinaryString(b));
//		}
//		Map<String,String> map = new HashedMap<String,String>();
//		Response response = Http.xdo("http://www.fhk123.com/").setParams(map).post();
		
	}
	
}
