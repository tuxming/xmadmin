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
	 * 计算两个颜色之间的对比度比率
	 * @param color1 第一个颜色
	 * @param color2 第二个颜色
	 * @return 对比度比率
	 */
	private static double calculateContrastRatio(Color color1, Color color2) {
		double luminance1 = calculateLuminance(color1);
		double luminance2 = calculateLuminance(color2);
		
		double lighter = Math.max(luminance1, luminance2);
		double darker = Math.min(luminance1, luminance2);
		
		return (lighter + 0.05) / (darker + 0.05);
	}
	
	/**
	 * 计算颜色的相对亮度
	 * @param color 颜色
	 * @return 相对亮度值
	 */
	private static double calculateLuminance(Color color) {
		double r = color.getRed() / 255.0;
		double g = color.getGreen() / 255.0;
		double b = color.getBlue() / 255.0;
		
		// 应用gamma校正
		r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
		g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
		b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
		
		return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	}
	
	/**
	 * 生成字体颜色
	 * @param bgType，这个颜色要与背景颜色相反，所以0-亮色，1-暗色
	 * @return
	 */
	private static Color getFontColor(int bgType, Integer alpha) {
		Random random = new Random();
		int maxAttempts = 15; // 增加最大尝试次数
		int attempts = 0;
		
		// 预定义一些高对比度的颜色组合
		Color[] highContrastColors;
		if(bgType == 0) { // 暗色背景，亮色字体
			highContrastColors = new Color[]{
				Color.WHITE,
				new Color(255, 255, 200), // 浅黄色
				new Color(200, 255, 255), // 浅青色
				new Color(255, 200, 255), // 浅洋红
				new Color(255, 220, 180), // 浅橙色
				new Color(220, 255, 220), // 浅绿色
			};
		} else { // 亮色背景，暗色字体
			highContrastColors = new Color[]{
				Color.BLACK,
				new Color(50, 50, 50),    // 深灰色
				new Color(100, 0, 0),     // 深红色
				new Color(0, 100, 0),     // 深绿色
				new Color(0, 0, 100),     // 深蓝色
				new Color(100, 100, 0),   // 深黄色
			};
		}
		
		while (attempts < maxAttempts) {
			Color fontColor;
			
			// 80%概率使用预定义的高对比度颜色
			if(random.nextDouble() < 0.8) {
				fontColor = highContrastColors[random.nextInt(highContrastColors.length)];
			} else {
				// 20%概率生成随机颜色
				int r = random.nextInt(256);
				int g = random.nextInt(256);
				int b = random.nextInt(256);
				fontColor = new Color(r, g, b);
			}
			
			// 计算灰度值
			int gray = (int)((0.2126 * fontColor.getRed()) + (0.7152 * fontColor.getGreen()) + (0.0722 * fontColor.getBlue())); 
			
			boolean isValidColor = false;
			
			if(bgType == 0) { // 暗色背景，需要亮色字体
				// 灰度值需要大于160，确保字体足够亮
				if(gray >= 160) {
					// 额外检查：确保RGB值都足够高
					if(fontColor.getRed() >= 140 && fontColor.getGreen() >= 140 && fontColor.getBlue() >= 140) {
						isValidColor = true;
					}
				}
			} else if(bgType == 1) { // 亮色背景，需要暗色字体
				// 灰度值需要小于100，确保字体足够暗
				if(gray <= 100) {
					// 额外检查：确保RGB值都足够低
					if(fontColor.getRed() <= 120 && fontColor.getGreen() <= 120 && fontColor.getBlue() <= 120) {
						isValidColor = true;
					}
				}
			}
			
			if(isValidColor) {
				if(alpha != null) {
					return new Color(fontColor.getRed(), fontColor.getGreen(), fontColor.getBlue(), alpha);
				}
				return fontColor;
			}
			
			attempts++;
		}
		
		// 如果多次尝试都失败，使用默认的高对比度颜色
		if(bgType == 0) {
			// 暗色背景使用白色字体
			return alpha != null ? new Color(255, 255, 255, alpha) : Color.WHITE;
		} else {
			// 亮色背景使用黑色字体
			return alpha != null ? new Color(0, 0, 0, alpha) : Color.BLACK;
		}
	}
	
	/**
	 * 生成随机背景色，如果type=0，生成暗色背景，如果type=1生成亮色背景
	 * @param bgType
	 * @return
	 */
	private static int getRandomRGB(int bgType) {
		
		Random random = new Random();
		int r, g, b;
		
		if(bgType == 0) {
			// 暗色背景：RGB值在0-100之间，确保足够暗
			r = random.nextInt(100);
			g = random.nextInt(100);
			b = random.nextInt(100);
		} else {
			// 亮色背景：RGB值在200-255之间，确保足够亮
			r = random.nextInt(56) + 200;  // 200-255
			g = random.nextInt(56) + 200;  // 200-255
			b = random.nextInt(56) + 200;  // 200-255
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
			
			// 生成干扰线条颜色 - 使用中等对比度，避免与主文字竞争
			Color c = getInterferenceColor(bgType, random.nextInt(120)+60); // 透明度60-180
			
			//随机粗细 - 减少线条粗细，避免过度干扰
			g.setStroke(new BasicStroke(random.nextInt(1)+1)); // 1-2像素
			
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
	 * 生成干扰元素颜色 - 中等对比度，避免与主文字竞争
	 * @param bgType 背景类型
	 * @param alpha 透明度
	 * @return 干扰颜色
	 */
	private static Color getInterferenceColor(int bgType, int alpha) {
		Random random = new Random();
		
		// 干扰颜色应该比主文字颜色对比度低，但仍然可见
		if(bgType == 0) { // 暗色背景
			// 使用中等亮度的颜色
			int r = random.nextInt(100) + 100; // 100-200
			int g = random.nextInt(100) + 100; // 100-200
			int b = random.nextInt(100) + 100; // 100-200
			return new Color(r, g, b, alpha);
		} else { // 亮色背景
			// 使用中等暗度的颜色
			int r = random.nextInt(100) + 50;  // 50-150
			int g = random.nextInt(100) + 50;  // 50-150
			int b = random.nextInt(100) + 50;  // 50-150
			return new Color(r, g, b, alpha);
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
			// 使用干扰颜色，透明度较低
			Color c = getInterferenceColor(bgType, random.nextInt(60)+30); // 透明度30-90
			
			//随机粗细
			g.setStroke(new BasicStroke(random.nextInt(1)+1)); // 1-2像素
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
				int radius = random.nextInt(height/3); // 减小圆形半径，避免过度干扰
				g.fillOval(x1 - radius, y1 - radius, radius * 2, radius * 2);
			}
		}
	}
	
	/**
	 * 验证生成的验证码图片质量
	 * @param image 验证码图片
	 * @param bgType 背景类型
	 * @return 质量评分 (0-100)
	 */
	public static int validateCaptchaQuality(BufferedImage image, int bgType) {
		if(image == null) return 0;
		
		int width = image.getWidth();
		int height = image.getHeight();
		int totalPixels = width * height;
		
		// 统计亮色和暗色像素
		int brightPixels = 0;
		int darkPixels = 0;
		
		for(int x = 0; x < width; x++) {
			for(int y = 0; y < height; y++) {
				int rgb = image.getRGB(x, y);
				Color color = new Color(rgb);
				int gray = (int)((0.2126 * color.getRed()) + (0.7152 * color.getGreen()) + (0.0722 * color.getBlue()));
				
				if(gray > 128) {
					brightPixels++;
				} else {
					darkPixels++;
				}
			}
		}
		
		// 计算对比度分布
		double brightRatio = (double) brightPixels / totalPixels;
		double darkRatio = (double) darkPixels / totalPixels;
		
		// 理想的对比度分布：背景应该占主导，文字应该清晰可见
		int score = 0;
		
		if(bgType == 0) { // 暗色背景
			if(darkRatio > 0.6 && brightRatio > 0.1) {
				score = 80; // 基础分
				if(darkRatio > 0.7) score += 10;
				if(brightRatio > 0.15) score += 10;
			}
		} else { // 亮色背景
			if(brightRatio > 0.6 && darkRatio > 0.1) {
				score = 80; // 基础分
				if(brightRatio > 0.7) score += 10;
				if(darkRatio > 0.15) score += 10;
			}
		}
		
		return Math.min(score, 100);
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
