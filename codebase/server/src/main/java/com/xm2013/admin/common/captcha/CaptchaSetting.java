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

import java.util.Random;

/**
 * 验证码参数设置
 */
public class CaptchaSetting {
	
	private int width;
	private int height;
	private int fontSize;
	private int bgType = 0;  //背景颜色类型 0,暗色，1-亮色
	private int charDuration; //字间的间隔
	private int lineNo;		//随机线条数量
	private int codeRotateMaxAngle = 45; //文字的最大旋转角度，文字会根据这个角度左右旋转，建议最大45度。
	private int codeMaxShareX = 20;   //文字最大倾斜角度，文字根据这个角度左右倾斜，建议最大20左右。
	private int polygonNo = 5;				//添加随机三角形和圆形的的数量，一般在5左右
	public CaptchaSetting() {}
	public int getWidth() {
		return width;
	}
	public CaptchaSetting setWidth(int width) {
		this.width = width;
		return this;
	}
	public int getHeight() {
		return height;
	}
	public CaptchaSetting setHeight(int height) {
		this.height = height;
		return this;
	}
	public int getFontSize() {
		return fontSize;
	}
	public CaptchaSetting setFontSize(int fontSize) {
		this.fontSize = fontSize;
		return this;
	}
	
	public int getBgType() {
		return bgType;
	}
	public CaptchaSetting setBgType(int bgType) {
		this.bgType = bgType;
		return this;
	}
	public int getCharDuration() {
		return charDuration;
	}
	public CaptchaSetting setCharDuration(int charDuration) {
		this.charDuration = charDuration;
		return this;
	}
	public int getLineNo() {
		return lineNo;
	}
	public CaptchaSetting setLineNo(int lineNo) {
		this.lineNo = lineNo;
		return this;
	}
	public int getCodeRotateMaxAngle() {
		return codeRotateMaxAngle;
	}
	public CaptchaSetting setCodeRotateMaxAngle(int codeRotateMaxAngle) {
		this.codeRotateMaxAngle = codeRotateMaxAngle;
		return this;
	}
	public int getCodeMaxShareX() {
		return codeMaxShareX;
	}
	public CaptchaSetting setCodeMaxShareX(int codeMaxShareX) {
		this.codeMaxShareX = codeMaxShareX;
		return this;
	}
	
	public int getPolygonNo() {
		return polygonNo;
	}
	public CaptchaSetting setPolygonNo(int polygonNo) {
		this.polygonNo = polygonNo;
		return this;
	}
	public static CaptchaSetting defaultSetting() {
		Random random = new Random();
		return new CaptchaSetting()
				.setHeight(60)
				.setFontSize(50)
				.setBgType(random.nextInt(2))
				.setLineNo(random.nextInt(6)+8)  // 8-14条线，减少干扰
				.setPolygonNo(random.nextInt(3)+2) // 2-5个形状，减少干扰
			;
		
	}
	@Override
	public String toString() {
		return "CaptchaSetting [width=" + width + ", height=" + height + ", fontSize=" + fontSize + ", bgType=" + bgType
				+ "]";
	}
}
