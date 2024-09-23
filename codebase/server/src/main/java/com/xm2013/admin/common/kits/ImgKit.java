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

package com.xm2013.admin.common.kits;

import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.util.Base64;

import javax.imageio.ImageIO;

import org.apache.log4j.Logger;

import net.coobird.thumbnailator.Thumbnails;
import net.coobird.thumbnailator.Thumbnails.Builder;
import net.coobird.thumbnailator.geometry.Position;

/**
 * @desc 图片工具类
 * @author tuxming
 * @date 2020年4月28日
 */
public class ImgKit {

	private static Logger log = Logger.getLogger(ImgKit.class);

	private BufferedImage target = null;
	private boolean resize = false;
	private int width = 0;
	private int height = 0;
	
	/**
	 * @desc 输出格式，默认jpg
	 */
	private String format = "jpg";
	private Builder<BufferedImage> builder;
	
	/**
	 * @desc 图片输出质量，默认0.8
	 */
	private float quality = 0.8f; 
	
	protected ImgKit(BufferedImage img) {
		this.width = img.getWidth();
		this.height = img.getHeight();
		this.builder = Thumbnails.of(img);
	}
	
	/**
	 * @desc 初始化工具类，从图片文件中初始化
	 * @author tuxming
	 * @date 2020年4月28日
	 * @param imgPath
	 * @return
	 * @throws IOException
	 */
	public static ImgKit of(String imgPath) throws IOException {
		File file = new File(imgPath);
		if(!file.exists()) {
			throw new IOException("文件不存在");
		}
		
		return of(file);
	}
	
	/**
	 * @desc 初始化工具类，从图片文件中初始化
	 * @author tuxming
	 * @date 2020年4月28日
	 * @param file
	 * @return
	 * @throws IOException
	 */
	public static ImgKit of(File file) throws IOException {
		return of(ImageIO.read(file));
	}
	
	/**
	 * @desc 初始化工具类，通过BufferedImage初始化
	 * @author tuxming
	 * @date 2020年4月28日
	 * @param file
	 * @return
	 * @throws IOException
	 */
	public static ImgKit of(BufferedImage img)  {
		return new ImgKit(img);
	}
	
	/**
	 * @desc 初始化工具类， 从base64编码的图片中初始化
	 * @author tuxming
	 * @date 2020年4月28日
	 * @param base64
	 * @return
	 * @throws IOException
	 */
	public static ImgKit ofBase64(String base64) {
		//对字节数组字符串进行Base64解码并生成图片  
		if (base64 == null) //图像数据为空  
			return null; 
		byte[] b = Base64.getDecoder().decode(base64);
		return offByte(b);
	}
	
//	/**
//	 * @desc 初始化工具类，从16进制编码中出事初始化图片
//	 * @author tuxming
//	 * @date 2020年4月28日
//	 * @param base64
//	 * @return
//	 */
//	public static ImgKit ofHex(String imgHex) {
//		byte[] imgBytes = Kit.hexStringToBytes(imgHex);
//		return offByte(imgBytes);
//	}
//	
	/**
	 * @desc 初始化工具类， 从字节码中初始化图片
	 * @author tuxming
	 * @date 2020年4月28日
	 * @param bytes
	 * @return
	 */
	public static ImgKit offByte(byte[] bytes) {
		for(int i=0;i<bytes.length;++i)  
		{  
			if(bytes[i]<0)  
			{//调整异常数据  
				bytes[i]+=256;  
			}  
		}
		
		try {
			ByteArrayInputStream bais = new  ByteArrayInputStream(bytes);
			BufferedImage image = ImageIO.read(bais);
			return of(image);
		} catch (IOException e) {
			log.error(e.getMessage());
		}
		return null;
	}
	
	/**
	 * @desc 输出格式，默认jpg
	 * @author tuxming
	 * @date 2020年4月28日
	 * @return
	 */
	public ImgKit outputFormat(String format) {
		this.format = format;
		return this;
	}
	
	/**
	 * @desc 输出质量,  0-1,默认0.8
	 * @author tuxming
	 * @date 2020年4月28日
	 * @return
	 */
	public ImgKit quality(float quality) {
		this.quality = quality;
		return this;
	}
	
	/**
	 * @desc 输出为二进制图片
	 * @author tuxming
	 * @date 2020年4月28日
	 * @param img BufferedImage
	 * @return byte[]
	 */
	public byte[] toByte() {
		ByteArrayOutputStream out = null;
		try {
			out = new ByteArrayOutputStream();
			ImageIO.write(this.toBufferedImage(), this.format, out);
			byte[] b = out.toByteArray();  
			return b;
		} catch (IOException e) {
			log.error(e.getMessage(),e);
		} finally {
			if(out!=null) {
				try {
					out.close();
				} catch (IOException e) {
				}
			}
		}
		return null;
	}
	
//	/**
//	 * @desc 输出为16进制编码的图片
//	 * @param img
//	 * @return String 16进制的图片
//	 */
//	public String toHex(){
//		return Tools.byteToHex(toByte());
//	}
	
	/**
	 * @desc 输出为base64的图片
	 * @param file String  文件路径
	 * @return String base64的图片
	 */
	public String toBase64() {
		byte[] bs = toByte();
		return Base64.getEncoder().encodeToString(bs);
	}
	
	/**
	 * @desc 输出到指定文件
	 * @author tuxming
	 * @date 2020年4月28日
	 * @param filepath
	 * @return
	 */
	public File toFile(String filepath) {
		File file = new File(filepath);
		try {
			if(this.resize) {
				this.builder.outputQuality(this.quality).toFile(file);
			}else {
				this.builder.scale(1d).outputQuality(this.quality).toFile(file);
			}
		} catch (IOException e) {
			log.error(e.getMessage(), e);
		}
		return file;
	}
	
	/**
	 * @desc 输出为bufferedImage
	 * @author tuxming
	 * @date 2020年4月28日
	 * @return
	 */
	public BufferedImage toBufferedImage() {
		try {
			if(this.target==null) {
				if(resize) {
					this.target = this.builder.outputQuality(quality).asBufferedImage();
				}else {
					this.target = this.builder.scale(1.0f).outputQuality(quality).asBufferedImage();
				}
			}
			
			return this.target;
		} catch (IOException e) {
			log.error(e.getMessage(), e);
		}
		return null;
	}
	
	
	/**
	 * @desc 比较两张图片等的相似度
	 * @author tuxming
	 * @date 2020年4月28日
	 * @param s bufferedImage的图片
	 * @param t bufferedImage的图片
	 * @return 相似度0-100
	 */
	public float compare(BufferedImage ti) {
		int[] s = getHistogram(this.toBufferedImage());
		int[] t = getHistogram(ti);
		return compare(s,t);
	}
	
	/**
	 * @desc 比较两张图片的相似度
	 * @param s byte[]图片的直方图
	 * @param t byte[]图片的直方图
	 * @return 相似度0-100
	 */
	public float compare(int[] s, int[] t) {
		try{
			float result = 0F;
			for (int i = 0; i < 256; i++) {
				int abs = Math.abs(s[i] - t[i]);
				int max = Math.max(s[i], t[i]);
				result += (1 - ((float) abs / (max == 0 ? 1 : max)));
			}
			return (result / 256) * 100;
		}catch(Exception exception){
			return 0;
		}
	}
	
	/**
	 * @desc 获取图片的直方图
	 * @param name
	 * @return
	 */
	public int[] getHistogram(BufferedImage img) {
		BufferedImage slt = new BufferedImage(img.getWidth(), img.getHeight(), BufferedImage.TYPE_INT_RGB);
		slt.getGraphics().drawImage(img, 0, 0, img.getWidth(), img.getHeight(), null);
		// ImageIO.write(slt,"jpeg",new File("slt.jpg"));
		int[] data = new int[256];
		for (int x = 0; x < slt.getWidth(); x++) {
			for (int y = 0; y < slt.getHeight(); y++) {
				int rgb = slt.getRGB(x, y);
				Color myColor = new Color(rgb);
				int r = myColor.getRed();
				int g = myColor.getGreen();
				int b = myColor.getBlue();
				data[(r + g + b) / 3]++;
			}
		}
		// data 就是所谓图形学当中的直方图的概念
		return data;
	}
	
	/**
	 * @desc 缩放图片
	 * @author tuxming
	 * @date 2020年4月28日
	 * @param zoom
	 * @return
	 */
	public ImgKit scale(double scale) {
		this.resize = true;
		this.builder.scale(scale);
		return this;
	}
	
	/**
	 * <pre>重新设置尺寸, 根据图片本身的最大值决定，
	 * <p> 如： width:200, height:200, 如果宽度大于高度，  则按输入的宽度进行等比缩放， 这时候width:200, 高度会小于200
	 * <p> 如果高度大于宽度，这时候height:200, 宽度会小于200 
	 * </pre>
	 * @author tuxming
	 * @date 2020年4月28日
	 * @param zoom
	 * @return
	 */
	public ImgKit size(int width, int height) {
		if(this.width<width && this.height<height) {
			return this;
		}
		this.resize = true;
		this.builder.size(width, height);
		return this;
	}
	
	/**
	 * <pre>重设尺寸，忽略图片本身比列，强制修改图片的宽高
	 * </pre>
	 * @author tuxming
	 * @date 2020年4月29日
	 * @param width
	 * @param height
	 * @return
	 */
	public ImgKit resize(int width, int height) {
		this.resize = true;
		this.builder.size(width, height).keepAspectRatio(false);
		return this;
	}
	
	/**
	 * <pre>重设尺寸
	 * </pre>
	 * @author tuxming
	 * @date 2020年4月29日
	 * @param width
	 * @param height
	 * @param keep false： 忽略图片本身比列, true: 保持比列
	 * @return
	 */
	public ImgKit resize(int width, int height, boolean keep) {
		this.resize = true;
		this.builder.size(width, height).keepAspectRatio(keep);
		return this;
	}
	
	/**
	 * @desc 添加水印
	 * @author tuxming
	 * @date 2020年4月28日
	 * @param position @see net.coobird.thumbnailator.geometry.Positions
	 * @param image BufferedImage
	 * @param opacity 透明度
	 * @return
	 */
	public ImgKit watermark(Position position, BufferedImage image, float opacity) {
		this.builder.watermark(position, image, opacity);
		return this;
	}
	
	public static int[] color2RGB(int rgb) {
		int color = 0xff000000 | rgb;
		int  red   = (color >> 16) & 0xFF;;
		int  green = (color >> 8) & 0xFF;;
		int  blue  =  (color >> 0) & 0xFF;
		int alpha = (color >> 24) & 0xff;
		return new int[] {red, green, blue, alpha};
	}
	
	public static int RGB2Color(int[] rgb) {
		return RGB2Color(rgb[0], rgb[1], rgb[2]);
	}
	
	public static int RGB2Color(int red, int green, int blue) {
		return ((255 & 0xFF) << 24) |
                ((red & 0xFF) << 16) |
                ((green & 0xFF) << 8)  |
                ((blue & 0xFF) << 0);
	}
	
	public static int getGray(int[] rgb) {
		return (rgb[0]*28 + rgb[1]*151 + rgb[2]*77) >> 8;
	}
	
	
	public static int getGray(int color) {
		int[] rgb = color2RGB(color);
		return (rgb[0]*28 + rgb[1]*151 + rgb[2]*77) >> 8;
	}
	
	/**
	 * 获取红色值
	 * @param rgb
	 * @return
	 */
	public static int getR(int rgb) {
		int color = 0xff000000 | rgb;
		int  red   = (color >> 16) & 0xFF;;
		return red;
	}
	
	/**
	 * <pre>将图片二值化，所有非白色全部转换为黑色</pre>
	 * @param img
	 */
	public static void toGray(BufferedImage img) {
		
		int width = img.getWidth();
		int height =img.getHeight();
		int white = Color.white.getRGB();
		int black = Color.black.getRGB();
		
		for(int x = 0; x<width; x++) {
			for(int y = 0; y<height; y++) {
				int color = img.getRGB(x, y);

				if(color != white) {
					img.setRGB(x, y, black);
				}
			}
		}
	}
	
}
