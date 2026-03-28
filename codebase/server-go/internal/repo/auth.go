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

package repo

import (
	"encoding/base64"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"

	"xmadmin/server-go/internal/config"
)

// DecodeJWTSecret 解码 Java 风格的 JWT secret（兼容 base64/非 base64）。
func DecodeJWTSecret(cfg *config.Config) ([]byte, error) {
	s := strings.TrimSpace(cfg.JWT.SecretBase64)
	if s == "" {
		return nil, nil
	}
	if b, err := base64.StdEncoding.DecodeString(s); err == nil {
		return b, nil
	}
	if b, err := base64.RawStdEncoding.DecodeString(s); err == nil {
		return b, nil
	}
	if b, err := base64.StdEncoding.DecodeString(padBase64(s)); err == nil {
		return b, nil
	}
	if b, err := base64.RawStdEncoding.DecodeString(strings.TrimRight(s, "=")); err == nil {
		return b, nil
	}
	return []byte(s), nil
}

// padBase64 补齐 base64 padding，使其可被标准 base64 解码器解析。
func padBase64(s string) string {
	mod := len(s) % 4
	if mod == 0 {
		return s
	}
	return s + strings.Repeat("=", 4-mod)
}

// SignJWT 为指定用户名签发 JWT。
func SignJWT(cfg *config.Config, username string) (string, error) {
	secretBytes, err := DecodeJWTSecret(cfg)
	if err != nil {
		return "", err
	}

	now := time.Now()
	claims := jwt.MapClaims{
		"username": username,
		"jti":      username,
		"iat":      now.Unix(),
		"exp":      now.Add(time.Duration(cfg.JWT.ExpireHours) * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(secretBytes)
}
