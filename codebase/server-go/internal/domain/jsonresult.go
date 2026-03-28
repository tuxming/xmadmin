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
 */

package domain

import "strconv"

type JsonResult struct {
	Status bool        `json:"status"`
	Msg    string      `json:"msg,omitempty"`
	Format bool        `json:"format"`
	Args   []string    `json:"args"`
	Code   *string     `json:"code"`
	Data   interface{} `json:"data"`
}

// Ok 构造成功响应（对齐 Java，成功时 code 可以为 null）。
func Ok(msg string, data interface{}) JsonResult {
	r := JsonResult{Status: true, Msg: msg, Code: nil, Format: false}
	if data != nil {
		r.Data = data
	}
	return r
}

// OkCode 构造成功响应并指定 code。
func OkCode(msg, code string, data interface{}) JsonResult {
	r := JsonResult{Status: true, Msg: msg, Code: &code, Format: false}
	if data != nil {
		r.Data = data
	}
	return r
}

// Err 构造失败响应（默认 code=10）。
func Err(msg string) JsonResult {
	code := "10"
	return JsonResult{Status: false, Msg: msg, Code: &code, Format: false}
}

// ErrCode 构造失败响应并指定 code。
func ErrCode(msg, code string) JsonResult {
	return JsonResult{Status: false, Msg: msg, Code: &code, Format: false}
}

// BizErr 构造业务错误响应（code 为 Java BusinessErr 的数值字符串）。
func BizErr(code int, msg string) JsonResult {
	codeStr := strconv.Itoa(code)
	return JsonResult{Status: false, Msg: msg, Code: &codeStr, Format: false}
}
