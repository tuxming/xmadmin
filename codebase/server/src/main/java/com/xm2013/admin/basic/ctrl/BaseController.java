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

package com.xm2013.admin.basic.ctrl;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

import javax.imageio.ImageIO;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import com.jfinal.core.Controller;
import com.jfinal.core.NotAction;

public class BaseController extends Controller{
	private static Logger log = Logger.getLogger(BaseController.class);
	
	/**
	 * 输出图片文件
	 * @author tuxming
	 * @date 2020年4月30日
	 * @param image
	 * @param filename
	 * @param format
	 */
	@NotAction
	public void renderImage(BufferedImage image, String filename, String format) {
		try {
			String mimeType = mimeType(format);
			HttpServletResponse response = getResponse();
			response.setContentType(mimeType);
			response.setHeader("Pragma","no-cache");
			response.setHeader("Cache-Control","no-cache");
			response.setIntHeader("Expires",-1);
			ImageIO.write(image, format, response.getOutputStream());
			renderNull();
		} catch (IOException e) {
			e.printStackTrace();
			log.error(e.getMessage(), e);
		}
	}
	
	/**
	 * 输出图片文件
	 * @author tuxming
	 * @date 2020年4月30日
	 * @param image
	 * @param filename
	 * @param format
	 */
	@NotAction
	public void renderImage(String path, String filename, String format) {
		renderImage(new File(path), filename, format);
	}
	
	/**
	 * 输出图片文件
	 * @author tuxming
	 * @date 2020年4月30日
	 * @param image
	 * @param filename
	 * @param format
	 */
	@NotAction
	public void renderImage(File file, String filename, String format) {
		try {
			BufferedImage bi = ImageIO.read(file);
			renderImage(bi, filename, format);
		} catch (IOException e) {
			e.printStackTrace();
			log.error(e.getMessage(), e);
		}
	}
	
	/**
	 * 根据图片类型获取mimeType类型
	 * @author tuxming
	 * @date 2021年5月26日
	 * @param ext
	 * @return
	 */
	private String mimeType(String ext) {

		if("png".equalsIgnoreCase(ext)) {
			return "image/png";
		}else if("bmp".equalsIgnoreCase(ext)) {
			return "image/bmp";
		}else if("gif".equalsIgnoreCase(ext)){
			return "image/gif";
		}else if("jpg".equalsIgnoreCase(ext)){
			return "image/jpeg";
		}else if("jpeg".equalsIgnoreCase(ext)) {
			return "image/jpeg";
		}
		return  "image/jpeg";
	}
	
}
