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

import "strings"

// MatchWildcardPermission 判断 `granted` 是否匹配 `required`（Shiro 风格通配语义）。
func MatchWildcardPermission(granted, required string) bool {
	granted = strings.TrimSpace(granted)
	required = strings.TrimSpace(required)
	if granted == "" || required == "" {
		return false
	}
	if granted == "*" {
		return true
	}
	if granted == required {
		return true
	}

	gParts := strings.Split(granted, ":")
	rParts := strings.Split(required, ":")

	max := len(rParts)
	if len(gParts) > max {
		max = len(gParts)
	}

	for i := 0; i < max; i++ {
		g := "*"
		if i < len(gParts) {
			g = strings.TrimSpace(gParts[i])
		}
		r := ""
		if i < len(rParts) {
			r = strings.TrimSpace(rParts[i])
		}
		if !segmentAllows(g, r) {
			return false
		}
	}

	return true
}

// segmentAllows 判断单段权限是否允许（支持 `*` 与逗号分隔多值）。
func segmentAllows(grantedSeg, requiredSeg string) bool {
	if grantedSeg == "" {
		grantedSeg = "*"
	}
	if grantedSeg == "*" {
		return true
	}
	if requiredSeg == "" {
		return true
	}

	for _, tok := range strings.Split(grantedSeg, ",") {
		tok = strings.TrimSpace(tok)
		if tok == "" {
			continue
		}
		if tok == "*" {
			return true
		}
		if strings.EqualFold(tok, requiredSeg) {
			return true
		}
	}

	return false
}
