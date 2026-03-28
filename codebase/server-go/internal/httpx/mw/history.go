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

package mw

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/hex"
	"net"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

// HistoryLogger 记录操作日志到 `sys_history`，触发条件与 Java 的 @Op 语义保持一致。
func HistoryLogger(db *sqlx.DB) gin.HandlerFunc {
	opMap := map[string]string{
		"GET /am/user/get":             "查看用户信息",
		"GET /am/user/userInfo":        "获取当前登录用户信息",
		"POST /am/user/list":           "用户列表",
		"POST /am/user/create":         "创建用户",
		"POST /am/user/update":         "更新用户",
		"POST /am/user/delete":         "删除用户",
		"POST /am/user/userDataAdd":    "添加用户数据权限",
		"POST /am/user/userDataDelete": "删除用户数据权限",
		"GET /am/user/userRoles":       "查看分配的角色",
		"POST /am/user/userRoleAdd":    "分配角色",
		"POST /am/user/userRoleDelete": "删除用户分配的角色",
		"GET /am/user/loginAs":        "登录此用户",

		"POST /am/dept/list":   "获取组织列表",
		"POST /am/dept/create": "创建组织",
		"POST /am/dept/update": "编辑组织",
		"POST /am/dept/delete": "删除组织",

		"POST /am/role/list":             "角色列表",
		"POST /am/role/create":           "添加角色",
		"POST /am/role/update":           "编辑角色",
		"POST /am/role/deletes":          "删除角色",
		"POST /am/role/grantPermissions": "分配权限",
		"POST /am/role/grantMenus":       "分配权限",

		"GET /am/permission/get":      "查看权限",
		"POST /am/permission/list":    "查看权限列表",
		"POST /am/permission/create":  "创建权限",
		"POST /am/permission/update":  "编辑权限",
		"POST /am/permission/deletes": "删除权限",
		"POST /am/permission/scan":    "扫描权限",
		"GET /am/permission/curr":     "当前登录用户的权限列表",

		"GET /am/menu/list":          "获取菜单列表",
		"POST /am/menu/saveOrUpdate": "新增更新菜单",
		"POST /am/menu/delete":       "获取菜单列表",

		"POST /am/history/list":    "查看日志列表",
		"POST /am/history/deletes": "删除日志",

		"POST /am/dict/saveOrUpdateGroup": "新增更新字典名",
		"POST /am/dict/deleteGroup":       "删除字典名",
		"POST /am/dict/addDict":           "添加字典",
		"POST /am/dict/updateDict":        "更新字典",
		"POST /am/dict/deleteDict":        "删除字典",

		"POST /am/lang/addLang":    "保存语言",
		"POST /am/lang/updateLang": "编辑语言",
		"POST /am/lang/deleteLang": "删除语言",
		"POST /am/lang/updateRes":  "编辑语言资源",
		"POST /am/lang/deleteRes":  "删除语言",

		"POST /am/document/list":    "文档列表",
		"POST /am/document/upload":  "上传文件",
		"POST /am/document/deletes": "删除文档",
	}

	passwordRe := regexp.MustCompile(`assword"\s*\:\s*"[\w\W]*?"`)

	return func(c *gin.Context) {
		fullPath := c.FullPath()
		if fullPath == "" {
			fullPath = c.Request.URL.Path
		}
		key := c.Request.Method + " " + fullPath
		opType, ok := opMap[key]
		if !ok {
			c.Next()
			return
		}

		remark := ""
		if qs := c.Request.URL.RawQuery; strings.TrimSpace(qs) != "" {
			remark += "param: " + qs + "\r\n"
		}

		contentType := c.GetHeader("Content-Type")
		if !strings.Contains(contentType, "multipart/form-data") {
			bodyBytes, _ := c.GetRawData()
			if len(bodyBytes) > 0 {
				bodyStr := string(bodyBytes)
				bodyStr = passwordRe.ReplaceAllString(bodyStr, `assword":"******"`)
				remark += "body:" + bodyStr
			}
			c.Request.Body = ioNopCloser{Buffer: bytes.NewBuffer(bodyBytes)}
		}

		chunks := splitByLen(remark, 1000)

		user := GetLoginUser(c)
		userID := 0
		username := ""
		if user != nil {
			userID = user.ID
			username = user.Fullname + "(" + user.Username + ")"
		}

		ip := clientIP(c.Request)
		historyID := randHex8()
		created := time.Now()

		ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
		defer cancel()
		_ = insertHistory(ctx, db, opType, ip, created, userID, username, historyID, chunks)

		c.Next()
	}
}

// insertHistory 将一次请求的日志分段写入 `sys_history`（1000 字符分段）。
func insertHistory(ctx context.Context, db *sqlx.DB, typ, ip string, created time.Time, userID int, username, historyID string, chunks []string) error {
	tx, err := db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback() }()

	for i, chunk := range chunks {
		_, err := tx.ExecContext(ctx, "insert into sys_history(user_id, username, ip_addr, type, created, remark, seq, history_id) values (?,?,?,?,?,?,?,?)", userID, username, ip, typ, created, chunk, i, historyID)
		if err != nil {
			return err
		}
	}
	return tx.Commit()
}

// splitByLen 按指定长度切分字符串，用于日志 remark 分段。
func splitByLen(s string, n int) []string {
	length := len(s)
	if length < n {
		return []string{s}
	}
	if n <= 0 {
		return []string{s}
	}
	times := int((float64(length) + float64(n) - 1) / float64(n))
	out := make([]string, 0, times)
	for i := 0; i < times; i++ {
		start := i * n
		end := (i + 1) * n
		if end > length {
			end = length
		}
		out = append(out, s[start:end])
	}
	return out
}

// randHex8 生成 8 位十六进制字符串，用作 historyId（与 Java UUID 截断语义一致）。
func randHex8() string {
	b := make([]byte, 4)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

// clientIP 获取请求客户端 IP（优先 X-Forwarded-For）。
func clientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		parts := strings.Split(xff, ",")
		return strings.TrimSpace(parts[0])
	}
	if xr := r.Header.Get("X-Real-IP"); xr != "" {
		return strings.TrimSpace(xr)
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err == nil {
		return host
	}
	return r.RemoteAddr
}

type ioNopCloser struct{ *bytes.Buffer }

// Close 满足 io.ReadCloser 接口（无实际动作）。
func (ioNopCloser) Close() error { return nil }
