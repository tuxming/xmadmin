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

package com.xm2013.admin.common.captcha;

import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Font;
import java.awt.FontFormatException;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.geom.AffineTransform;
import java.awt.geom.Path2D;
import java.awt.geom.Rectangle2D;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Random;

import javax.imageio.ImageIO;

import org.apache.log4j.Logger;

/**
 * 验证码生成类
 */
public class CaptchaGenerator {
	private static Logger log = Logger.getLogger(CaptchaGenerator.class);
	public static final String VERIFY_CODES = "23456789ABCDEFGHJKLMNPRSTUVWXYZ";
	
	/**
	 * 生成随机验证码图片
	 * @param length
	 * @return
	 */
	public static String randomCode(int length) {
		Random random = new Random();
		char[] cs = new char[length];
		int clen = VERIFY_CODES.length();
		for(int i=0; i<length; i++) {
			cs[i] = VERIFY_CODES.charAt(random.nextInt(clen));
		}
		
		return new String(cs);
	}
	
	public static String randomNumberCode(int length) {
		Random random = new Random();
		String code = "";
		for(int i=0; i<length; i++) {
			code += random.nextInt(10);
		}
		return code;
	}
	
	/**
	 * 生成验证码图片
	 * @param code
	 * @param height
	 * @param fontSize
	 * @return
	 */
	public static BufferedImage generate(CaptchaSetting setting, String code){
		BufferedImage image= null;
		try {
			setting = initSetting(setting, code);
//			System.out.println(setting);
			int width = setting.getWidth();
			int height = setting.getHeight();
			
			image = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
			
			Random random = new Random();
			Graphics2D g = image.createGraphics();
			
			//添加背景图片颜色
			int bgType = setting.getBgType();
			for(int x=0; x<width; x++) {
				for(int y=0; y<height; y++) {
					image.setRGB(x, y, getRandomRGB(bgType));
				}
			}
			
			
			//画文字
			drawCode(setting, g, code, random);
		
			//添加随机线条
			drawRandomLine(setting, g, random);
			
			//画几个三角形，和圆形
			drawRandomPolygon(setting, g, random);
			
			g.dispose();
		} catch (Exception e) {
			log.error(e.getMessage(), e);
		}
		return image;
	}
	
	/**
	 * 生成字体颜色
	 * @param bgType，这个颜色要与背景颜色相反，所以0-亮色，1-暗色
	 * @return
	 */
	private static Color getFontColor(int bgType, Integer alpha) {
		Random random = new Random();
		
		int r = random.nextInt(255);
		int g = random.nextInt(255);
		int b = random.nextInt(255);
		
		int gray = (int)((0.2125 * r) + (0.7154 * g) + (0.0721 * b)); 
//		System.out.println(r+","+g+","+b+","+gray+","+bgType);
		
		if(bgType == 0 ) { //需要的是亮色，灰度值小于60说明颜色过与暗重新调整一次
			if(gray < 54) {
				return getFontColor(bgType, alpha);
			}
			else if(gray < 100 && ((r<85 && g<85) )){ //蓝色在暗色下面表现不偏暗，所以需要重新生成
				return getFontColor(bgType, alpha);
			}
		}else if(bgType == 1 && gray>200){ //需要暗色，灰度大于220,需要重新生成
			return getFontColor(bgType, alpha);
		}
		
		if(alpha!=null) {
			return new Color(r, g, b, alpha);
		}
		
		return new Color(r, g, b);
	}
	
	/**
	 * 生成随机背景色，如果type=0，生成暗色背景，如果type=1生成亮色背景
	 * @param bgType
	 * @return
	 */
	private static int getRandomRGB(int bgType) {
		
		Random random = new Random();
		int r = random.nextInt(75);
		int g = random.nextInt(75);
		int b = random.nextInt(75);
		
		if(bgType == 1) {
			r += 180;
			g += 180;
			b += 180;
		}
		
		Color color = new Color(r, g, b);
		return color.getRGB();
	}
	
	/**
	 * 加载字体
	 * @param fontfilename
	 * @return
	 * @throws FontFormatException
	 * @throws IOException
	 */
	private static Font loadFontFromFile() throws FontFormatException, IOException {
		InputStream is = CaptchaGenerator.class.getResourceAsStream("/com/xm2013/admin/common/captcha/LTStreetwayNeue-Bold.otf");
		Font font = Font.createFont(Font.TRUETYPE_FONT, is);
		return font;
	} 
	
	/**
	 * 初始化设置
	 * @param setting
	 * @param code
	 * @return
	 */
	private static CaptchaSetting initSetting(CaptchaSetting setting, String code) {
		
		if(setting == null) {
			setting = CaptchaSetting.defaultSetting();
			setting.setHeight(60);
			setting.setFontSize(40);
		}
		
		if(setting.getHeight() == 0) {
			setting.setHeight(60);
		}
		
		if(setting.getFontSize() == 0) {
			setting.setFontSize(40);
		}
//		if(setting == null) {
//			setting = CaptchaSetting.defaultSetting();
//			setting.setHeight(60*10);
//			setting.setFontSize(30*10);
//		}
//		
//		if(setting.getHeight() == 0) {
//			setting.setHeight(60*10);
//		}
//		
//		if(setting.getFontSize() == 0) {
//			setting.setFontSize(30*10);
//		}
		
		int duration = (int) (setting.getFontSize()/4d);
		int len = code.length();
		setting.setWidth(setting.getFontSize() * len + (len+1) * duration);
		setting.setCharDuration(duration*2);
		
		return setting;
	}
	
	/**
	 * 画验证码文字
	 * @param setting
	 * @param g
	 * @param code
	 * @param random
	 * @throws FontFormatException
	 * @throws IOException
	 */
	private static void drawCode(CaptchaSetting setting, Graphics2D g, String code, Random random) throws FontFormatException, IOException {
		int width = setting.getWidth();
		int height = setting.getHeight();
		int bgType = setting.getBgType();
		
		//初始化字体属性
		int fontSize = setting.getFontSize();
		Font font = loadFontFromFile();
		font = font.deriveFont(Font.PLAIN, fontSize);
		g.setFont(font);
		FontMetrics fm = g.getFontMetrics();
		Rectangle2D bounds = fm.getStringBounds("A", g);
		double centerX = bounds.getCenterX();
		double centerY = bounds.getCenterY();
		
		//画文字
		int x = (int) ((width/(code.length()+1))/2);
//		System.out.println(x);
		int y = 0;
		int duration = setting.getCharDuration();
		for (int i = 0; i < code.length(); i++) {
			String c = code.charAt(i)+"";
			
			//设置y方向上的随机偏移
			int heightPadding = height - fm.getHeight();
			int offsetY = random.nextInt(heightPadding);
			if(offsetY*2<heightPadding) {
				offsetY = 0-offsetY;
			}
			y = (int) (fm.getAscent()+heightPadding/2 + offsetY);
			
			//设置字体颜色
			g.setColor(getFontColor(bgType, null));
			
			//设置字体旋转
			int angleType = random.nextInt(2);
			int maxAngle = setting.getCodeRotateMaxAngle();
			double angle = 0;
			if(angleType == 0) {
				angle = Math.toRadians(random.nextInt(maxAngle));
			}else {
				angle = Math.toRadians(random.nextInt(maxAngle)+(360-maxAngle));
			}
			AffineTransform at = new AffineTransform();
	        at.rotate(angle, centerX, centerY);
			
	        //设置字体倾斜
	        // 设置倾斜变换，例如，沿着x轴正方向倾斜10度
	        
	        double shearX = Math.toRadians(random.nextInt(setting.getCodeMaxShareX())); // 将角度转换为弧度
	        at.shear(shearX, 0);
	        
	        Font f = font.deriveFont(at);
	        g.setFont(f);
	        
	        //画字体
			g.drawString(c, x, y);
			
			//设置x方向上的偏移
			int offsetX = random.nextInt(duration);
			if(offsetX > duration/2) {
				offsetX = 0-offsetX;
			}
			
			x += setting.getFontSize()+duration*0.4+offsetX;
			
		}
	}
	
	/**
	 * 添加随机干扰线条
	 * @param setting
	 * @param g
	 * @param random
	 */
	public static void drawRandomLine(CaptchaSetting setting, Graphics2D g, Random random) {
		int width = setting.getWidth();
		int height = setting.getHeight();
		int bgType = setting.getBgType();
		
		int lineNo = setting.getLineNo();
		for(int i=0; i<lineNo; i++) {
			
			//随机位置
			int x1 = random.nextInt(width);
			int x2 = random.nextInt(width);
			int y1 = random.nextInt(height);
			int y2 = random.nextInt(height);
			
			//随机颜色
			Color c = getFontColor(bgType, random.nextInt(175)+80); 
//					new Color(
//					random.nextInt(255), 
//					random.nextInt(255), 
//					random.nextInt(255), 
//					random.nextInt(175)+80
//				);
			
			//随机粗细
			g.setStroke(new BasicStroke(random.nextInt(2)+1));
			
			g.setColor(c);
			
			int lineType = random.nextInt(2);
			if(lineType == 0) {
				//画直线
				g.drawLine(x1, y1, x2, y2);
			}else {
				//画曲线
				Path2D.Float path = new Path2D.Float(); // 使用浮点数路径

		        // 定义曲线的起始点
		        path.moveTo(x1, y1); // 移动到起始点 (50, 150)

		        // 添加曲线的控制点和结束点
		        // 第一个 curveTo 是创建贝塞尔曲线的第一个控制点和结束点
		        // 第二个 curveTo 是创建贝塞尔曲线的第二个控制点和结束点
		        path.curveTo(
		        		random.nextInt(width), 
		        		random.nextInt(height), 
		        		random.nextInt(width), 
		        		random.nextInt(height), 
	        			x2, 
	        			y2); 

		        // 绘制曲线
		        g.draw(path);
			}
			
		}
	}
	
	/**
	 * 添加随机形状
	 */
	private static void drawRandomPolygon(CaptchaSetting setting,Graphics2D g, Random random) {
		int width = setting.getWidth();
		int height = setting.getHeight();
		int bgType = setting.getBgType();
		
		int polygonNo = setting.getPolygonNo();
		for(int i=0; i<polygonNo; i++) {
			Color c = getFontColor(bgType, random.nextInt(90)); 
			//随机粗细
			g.setStroke(new BasicStroke(random.nextInt(2)+1));
			g.setColor(c);
			
			int type = random.nextInt(2);
			if(type == 0) {
				//三角形
				int[] xPoints = {random.nextInt(width), random.nextInt(width), random.nextInt(width)}; // x 坐标数组
		        int[] yPoints = {random.nextInt(height), random.nextInt(height), random.nextInt(height)};   // y 坐标数组
				g.fillPolygon(xPoints, yPoints, 3);
			}else {
				int x1 = random.nextInt(width);
				int y1 = random.nextInt(height);
				int radius = random.nextInt(height);
				g.fillOval(x1 - radius, y1 - radius, radius * 2, radius * 2);
			}
		}
	}
	
	public static void main(String[] args) throws IOException {
		
		for(int i=0; i<30; i++) {
			BufferedImage img = generate(null, randomCode(4));
			File file = new File("C:\\Users\\Administrator\\Desktop\\11\\"+i+".png");
			if(!file.exists()) {
				file.createNewFile();
			}
			ImageIO.write(img, "png", file);
//			System.out.println("index:"+i);
		}
		
//		int gray = (int)((0.2125 * 255) + (0.7154 * 255) + (0.0721 * 0)); 
//		System.out.println(gray);
		
		
	}
	
}
