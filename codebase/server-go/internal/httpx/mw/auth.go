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
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"io"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jmoiron/sqlx"

	"xmadmin/server-go/internal/config"
	"xmadmin/server-go/internal/domain"
	"xmadmin/server-go/internal/repo"
)

const ctxUserKey = "loginUser"

// Auth 处理登录校验：优先 JWT，其次无状态签名（appId/sign/timestamp）。
func Auth(cfg *config.Config, db *sqlx.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenStr := getValue(c, cfg.JWT.CookieName)
		if tokenStr != "" {
			secretBytes, err := repo.DecodeJWTSecret(cfg)
			if err != nil {
				c.JSON(http.StatusOK, domain.BizErr(2, "非法的TOKEN"))
				c.Abort()
				return
			}

			claims := jwt.MapClaims{}
			parsed, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
				if token.Method.Alg() != jwt.SigningMethodHS256.Alg() {
					return nil, errors.New("unexpected jwt alg")
				}
				return secretBytes, nil
			})
			if err != nil || parsed == nil || !parsed.Valid {
				c.JSON(http.StatusOK, domain.BizErr(2, "非法的TOKEN"))
				c.Abort()
				return
			}

			username, _ := claims["username"].(string)
			username = strings.TrimSpace(username)
			if username == "" {
				c.JSON(http.StatusOK, domain.BizErr(2, "非法的TOKEN"))
				c.Abort()
				return
			}

			loginUser, err := repo.BuildShiroUserByUsername(c.Request.Context(), db, username)
			if err != nil {
				c.JSON(http.StatusOK, domain.BizErr(2, "非法的TOKEN"))
				c.Abort()
				return
			}

			if cfg.JWT.RefreshMin > 0 {
				if exp, err := claims.GetExpirationTime(); err == nil && exp != nil {
					if time.Until(exp.Time) < time.Duration(cfg.JWT.RefreshMin)*time.Minute {
						newToken, err := repo.SignJWT(cfg, username)
						if err == nil {
							http.SetCookie(c.Writer, &http.Cookie{Name: cfg.JWT.CookieName, Value: newToken, Path: "/", MaxAge: cfg.JWT.ExpireHours * 3600})
						}
					}
				}
			}

			c.Set(ctxUserKey, loginUser)
			c.Next()
			return
		}

		appID := strings.TrimSpace(getValue(c, "appId"))
		if appID != "" {
			handleStatelessAuth(c, db, appID)
			if c.IsAborted() {
				return
			}
			c.Next()
			return
		}

		c.JSON(http.StatusOK, domain.BizErr(1, "用户未登录"))
		c.Abort()
	}
}

// handleStatelessAuth 校验无状态签名请求（appId/sign/timestamp），校验通过后写入登录用户上下文。
func handleStatelessAuth(c *gin.Context, db *sqlx.DB, appID string) {
	if err := c.Request.ParseForm(); err != nil {
		c.JSON(http.StatusOK, domain.BizErr(2, "非法的TOKEN"))
		c.Abort()
		return
	}

	tsStr := strings.TrimSpace(c.Request.Form.Get("timestamp"))
	if tsStr == "" {
		c.JSON(http.StatusOK, domain.BizErr(2, "时间戳为空"))
		c.Abort()
		return
	}
	ts, err := strconv.ParseInt(tsStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusOK, domain.BizErr(2, "时间戳为空"))
		c.Abort()
		return
	}
	if time.Now().Unix()-ts > 5*60 {
		c.JSON(http.StatusOK, domain.BizErr(2, ""))
		c.Abort()
		return
	}

	sign := strings.TrimSpace(c.Request.Form.Get("sign"))
	if sign == "" {
		sign = strings.TrimSpace(c.Query("sign"))
	}
	if strings.Contains(sign, "%") {
		if v, err := url.QueryUnescape(sign); err == nil {
			sign = v
		}
	}

	params, err := statelessParams(c)
	if err != nil {
		c.JSON(http.StatusOK, domain.BizErr(10, "参数decode失败"))
		c.Abort()
		return
	}

	var u struct {
		Token  string `db:"token"`
		Status int    `db:"status"`
	}
	if err := db.GetContext(c.Request.Context(), &u, "select token,status from sys_user where username=?", appID); err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("用户名或者密码错误", "500"))
		c.Abort()
		return
	}
	if u.Status != 1 {
		c.JSON(http.StatusOK, domain.ErrCode("账户状态错误,请联系管理员", "500"))
		c.Abort()
		return
	}
	if strings.TrimSpace(u.Token) == "" {
		c.JSON(http.StatusOK, domain.ErrCode("签名非法不一致", "500"))
		c.Abort()
		return
	}

	serverDigest := hmacSHA256ToBase64(params, u.Token)
	if !strings.EqualFold(serverDigest, sign) {
		c.JSON(http.StatusOK, domain.ErrCode("签名非法不一致", "500"))
		c.Abort()
		return
	}

	loginUser, err := repo.BuildShiroUserByUsername(c.Request.Context(), db, appID)
	if err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("用户名或者密码错误", "500"))
		c.Abort()
		return
	}

	c.Set(ctxUserKey, loginUser)
}

// statelessParams 生成无状态签名参与摘要的参数字符串（按 key 字典序拼接，并附加 JSON body 编码）。
func statelessParams(c *gin.Context) (string, error) {
	if err := c.Request.ParseForm(); err != nil {
		return "", err
	}

	keys := make([]string, 0, len(c.Request.Form))
	for k := range c.Request.Form {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	parts := make([]string, 0, len(keys))
	for _, k := range keys {
		if k == "sign" {
			continue
		}
		parts = append(parts, k+"="+c.Request.Form.Get(k))
	}

	param := strings.Join(parts, "&")
	ct := strings.ToLower(strings.TrimSpace(c.Request.Header.Get("Content-Type")))
	if strings.Contains(ct, "application/json") {
		bs, err := io.ReadAll(c.Request.Body)
		if err != nil {
			return "", err
		}
		c.Request.Body = io.NopCloser(bytes.NewReader(bs))
		if len(bs) > 0 {
			param += "&" + javaURLEncodeAndSpaceTo20(string(bs))
		}
	}

	return param, nil
}

// hmacSHA256ToBase64 计算 HMAC-SHA256 并返回 Base64 字符串。
func hmacSHA256ToBase64(msg, key string) string {
	h := hmac.New(sha256.New, []byte(key))
	_, _ = h.Write([]byte(msg))
	return base64.StdEncoding.EncodeToString(h.Sum(nil))
}

// javaURLEncodeAndSpaceTo20 按 Java URLEncoder 语义编码，并将空格统一为 %20。
func javaURLEncodeAndSpaceTo20(s string) string {
	bs := []byte(s)
	var b bytes.Buffer
	for _, c := range bs {
		if (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c == '-' || c == '_' || c == '.' || c == '*' {
			b.WriteByte(c)
			continue
		}
		if c == ' ' {
			b.WriteString("%20")
			continue
		}
		b.WriteByte('%')
		b.WriteByte("0123456789ABCDEF"[c>>4])
		b.WriteByte("0123456789ABCDEF"[c&15])
	}
	return b.String()
}

// RequirePerm 校验当前登录用户是否拥有指定权限表达式。
func RequirePerm(perm string) gin.HandlerFunc {
	return func(c *gin.Context) {
		u, ok := c.Get(ctxUserKey)
		if !ok {
			c.JSON(http.StatusOK, domain.BizErr(1, "用户未登录"))
			c.Abort()
			return
		}
		user := u.(*domain.ShiroUser)
		if user.HasPerm(perm) {
			c.Next()
			return
		}
		c.JSON(http.StatusOK, domain.BizErr(4, "没有权限"))
		c.Abort()
	}
}

// RequireAnyPerm 校验当前登录用户是否拥有任一权限表达式。
func RequireAnyPerm(perms ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		u, ok := c.Get(ctxUserKey)
		if !ok {
			c.JSON(http.StatusOK, domain.BizErr(1, "用户未登录"))
			c.Abort()
			return
		}
		user := u.(*domain.ShiroUser)
		for _, p := range perms {
			if user.HasPerm(p) {
				c.Next()
				return
			}
		}
		c.JSON(http.StatusOK, domain.BizErr(4, "没有权限"))
		c.Abort()
	}
}

// GetLoginUser 从请求上下文获取登录用户（若未登录则返回 nil）。
func GetLoginUser(c *gin.Context) *domain.ShiroUser {
	u, ok := c.Get(ctxUserKey)
	if !ok {
		return nil
	}
	user, _ := u.(*domain.ShiroUser)
	return user
}

// getValue 按 Query -> Header -> Cookie 的顺序读取指定 key 的值。
func getValue(c *gin.Context, key string) string {
	v := strings.TrimSpace(c.Query(key))
	if v != "" {
		return v
	}
	v = strings.TrimSpace(c.GetHeader(key))
	if v != "" {
		return v
	}
	if cookie, err := c.Request.Cookie(key); err == nil {
		v = strings.TrimSpace(cookie.Value)
		if v != "" {
			return v
		}
	}
	return ""
}
