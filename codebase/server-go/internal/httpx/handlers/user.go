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
	"encoding/base64"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"

	"xmadmin/server-go/internal/domain"
	"xmadmin/server-go/internal/httpx/mw"
	"xmadmin/server-go/internal/repo"
)

// UserGet 获取单个用户详情。
func (h *Handler) UserGet(c *gin.Context) {
	id, _ := strconv.Atoi(c.Query("id"))
	if id <= 0 {
		c.JSON(http.StatusOK, domain.BizErr(8, "参数不合法"))
		return
	}

	user := mw.GetLoginUser(c)
	where := "t.id=?"
	if user != nil && !user.IsAdmin() {
		where = authCondition("t", user) + " and t.id=?"
	}

	q := "select t.id, t.code, DATE_FORMAT(t.created, '%Y-%m-%d %H:%i:%s') as created, t.gender, t.username, t.fullname, t.status, t.email, t.phone, t.token, t.photo, t.dept_id as deptId, t2.name as deptName, t2.path as deptPath, t2.path_name as deptPathName from sys_user as t left join sys_dept as t2 on t2.id=t.dept_id where " + where
	list, err := selectMapList(c.Request.Context(), h.db, q, id)
	if err != nil || len(list) == 0 {
		c.JSON(http.StatusOK, domain.BizErr(9, "数据不存在"))
		return
	}
	c.JSON(http.StatusOK, domain.Ok("获取成功", list[0]))
}

// UserInfo 返回当前登录用户信息（ShiroUser）。
func (h *Handler) UserInfo(c *gin.Context) {
	user := mw.GetLoginUser(c)
	if user == nil {
		c.JSON(http.StatusOK, domain.Err("未登录或登录已过期"))
		return
	}
	c.JSON(http.StatusOK, domain.Ok("获取成功", user))
}

type userListQuery struct {
	Start      int    `json:"start"`
	Length     int    `json:"length"`
	BasicValue string `json:"basicValue"`
	Username   string `json:"username"`
	UserID     any    `json:"userId"`
	Fullname   string `json:"fullname"`
	RoleIDs    []int  `json:"roleIds"`
	DeptID     *int   `json:"deptId"`
	Email      string `json:"email"`
	Phone      string `json:"phone"`
	Status     []int  `json:"status"`
	StartDate  string `json:"startDate"`
	EndDate    string `json:"endDate"`
}

// UserSearch 按关键字搜索用户（最多 20 条）。
func (h *Handler) UserSearch(c *gin.Context) {
	key := strings.TrimSpace(c.Query("k"))
	user := mw.GetLoginUser(c)
	where := authCondition("t", user)
	args := []any{}
	if key != "" {
		where += " and (t.username like ? or t.fullname like ?)"
		args = append(args, "%"+key+"%", "%"+key+"%")
	}
	q := "select t.id, t.username, t.fullname from sys_user as t where " + where + " order by t.id desc limit 20"
	rows := []struct {
		ID       int    `db:"id"`
		Username string `db:"username"`
		Fullname string `db:"fullname"`
	}{}
	_ = h.db.SelectContext(c.Request.Context(), &rows, q, args...)
	out := map[string]string{}
	for _, r := range rows {
		out[fmt.Sprintf("%d", r.ID)] = r.Fullname + "(" + r.Username + ")"
	}
	c.JSON(http.StatusOK, domain.Ok("获取成功", out))
}

// UserList 分页查询用户列表。
func (h *Handler) UserList(c *gin.Context) {
	var q userListQuery
	if err := c.ShouldBindJSON(&q); err != nil {
		fmt.Println("UserList bind error:", err)
		c.JSON(http.StatusOK, domain.BizErr(8, "参数不合法"))
		return
	}
	if q.Length <= 0 {
		q.Length = 20
	}
	loginUser := mw.GetLoginUser(c)
	where, args := buildUserListWhere(loginUser, &q)
	dataSQL := "select t.id, t.username, t.fullname, DATE_FORMAT(t.created, '%Y-%m-%d %H:%i:%s') as created, t.parent_id as parentId, t.code, t.gender, t.email, t.phone, t.photo, t.dept_id as deptId, t.status, t2.name as deptName, t2.path as deptPath, t2.path_name as deptPathName from sys_user as t left join sys_user_role as t1 on t1.user_id=t.id left join sys_dept as t2 on t2.id=t.dept_id where " + where + " group by t.id order by t.id desc limit ? offset ?"
	args2 := append(args, q.Length, q.Start)
	var list []map[string]any
	var err error
	list, err = selectMapList(c.Request.Context(), h.db, dataSQL, args2...)
	if err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("获取失败", "500"))
		return
	}
	page := domain.PageInfo[map[string]any]{List: list}
	if q.Start == 0 {
		countSQL := "select count(distinct t.id) from sys_user as t left join sys_user_role as t1 on t1.user_id=t.id left join sys_dept as t2 on t2.id=t.dept_id where " + where
		var total int
		_ = h.db.GetContext(c.Request.Context(), &total, countSQL, args...)
		page.Total = total
	}
	c.JSON(http.StatusOK, domain.Ok("获取成功", page))
}

// buildUserListWhere 构造用户列表查询 where 条件与参数。
func buildUserListWhere(loginUser *domain.ShiroUser, q *userListQuery) (string, []any) {
	where := authCondition("t", loginUser)
	args := []any{}
	if q.BasicValue != "" {
		where += " and (t.username like ? or t.fullname like ?)"
		v := strings.TrimSpace(q.BasicValue)
		args = append(args, v+"%", v+"%")
		return where, args
	}
	if q.Username != "" {
		where += " and t.username like ?"
		args = append(args, q.Username+"%")
	}
	if q.UserID != nil {
		uidStr := fmt.Sprintf("%v", q.UserID)
		if uidStr != "" && uidStr != "0" {
			where += " and t.id=?"
			args = append(args, uidStr)
		}
	}
	if q.Fullname != "" {
		where += " and t.fullname like ?"
		args = append(args, q.Fullname+"%")
	}
	if q.Email != "" {
		where += " and t.email like ?"
		args = append(args, q.Email+"%")
	}
	if q.Phone != "" {
		where += " and t.phone like ?"
		args = append(args, q.Phone+"%")
	}
	if q.DeptID != nil && *q.DeptID > 0 {
		where += " and t.dept_id=?"
		args = append(args, *q.DeptID)
	}
	if len(q.Status) > 0 {
		in, a := inInts("t.status", q.Status)
		where += " and " + in
		args = append(args, a...)
	}
	if len(q.RoleIDs) > 0 {
		in, a := inInts("t1.role_id", q.RoleIDs)
		where += " and " + in
		args = append(args, a...)
	}
	if q.StartDate != "" {
		where += " and t.created >= ?"
		args = append(args, q.StartDate+" 00:00:00")
	}
	if q.EndDate != "" {
		where += " and t.created <= ?"
		args = append(args, q.EndDate+" 23:59:59")
	}
	return where, args
}

type userAddDTO struct {
	Username   string `json:"username"`
	Fullname   string `json:"fullname"`
	Password   string `json:"password"`
	Repassword string `json:"repassword"`
	DeptID     int    `json:"deptId"`
	Email      string `json:"email"`
	Phone      string `json:"phone"`
	RoleIDs    []int  `json:"roleIds"`
	Gender     *int   `json:"gender"`
	Photo      *int   `json:"photo"`
}

// UserCreate 创建用户并分配角色。
func (h *Handler) UserCreate(c *gin.Context) {
	loginUser := mw.GetLoginUser(c)
	var dto userAddDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("参数不合法", "10"))
		return
	}
	if dto.Username == "" || dto.Fullname == "" || dto.DeptID == 0 {
		c.JSON(http.StatusOK, domain.ErrCode("参数不合法", "10"))
		return
	}
	if dto.Password == "" || dto.Password != dto.Repassword {
		c.JSON(http.StatusOK, domain.ErrCode("两次密码输入不一致", "10"))
		return
	}
	if len(dto.RoleIDs) == 0 {
		c.JSON(http.StatusOK, domain.ErrCode("没有选择角色", "10"))
		return
	}
	if dto.Email != "" && !emailRe.MatchString(dto.Email) {
		c.JSON(http.StatusOK, domain.ErrCode("邮箱地址不合法", "10"))
		return
	}
	if dto.Phone != "" && !phoneRe.MatchString(dto.Phone) {
		c.JSON(http.StatusOK, domain.ErrCode("电话号码不合法", "10"))
		return
	}

	var dept struct {
		ID   int    `db:"id"`
		Path string `db:"path"`
	}
	if err := h.db.GetContext(c.Request.Context(), &dept, "select id, path from sys_dept where id=?", dto.DeptID); err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("组织不存在", "10"))
		return
	}
	if loginUser != nil && !loginUser.IsAdmin() && !canAccessDeptPath(loginUser, dept.Path, dept.ID) {
		c.JSON(http.StatusOK, domain.ErrCode("无组织权限", "10"))
		return
	}

	gender := 2
	if dto.Gender != nil && *dto.Gender >= 0 && *dto.Gender <= 2 {
		gender = *dto.Gender
	}
	photo := 0
	if dto.Photo != nil {
		photo = *dto.Photo
	}

	ctx := c.Request.Context()
	err := withTx(ctx, h.db, func(tx *sqlx.Tx) error {
		uid := uuid.New().String()
		token := base64.StdEncoding.EncodeToString([]byte(uid))
		res, err := tx.ExecContext(ctx, "insert into sys_user(username, fullname, password, token, created, parent_id, code, gender, email, phone, photo, dept_id, status) values (?,?,?,?,?,?,?,?,?,?,?,?,?)", dto.Username, dto.Fullname, doubleMD5WithSalt(dto.Password), token, time.Now(), loginUser.ID, "", gender, dto.Email, dto.Phone, photo, dto.DeptID, 1)
		if err != nil {
			return err
		}
		newID, _ := res.LastInsertId()
		_, _ = tx.ExecContext(ctx, "update sys_user set code=? where id=?", fmt.Sprintf("%08d", newID), newID)
		for _, rid := range dto.RoleIDs {
			_, _ = tx.ExecContext(ctx, "insert ignore into sys_user_role(role_id, user_id) values (?,?)", rid, newID)
		}
		_, _ = tx.ExecContext(ctx, "insert into sys_user_data(user_id, ref_id, type) values (?,?,1)", newID, newID)
		return nil
	})
	if err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("创建失败", "10"))
		return
	}
	c.JSON(http.StatusOK, domain.Ok("创建成功", nil))
}

type userUpdateDTO struct {
	ID           int     `json:"id"`
	Fullname     *string `json:"fullname"`
	Password     *string `json:"password"`
	NewPassword  *string `json:"newPassword"`
	RePassword   *string `json:"rePassword"`
	RefreshToken bool    `json:"refreshToken"`
	Status       *int    `json:"status"`
	Gender       *int    `json:"gender"`
	Email        *string `json:"email"`
	Phone        *string `json:"phone"`
	Photo        *int    `json:"photo"`
	DeptID       *int    `json:"deptId"`
}

// Helper: Clear user cache from Redis (matches Java UserService.removeUserCache)
func (h *Handler) removeUserCache(ctx context.Context, id int, username, phone, email string) {
	if h.rdb == nil {
		return
	}
	pipe := h.rdb.Pipeline()
	if id > 0 {
		pipe.HDel(ctx, "user.id", strconv.Itoa(id))
	}
	if username != "" {
		pipe.HDel(ctx, "user.name", username)
		pipe.HDel(ctx, "shiro_redis_cache", username) // If we mimic Shiro auth cache clear
	}
	if phone != "" {
		pipe.HDel(ctx, "user.phone", phone)
	}
	if email != "" {
		pipe.HDel(ctx, "user.mail", email)
	}
	_, _ = pipe.Exec(ctx)
}

// UserUpdate 更新用户信息与角色。
func (h *Handler) UserUpdate(c *gin.Context) {
	loginUser := mw.GetLoginUser(c)
	var dto userUpdateDTO
	if err := c.ShouldBindJSON(&dto); err != nil || dto.ID <= 0 {
		c.JSON(http.StatusOK, domain.BizErr(7, "参数为空"))
		return
	}
	q := "select t.id, t.fullname, t.password, t.status, t.gender, t.email, t.phone, t.photo, t.dept_id, t2.path as deptPath from sys_user as t left join sys_dept as t2 on t2.id=t.dept_id where t.id=?"
	list, err := selectMapList(c.Request.Context(), h.db, q, dto.ID)
	if err != nil || len(list) == 0 {
		c.JSON(http.StatusOK, domain.BizErr(9, "数据不存在"))
		return
	}
	dbUserMap := list[0]

	// Helper to safely get int from map
	getInt := func(v any) int {
		switch val := v.(type) {
		case int:
			return val
		case int64:
			return int(val)
		case float64:
			return int(val)
		default:
			return 0
		}
	}
	// Helper to safely get string from map
	getString := func(v any) string {
		if val, ok := v.(string); ok {
			return val
		}
		if val, ok := v.([]byte); ok {
			return string(val)
		}
		return ""
	}

	dbUser := struct {
		ID       int
		Fullname string
		Password string
		Status   int
		Gender   int
		Email    string
		Phone    string
		Photo    int
		DeptID   int
		DeptPath string
	}{
		ID:       getInt(dbUserMap["id"]),
		Fullname: getString(dbUserMap["fullname"]),
		Password: getString(dbUserMap["password"]),
		Status:   getInt(dbUserMap["status"]),
		Gender:   getInt(dbUserMap["gender"]),
		Email:    getString(dbUserMap["email"]),
		Phone:    getString(dbUserMap["phone"]),
		Photo:    getInt(dbUserMap["photo"]),
		DeptID:   getInt(dbUserMap["dept_id"]),
		DeptPath: getString(dbUserMap["deptPath"]),
	}

	if loginUser != nil && !loginUser.IsAdmin() {
		if !canAccessUser(loginUser, dto.ID, dbUser.DeptID, dbUser.DeptPath) {
			c.JSON(http.StatusOK, domain.ErrCode("没有数据权限", "10"))
			return
		}
	}

	sets := []string{}
	args := []any{}
	if dto.Fullname != nil && *dto.Fullname != "" && *dto.Fullname != dbUser.Fullname {
		sets = append(sets, "fullname=?")
		args = append(args, *dto.Fullname)
	}
	if dto.Password != nil && dto.NewPassword != nil {
		if loginUser == nil || !loginUser.IsAdmin() {
			if doubleMD5WithSalt(*dto.Password) != dbUser.Password {
				c.JSON(http.StatusOK, domain.Err("密码错误"))
				return
			}
		}
		if dto.RePassword == nil || *dto.NewPassword != *dto.RePassword {
			c.JSON(http.StatusOK, domain.Err("两次密码输入不一致"))
			return
		}
		sets = append(sets, "password=?")
		args = append(args, doubleMD5WithSalt(*dto.NewPassword))
	}
	resultData := any(nil)
	if dto.RefreshToken {
		uid := uuid.New().String()
		token := base64.StdEncoding.EncodeToString([]byte(uid))
		sets = append(sets, "token=?")
		args = append(args, token)
		resultData = token
	}
	if dto.Status != nil && *dto.Status != dbUser.Status {
		if *dto.Status < 0 || *dto.Status > 2 {
			c.JSON(http.StatusOK, domain.Err("非法的状态"))
			return
		}
		sets = append(sets, "status=?")
		args = append(args, *dto.Status)
	}
	if dto.Gender != nil && *dto.Gender != dbUser.Gender {
		if *dto.Gender < 0 || *dto.Gender > 2 {
			c.JSON(http.StatusOK, domain.Err("非法的性别选项"))
			return
		}
		sets = append(sets, "gender=?")
		args = append(args, *dto.Gender)
	}
	if dto.Email != nil && *dto.Email != dbUser.Email {
		if *dto.Email != "" && !emailRe.MatchString(*dto.Email) {
			c.JSON(http.StatusOK, domain.Err("邮箱地址不合法"))
			return
		}
		sets = append(sets, "email=?")
		args = append(args, *dto.Email)
	}
	if dto.Phone != nil && *dto.Phone != dbUser.Phone {
		if *dto.Phone != "" && !phoneRe.MatchString(*dto.Phone) {
			c.JSON(http.StatusOK, domain.Err("非法的电话号码"))
			return
		}
		sets = append(sets, "phone=?")
		args = append(args, *dto.Phone)
	}
	if dto.Photo != nil && *dto.Photo != dbUser.Photo {
		sets = append(sets, "photo=?")
		args = append(args, *dto.Photo)
	}
	if dto.DeptID != nil && *dto.DeptID != dbUser.DeptID {
		var dept struct {
			ID   int    `db:"id"`
			Path string `db:"path"`
		}
		if err := h.db.GetContext(c.Request.Context(), &dept, "select id,path from sys_dept where id=?", *dto.DeptID); err != nil {
			c.JSON(http.StatusOK, domain.Err("无组织权限"))
			return
		}
		if loginUser != nil && !loginUser.IsAdmin() && !canAccessDeptPath(loginUser, dept.Path, dept.ID) {
			c.JSON(http.StatusOK, domain.Err("无组织权限"))
			return
		}
		sets = append(sets, "dept_id=?")
		args = append(args, *dto.DeptID)
	}
	if len(sets) == 0 {
		c.JSON(http.StatusOK, domain.Err("没有要更新的数据"))
		return
	}
	updateSQL := "update sys_user set " + strings.Join(sets, ",") + " where id=?"
	args = append(args, dto.ID)
	if _, err := h.db.ExecContext(c.Request.Context(), updateSQL, args...); err != nil {
		c.JSON(http.StatusOK, domain.Err("更新失败"))
		return
	}

	h.removeUserCache(c.Request.Context(), dbUser.ID, getString(dbUserMap["username"]), dbUser.Phone, dbUser.Email)

	c.JSON(http.StatusOK, domain.Ok("更新成功", resultData))
}

// UserDelete 删除用户。
func (h *Handler) UserDelete(c *gin.Context) {
	id, _ := strconv.Atoi(c.Query("id"))
	if id <= 0 {
		c.JSON(http.StatusOK, domain.BizErr(8, "参数不合法"))
		return
	}
	if id < 5 {
		c.JSON(http.StatusOK, domain.ErrCode("删除失败", "10"))
		return
	}
	loginUser := mw.GetLoginUser(c)
	var dbUser struct {
		DeptID   int    `db:"dept_id"`
		DeptPath string `db:"deptPath"`
	}
	q := "select t.dept_id, t2.path as deptPath from sys_user as t left join sys_dept as t2 on t2.id=t.dept_id where t.id=?"
	if err := h.db.GetContext(c.Request.Context(), &dbUser, q, id); err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("删除失败", "10"))
		return
	}
	if loginUser != nil && !loginUser.IsAdmin() && !canAccessUser(loginUser, id, dbUser.DeptID, dbUser.DeptPath) {
		c.JSON(http.StatusOK, domain.ErrCode("删除失败", "10"))
		return
	}
	_, _ = h.db.ExecContext(c.Request.Context(), "update sys_user set status=3 where id=?", id)

	h.removeUserCache(c.Request.Context(), id, "", "", "")

	c.JSON(http.StatusOK, domain.Ok("删除成功", nil))
}

// UserForceDelete 彻底删除用户。
func (h *Handler) UserForceDelete(c *gin.Context) {
	id, _ := strconv.Atoi(c.Query("id"))
	if id <= 0 {
		c.JSON(http.StatusOK, domain.BizErr(8, "参数不合法"))
		return
	}
	if id < 5 {
		c.JSON(http.StatusOK, domain.ErrCode("删除失败", "10"))
		return
	}
	loginUser := mw.GetLoginUser(c)
	var dbUser struct {
		DeptID   int    `db:"dept_id"`
		DeptPath string `db:"deptPath"`
	}
	q := "select t.dept_id, t2.path as deptPath from sys_user as t left join sys_dept as t2 on t2.id=t.dept_id where t.id=?"
	if err := h.db.GetContext(c.Request.Context(), &dbUser, q, id); err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("删除失败", "10"))
		return
	}
	if loginUser != nil && !loginUser.IsAdmin() && !canAccessUser(loginUser, id, dbUser.DeptID, dbUser.DeptPath) {
		c.JSON(http.StatusOK, domain.ErrCode("删除失败", "10"))
		return
	}

	ctx := c.Request.Context()
	err := withTx(ctx, h.db, func(tx *sqlx.Tx) error {
		_, err := tx.ExecContext(ctx, "delete from sys_user_role where user_id=?", id)
		if err != nil {
			return err
		}
		_, err = tx.ExecContext(ctx, "delete from sys_user_data where user_id=?", id)
		if err != nil {
			return err
		}
		_, err = tx.ExecContext(ctx, "delete from sys_user where id=?", id)
		return err
	})

	if err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("删除失败", "10"))
		return
	}

	h.removeUserCache(c.Request.Context(), id, "", "", "")
	c.JSON(http.StatusOK, domain.Ok("删除成功", nil))
}

// UserDataPermissions 查询用户数据权限（用户/组织）。
func (h *Handler) UserDataPermissions(c *gin.Context) {
	typeVal, _ := strconv.Atoi(c.Query("type"))
	userID, _ := strconv.Atoi(c.Query("id"))
	if userID <= 0 {
		c.JSON(http.StatusOK, domain.BizErr(8, "参数不合法"))
		return
	}
	loginUser := mw.GetLoginUser(c)
	var target struct {
		DeptID   int    `db:"dept_id"`
		DeptPath string `db:"deptPath"`
	}
	q := "select t.dept_id, t2.path as deptPath from sys_user as t left join sys_dept as t2 on t2.id=t.dept_id where t.id=?"
	if err := h.db.GetContext(c.Request.Context(), &target, q, userID); err != nil {
		c.JSON(http.StatusOK, domain.BizErr(9, "数据不存在"))
		return
	}
	if loginUser != nil && !loginUser.IsAdmin() && !canAccessUser(loginUser, userID, target.DeptID, target.DeptPath) {
		c.JSON(http.StatusOK, domain.Ok("获取成功", domain.PageInfo[any]{Total: 0, List: nil}))
		return
	}
	if typeVal == 1 {
		q := "select t.id as userId, t.photo, t.username, t.fullname, t1.id as id from sys_user as t left join sys_user_data as t1 on t1.ref_id=t.id where t1.user_id=? and t1.type=1"
		rows, err := selectMapList(c.Request.Context(), h.db, q, userID)
		if err != nil || rows == nil {
			rows = []map[string]any{}
		}
		c.JSON(http.StatusOK, domain.Ok("获取成功", domain.PageInfo[map[string]any]{Total: len(rows), List: rows}))
		return
	}
	if typeVal == 2 {
		q := "select t.id as deptId, t.name, t.path, t.path_name as pathName, t1.id as id from sys_dept as t left join sys_user_data as t1 on t1.ref_id=t.id where t1.user_id=? and t1.type=2"
		rows, err := selectMapList(c.Request.Context(), h.db, q, userID)
		if err != nil || rows == nil {
			rows = []map[string]any{}
		}
		c.JSON(http.StatusOK, domain.Ok("获取成功", domain.PageInfo[map[string]any]{Total: len(rows), List: rows}))
		return
	}
	rows, err := selectMapList(c.Request.Context(), h.db, "select * from sys_user_data where user_id=?", userID)
	if err != nil || rows == nil {
		rows = []map[string]any{}
	}
	c.JSON(http.StatusOK, domain.Ok("获取成功", domain.PageInfo[map[string]any]{Total: len(rows), List: rows}))
}

type userDataDTO struct {
	ID     int `json:"id"`
	UserID int `json:"userId"`
	RefID  int `json:"refId"`
	Type   int `json:"type"`
}

// UserDataAdd 添加用户数据权限。
func (h *Handler) UserDataAdd(c *gin.Context) {
	var dto userDataDTO
	if err := c.ShouldBindJSON(&dto); err != nil || dto.UserID == 0 || dto.RefID == 0 || (dto.Type != 1 && dto.Type != 2) {
		c.JSON(http.StatusOK, domain.ErrCode("参数不合法", "10"))
		return
	}
	loginUser := mw.GetLoginUser(c)
	var target struct {
		DeptID   int    `db:"dept_id"`
		DeptPath string `db:"deptPath"`
	}
	q := "select t.dept_id, t2.path as deptPath from sys_user as t left join sys_dept as t2 on t2.id=t.dept_id where t.id=?"
	if err := h.db.GetContext(c.Request.Context(), &target, q, dto.UserID); err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("创建失败", "10"))
		return
	}
	if loginUser != nil && !loginUser.IsAdmin() && !canAccessUser(loginUser, dto.UserID, target.DeptID, target.DeptPath) {
		c.JSON(http.StatusOK, domain.BizErr(5, "没有数据权限"))
		return
	}

	// 校验要添加的目标是否存在，并且是否有权限分配
	if dto.Type == 1 {
		var refUser struct {
			ID       int    `db:"id"`
			DeptID   int    `db:"dept_id"`
			DeptPath string `db:"deptPath"`
		}
		if err := h.db.GetContext(c.Request.Context(), &refUser, q, dto.RefID); err != nil {
			c.JSON(http.StatusOK, domain.ErrCode("目标用户不存在", "10"))
			return
		}
		if loginUser != nil && !loginUser.IsAdmin() && !canAccessUser(loginUser, refUser.ID, refUser.DeptID, refUser.DeptPath) {
			c.JSON(http.StatusOK, domain.BizErr(5, "您没有权限分配该用户的数据"))
			return
		}
	} else if dto.Type == 2 {
		var refDept struct {
			ID   int    `db:"id"`
			Path string `db:"path"`
		}
		if err := h.db.GetContext(c.Request.Context(), &refDept, "select id, path from sys_dept where id=?", dto.RefID); err != nil {
			c.JSON(http.StatusOK, domain.ErrCode("目标组织不存在", "10"))
			return
		}
		if loginUser != nil && !loginUser.IsAdmin() && !canAccessDeptPath(loginUser, refDept.Path, refDept.ID) {
			c.JSON(http.StatusOK, domain.BizErr(5, "您没有权限分配该组织的数据"))
			return
		}

		// 检查是否已经在已有组织的子节点中
		type existingDept struct {
			RefID int    `db:"ref_id"`
			Path  string `db:"path"`
		}
		var existingDepts []existingDept
		_ = h.db.SelectContext(c.Request.Context(), &existingDepts, "select t.ref_id, t1.path from sys_user_data t left join sys_dept t1 on t.ref_id = t1.id where t.user_id=? and t.type=2", dto.UserID)
		for _, ud := range existingDepts {
			if ud.RefID == dto.RefID {
				continue
			}
			if ud.Path != "" && strings.HasPrefix(refDept.Path, ud.Path) {
				c.JSON(http.StatusOK, domain.ErrCode("该组织已在已有组织数据权限的子节点中，无需重复添加", "10"))
				return
			}
		}
	}

	// 检查是否已经存在相同的数据权限，避免重复添加
	var existCount int
	if err := h.db.GetContext(c.Request.Context(), &existCount, "select count(*) from sys_user_data where user_id=? and type=? and ref_id=?", dto.UserID, dto.Type, dto.RefID); err == nil && existCount > 0 {
		c.JSON(http.StatusOK, domain.ErrCode("该数据权限已存在，请勿重复添加", "10"))
		return
	}

	res, err := h.db.ExecContext(c.Request.Context(), "insert into sys_user_data(user_id, ref_id, type) values (?,?,?)", dto.UserID, dto.RefID, dto.Type)
	if err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("创建失败", "10"))
		return
	}
	newID, _ := res.LastInsertId()
	c.JSON(http.StatusOK, domain.Ok("创建成功", newID))
}

// UserDataDelete 删除用户数据权限。
func (h *Handler) UserDataDelete(c *gin.Context) {
	id, _ := strconv.Atoi(c.Query("id"))
	if id <= 0 {
		c.JSON(http.StatusOK, domain.BizErr(8, "参数不合法"))
		return
	}
	loginUser := mw.GetLoginUser(c)
	var ud struct {
		ID     int `db:"id"`
		UserID int `db:"user_id"`
		RefID  int `db:"ref_id"`
		Type   int `db:"type"`
	}
	if err := h.db.GetContext(c.Request.Context(), &ud, "select * from sys_user_data where id=?", id); err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("删除失败", "10"))
		return
	}
	if loginUser != nil && ud.RefID == loginUser.ID && ud.UserID == loginUser.ID && ud.Type == 1 {
		c.JSON(http.StatusOK, domain.ErrCode("不能删除本身的数据权限", "10"))
		return
	}
	if loginUser != nil && !loginUser.IsAdmin() {
		var target struct {
			DeptID   int    `db:"dept_id"`
			DeptPath string `db:"deptPath"`
		}
		q0 := "select t.dept_id, t2.path as deptPath from sys_user as t left join sys_dept as t2 on t2.id=t.dept_id where t.id=?"
		if err := h.db.GetContext(c.Request.Context(), &target, q0, ud.UserID); err == nil {
			if !canAccessUser(loginUser, ud.UserID, target.DeptID, target.DeptPath) {
				c.JSON(http.StatusOK, domain.BizErr(5, "没有数据权限"))
				return
			}
		}
	}
	_, _ = h.db.ExecContext(c.Request.Context(), "delete from sys_user_data where id=?", id)
	c.JSON(http.StatusOK, domain.Ok("删除成功", nil))
}

// UserRoles 查询用户已分配的角色。
func (h *Handler) UserRoles(c *gin.Context) {
	userID, _ := strconv.Atoi(c.Query("id"))
	if userID <= 0 {
		c.JSON(http.StatusOK, domain.BizErr(8, "参数不合法"))
		return
	}
	loginUser := mw.GetLoginUser(c)
	var target struct {
		DeptID   int    `db:"dept_id"`
		DeptPath string `db:"deptPath"`
	}
	q0 := "select t.dept_id, t2.path as deptPath from sys_user as t left join sys_dept as t2 on t2.id=t.dept_id where t.id=?"
	if err := h.db.GetContext(c.Request.Context(), &target, q0, userID); err != nil {
		c.JSON(http.StatusOK, domain.BizErr(9, "数据不存在"))
		return
	}
	if loginUser != nil && !loginUser.IsAdmin() && !canAccessUser(loginUser, userID, target.DeptID, target.DeptPath) {
		c.JSON(http.StatusOK, domain.BizErr(5, "没有数据权限"))
		return
	}
	q := "select t.id as roldId, t.role_name as roleName, t.code, t.type, t1.id from sys_role as t left join sys_user_role as t1 on t1.role_id=t.id where t1.user_id=?"
	rows, err := selectMapList(c.Request.Context(), h.db, q, userID)
	if err != nil || rows == nil {
		rows = []map[string]any{}
	}
	c.JSON(http.StatusOK, domain.Ok("获取成功", rows))
}

// UserRoleAdd 为用户分配角色。
func (h *Handler) UserRoleAdd(c *gin.Context) {
	userID, _ := strconv.Atoi(c.Query("id"))
	roleID, _ := strconv.Atoi(c.Query("rid"))
	if userID <= 0 || roleID <= 0 {
		c.JSON(http.StatusOK, domain.BizErr(8, "参数不合法"))
		return
	}
	loginUser := mw.GetLoginUser(c)
	var target struct {
		DeptID   int    `db:"dept_id"`
		DeptPath string `db:"deptPath"`
	}
	q0 := "select t.dept_id, t2.path as deptPath from sys_user as t left join sys_dept as t2 on t2.id=t.dept_id where t.id=?"
	if err := h.db.GetContext(c.Request.Context(), &target, q0, userID); err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("创建失败", "10"))
		return
	}
	if loginUser != nil && !loginUser.IsAdmin() && !canAccessUser(loginUser, userID, target.DeptID, target.DeptPath) {
		c.JSON(http.StatusOK, domain.BizErr(5, "没有数据权限"))
		return
	}

	// 检查是否已经存在该角色分配，避免重复添加
	var existCount int
	if err := h.db.GetContext(c.Request.Context(), &existCount, "select count(*) from sys_user_role where user_id=? and role_id=?", userID, roleID); err == nil && existCount > 0 {
		c.JSON(http.StatusOK, domain.ErrCode("该用户已分配此角色，请勿重复添加", "10"))
		return
	}

	_, err := h.db.ExecContext(c.Request.Context(), "insert into sys_user_role(role_id, user_id) values (?,?)", roleID, userID)
	if err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("创建失败", "10"))
		return
	}
	c.JSON(http.StatusOK, domain.Ok("创建成功", nil))
}

// UserRoleDelete 删除用户的角色。
func (h *Handler) UserRoleDelete(c *gin.Context) {
	id, _ := strconv.Atoi(c.Query("id"))
	if id <= 0 {
		c.JSON(http.StatusOK, domain.BizErr(8, "参数不合法"))
		return
	}
	loginUser := mw.GetLoginUser(c)
	var ur struct {
		ID     int `db:"id"`
		UserID int `db:"user_id"`
	}
	if err := h.db.GetContext(c.Request.Context(), &ur, "select id, user_id from sys_user_role where id=?", id); err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("删除失败", "10"))
		return
	}
	var target struct {
		DeptID   int    `db:"dept_id"`
		DeptPath string `db:"deptPath"`
	}
	q0 := "select t.dept_id, t2.path as deptPath from sys_user as t left join sys_dept as t2 on t2.id=t.dept_id where t.id=?"
	if err := h.db.GetContext(c.Request.Context(), &target, q0, ur.UserID); err == nil {
		if loginUser != nil && !loginUser.IsAdmin() && !canAccessUser(loginUser, ur.UserID, target.DeptID, target.DeptPath) {
			c.JSON(http.StatusOK, domain.BizErr(5, "没有数据权限"))
			return
		}
	}
	_, _ = h.db.ExecContext(c.Request.Context(), "delete from sys_user_role where id=?", id)
	c.JSON(http.StatusOK, domain.Ok("删除成功", nil))
}

// UserLoginAs 以指定用户身份重新签发 JWT。
func (h *Handler) UserLoginAs(c *gin.Context) {
	userID, _ := strconv.Atoi(c.Query("id"))
	if userID <= 0 {
		c.JSON(http.StatusOK, domain.ErrCode("用户ID不能为空", "10"))
		return
	}
	var target struct {
		Username string `db:"username"`
		Status   int    `db:"status"`
	}
	if err := h.db.GetContext(c.Request.Context(), &target, "select username,status from sys_user where id=?", userID); err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("用户不存在", "10"))
		return
	}
	if target.Status != 1 {
		c.JSON(http.StatusOK, domain.ErrCode("目标用户已被禁用", "10"))
		return
	}
	shiroUser, err := repo.BuildShiroUserByUsername(c.Request.Context(), h.db, target.Username)
	if err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("登录此用户失败", "10"))
		return
	}
	jwtToken, err := repo.SignJWT(h.cfg, shiroUser.Username)
	if err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("登录此用户失败", "10"))
		return
	}
	http.SetCookie(c.Writer, &http.Cookie{Name: h.cfg.JWT.CookieName, Value: jwtToken, MaxAge: 60 * 60 * 24, Path: "/"})
	c.JSON(http.StatusOK, domain.Ok("切换用户成功", map[string]any{"jwtToken": jwtToken, "user": shiroUser}))
}

// UserDataAddGuard 校验并处理用户数据权限新增的约束条件。
func (h *Handler) UserDataAddGuard(c *gin.Context, userID int) error {
	if userID <= 0 {
		return errors.New("invalid user id")
	}
	return nil
}
