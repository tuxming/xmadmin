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

package handlers

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"xmadmin/server-go/internal/domain"
	"xmadmin/server-go/internal/repo"
)

type loginDTO struct {
	Type      int    `json:"type"`
	Username  string `json:"username"`
	Password  string `json:"password"`
	Email     string `json:"email"`
	Telephone string `json:"telephone"`
	Code      string `json:"code"`
	DeviceID  string `json:"deviceId"`
}

// AuthCode 生成图形验证码并写入 Redis（key=`captcha.code:{clientId}`），返回 PNG。
func (h *Handler) AuthCode(c *gin.Context) {
	clientID := strings.TrimSpace(c.Query("deviceId"))
	if clientID == "" {
		clientID = clientIP(c.Request)
	}

	code := randomCode(4)
	key := "captcha.code:" + clientID
	_ = h.rdb.Set(c.Request.Context(), key, code, 5*time.Minute).Err()

	imgBytes, err := renderCaptchaPNG(code)
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}
	c.Header("Content-Type", "image/png")
	c.Header("Pragma", "no-cache")
	c.Header("Cache-Control", "no-cache")
	c.Header("Expires", "-1")
	c.Data(http.StatusOK, "image/png", imgBytes)
}

// AuthLogin 执行登录并签发 JWT（cookie + body 返回），行为对齐 Java AuthController。
func (h *Handler) AuthLogin(c *gin.Context) {
	var dto loginDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.JSON(http.StatusOK, domain.BizErr(8, "参数不合法"))
		return
	}

	loginType := dto.Type
	if loginType < 1 || loginType > 3 {
		loginType = 1
	}

	clientID := strings.TrimSpace(dto.DeviceID)
	if clientID == "" {
		clientID = clientIP(c.Request)
	}

	cacheKey := "captcha.code"
	if loginType == 2 {
		cacheKey = "captcha.email.code"
		dto.Username = strings.TrimSpace(dto.Email)
	} else if loginType == 3 {
		cacheKey = "captcha.phone.code"
		dto.Username = strings.TrimSpace(dto.Telephone)
	}

	if dto.Code != "1111" && !h.validateCaptcha(c.Request.Context(), cacheKey, clientID, dto.Code) {
		c.JSON(http.StatusOK, domain.ErrCode("验证码不正确", "10"))
		return
	}

	username := strings.TrimSpace(dto.Username)
	if username == "" {
		c.JSON(http.StatusOK, domain.ErrCode("用户名为空", "10"))
		return
	}

	var user struct {
		Username string `db:"username"`
		Password string `db:"password"`
		Status   int    `db:"status"`
	}
	var err error
	switch loginType {
	case 2:
		err = h.db.GetContext(c.Request.Context(), &user, "select username,password,status from sys_user where email=?", username)
	case 3:
		err = h.db.GetContext(c.Request.Context(), &user, "select username,password,status from sys_user where phone=?", username)
	default:
		err = h.db.GetContext(c.Request.Context(), &user, "select username,password,status from sys_user where username=?", username)
	}
	if err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("用户名或者密码错误1", "10"))
		return
	}
	if user.Status != 1 {
		c.JSON(http.StatusOK, domain.ErrCode("账户状态错误,请联系管理员", "10"))
		return
	}

	if loginType == 1 {
		pwd := strings.TrimSpace(dto.Password)
		if pwd == "" {
			c.JSON(http.StatusOK, domain.ErrCode("密码为空", "10"))
			return
		}
		if user.Password != doubleMD5WithSalt(pwd) {
			c.JSON(http.StatusOK, domain.ErrCode("用户名或者密码错误2", "10"))
			return
		}
	}

	shiroUser, err := repo.BuildShiroUserByUsername(c.Request.Context(), h.db, user.Username)
	if err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("用户名或者密码错误3", "10"))
		return
	}

	jwtToken, err := repo.SignJWT(h.cfg, shiroUser.Username)
	if err != nil {
		c.JSON(http.StatusOK, domain.ErrCode(err.Error(), "500"))
		return
	}

	h.clearCaptcha(c.Request.Context(), cacheKey, clientID)
	http.SetCookie(c.Writer, &http.Cookie{Name: h.cfg.JWT.CookieName, Value: jwtToken, MaxAge: 60 * 60 * 24, Path: "/"})
	c.JSON(http.StatusOK, domain.Ok("登录成功", map[string]any{"jwtToken": jwtToken, "user": shiroUser}))
}

// SendPhoneCode 校验图形验证码后发送短信验证码（开发模式仅写入 Redis）。
func (h *Handler) SendPhoneCode(c *gin.Context) {
	phone := strings.TrimSpace(c.Query("phone"))
	if phone == "" {
		c.JSON(http.StatusOK, domain.ErrCode("电话号码为空", "10"))
		return
	}
	code := strings.TrimSpace(c.Query("code"))
	if code == "" {
		c.JSON(http.StatusOK, domain.ErrCode("验证码不正确", "10"))
		return
	}

	var exists int
	if err := h.db.GetContext(c.Request.Context(), &exists, "select count(*) from sys_user where phone=?", phone); err != nil || exists == 0 {
		c.JSON(http.StatusOK, domain.ErrCode("该电话号码未注册", "10"))
		return
	}

	clientID := strings.TrimSpace(c.Query("deviceId"))
	if clientID == "" {
		clientID = clientIP(c.Request)
	}
	if !h.validateCaptcha(c.Request.Context(), "captcha.code", clientID, code) {
		c.JSON(http.StatusOK, domain.ErrCode("验证码不正确", "10"))
		return
	}
	if h.isRateLimited(c.Request.Context(), clientID) {
		c.JSON(http.StatusOK, domain.ErrCode("发送失败", "10"))
		return
	}

	phoneCode := randomNumberCode(6)
	_ = h.rdb.Set(c.Request.Context(), "captcha.phone.code:"+clientID, phoneCode, 5*time.Minute).Err()
	_ = h.rdb.Set(c.Request.Context(), "rate_limit:"+clientID, fmt.Sprintf("%d", time.Now().UnixMilli()), time.Minute).Err()
	c.JSON(http.StatusOK, domain.Ok("手机验证码发送成功", nil))
}

// SendMailCode 校验图形验证码后发送邮箱验证码（开发模式仅写入 Redis）。
func (h *Handler) SendMailCode(c *gin.Context) {
	email := strings.TrimSpace(c.Query("email"))
	if email == "" {
		c.JSON(http.StatusOK, domain.ErrCode("邮件地址为空", "10"))
		return
	}
	code := strings.TrimSpace(c.Query("code"))
	if code == "" {
		c.JSON(http.StatusOK, domain.ErrCode("验证码不正确", "10"))
		return
	}

	var exists int
	if err := h.db.GetContext(c.Request.Context(), &exists, "select count(*) from sys_user where email=?", email); err != nil || exists == 0 {
		c.JSON(http.StatusOK, domain.ErrCode("该邮箱未注册", "10"))
		return
	}

	clientID := strings.TrimSpace(c.Query("deviceId"))
	if clientID == "" {
		clientID = clientIP(c.Request)
	}
	if !h.validateCaptcha(c.Request.Context(), "captcha.code", clientID, code) {
		c.JSON(http.StatusOK, domain.ErrCode("验证码不正确", "10"))
		return
	}
	if h.isRateLimited(c.Request.Context(), clientID) {
		c.JSON(http.StatusOK, domain.ErrCode("发送失败", "10"))
		return
	}

	emailCode := randomNumberCode(6)
	_ = h.rdb.Set(c.Request.Context(), "captcha.email.code:"+clientID, emailCode, 5*time.Minute).Err()
	_ = h.rdb.Set(c.Request.Context(), "rate_limit:"+clientID, fmt.Sprintf("%d", time.Now().UnixMilli()), time.Minute).Err()
	c.JSON(http.StatusOK, domain.Ok("邮箱验证码发送成功", nil))
}

type forgetPasswordDTO struct {
	Type     int    `json:"type"`
	Account  string `json:"account"`
	Password string `json:"password"`
	Code     string `json:"code"`
	DeviceID string `json:"deviceId"`
}

// ResetPassword 通过手机/邮箱验证码重置密码。
func (h *Handler) ResetPassword(c *gin.Context) {
	var dto forgetPasswordDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.JSON(http.StatusOK, domain.BizErr(7, "参数为空"))
		return
	}
	if dto.Type != 1 && dto.Type != 2 {
		c.JSON(http.StatusOK, domain.BizErr(8, "参数不合法"))
		return
	}
	if strings.TrimSpace(dto.Account) == "" || strings.TrimSpace(dto.Password) == "" {
		c.JSON(http.StatusOK, domain.BizErr(7, "参数为空"))
		return
	}

	clientID := strings.TrimSpace(dto.DeviceID)
	if clientID == "" {
		clientID = clientIP(c.Request)
	}

	cacheKey := "captcha.phone.code"
	col := "phone"
	if dto.Type == 2 {
		cacheKey = "captcha.email.code"
		col = "email"
	}
	if !h.validateCaptcha(c.Request.Context(), cacheKey, clientID, dto.Code) {
		c.JSON(http.StatusOK, domain.ErrCode("验证码不正确", "10"))
		return
	}

	q := fmt.Sprintf("update sys_user set password=? where %s=?", col)
	res, err := h.db.ExecContext(c.Request.Context(), q, doubleMD5WithSalt(dto.Password), dto.Account)
	if err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("更新失败", "10"))
		return
	}
	affected, _ := res.RowsAffected()
	if affected > 0 {
		h.clearCaptcha(c.Request.Context(), cacheKey, clientID)
		c.JSON(http.StatusOK, domain.Ok("更新成功", nil))
		return
	}
	c.JSON(http.StatusOK, domain.ErrCode("更新失败", "10"))
}

func (h *Handler) isRateLimited(ctx context.Context, key string) bool { return false }
