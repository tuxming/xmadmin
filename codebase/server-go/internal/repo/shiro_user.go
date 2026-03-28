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
	"context"
	"database/sql"
	"errors"
	"fmt"
	"sort"
	"strings"

	"github.com/jmoiron/sqlx"

	"xmadmin/server-go/internal/domain"
)

type userRow struct {
	ID       int          `db:"id"`
	Username string       `db:"username"`
	Fullname string       `db:"fullname"`
	Password string       `db:"password"`
	ParentID int          `db:"parent_id"`
	Code     string       `db:"code"`
	Gender   int          `db:"gender"`
	Email    string       `db:"email"`
	Phone    string       `db:"phone"`
	Photo    int          `db:"photo"`
	DeptID   int          `db:"dept_id"`
	Status   int          `db:"status"`
	Created  sql.NullTime `db:"created"`
}

type deptRow struct {
	ID       int    `db:"id"`
	Type     int    `db:"type"`
	Name     string `db:"name"`
	Path     string `db:"path"`
	PathName string `db:"path_name"`
}

type roleRow struct {
	ID       int    `db:"id"`
	RoleName string `db:"role_name"`
	Type     int    `db:"type"`
}

type userDataRow struct {
	ID     int `db:"id"`
	UserID int `db:"user_id"`
	RefID  int `db:"ref_id"`
	Type   int `db:"type"`
}

// BuildShiroUserByUsername 从数据库构建 ShiroUser（角色/权限/数据权限），用于鉴权与数据过滤。
func BuildShiroUserByUsername(ctx context.Context, db *sqlx.DB, username string) (*domain.ShiroUser, error) {
	username = strings.TrimSpace(username)
	if username == "" {
		return nil, errors.New("username is empty")
	}

	var u userRow
	query := "select id, username, fullname, password, parent_id, code, gender, email, phone, photo, dept_id, status, created from sys_user where username=?"
	if err := db.GetContext(ctx, &u, query, username); err != nil {
		return nil, err
	}
	if u.Status != 1 {
		return nil, errors.New("account status invalid")
	}

	account := &domain.ShiroUser{
		ID:       u.ID,
		Username: u.Username,
		Fullname: u.Fullname,
		ParentID: u.ParentID,
		Code:     u.Code,
		Gender:   u.Gender,
		Email:    u.Email,
		Phone:    u.Phone,
		Photo:    u.Photo,
	}

	if account.ID < 3 {
		buildAdmin(account)
		return account, nil
	}

	roles, err := findRolesByUser(ctx, db, account.ID)
	if err != nil {
		return nil, err
	}
	for _, r := range roles {
		if r.Type <= 2 {
			buildAdmin(account)
			return account, nil
		}
	}
	for _, r := range roles {
		account.Roles = append(account.Roles, domain.ShiroRole{ID: r.ID, Name: r.RoleName, Type: r.Type})
	}

	if len(account.Roles) > 0 {
		roleIDs := make([]string, 0, len(account.Roles))
		for _, rr := range account.Roles {
			roleIDs = append(roleIDs, fmt.Sprintf("%d", rr.ID))
		}
		perms, err := findPermsByRoleIDs(ctx, db, strings.Join(roleIDs, ","))
		if err != nil {
			return nil, err
		}
		account.Permissions = perms
	}

	var dept deptRow
	if err := db.GetContext(ctx, &dept, "select id,type,name,path,path_name from sys_dept where id=?", u.DeptID); err == nil {
		account.Dept = &domain.ShiroDept{ID: dept.ID, Type: dept.Type, Name: dept.Name, Path: dept.Path, PathName: dept.PathName}
	}

	uds, err := findUserDataByUser(ctx, db, account.ID)
	if err != nil {
		return nil, err
	}
	account.UserDatas = uds

	userIDs := make([]int, 0, len(uds)+1)
	paths := make([]string, 0, len(uds))
	for _, sud := range uds {
		if sud.Type == 1 {
			userIDs = append(userIDs, sud.RefID)
		} else if sud.Type == 2 {
			paths = append(paths, sud.Path)
		}
	}
	userIDs = append(userIDs, account.ID)
	account.UserIDs = uniqueInts(userIDs)
	account.DataPath = uniqueStrings(paths)

	deptIDs := make([]int, 0)
	for _, p := range account.DataPath {
		var ids []int
		if err := db.SelectContext(ctx, &ids, "select id from sys_dept where path like ?", p+"%"); err == nil {
			deptIDs = append(deptIDs, ids...)
		}
	}
	account.DeptIDs = uniqueInts(deptIDs)

	return account, nil
}

// buildAdmin 构造管理员账号模型（内置角色与全量权限）。
func buildAdmin(account *domain.ShiroUser) {
	account.Roles = []domain.ShiroRole{{ID: 1, Name: "admin", Type: 0}}
	account.Permissions = []string{"*"}
	dept := &domain.ShiroDept{ID: 1, Type: 0, Name: "系统", Path: "/1/", PathName: "/系统/"}
	account.Dept = dept
	account.Company = dept
	account.Group = dept
	account.UserDatas = []domain.ShiroUserData{{ID: 0, UserID: account.ID, RefID: 1, Type: 2, Path: "/", PathName: "/系统/"}}
}

// findRolesByUser 查询用户关联的角色列表。
func findRolesByUser(ctx context.Context, db *sqlx.DB, userID int) ([]roleRow, error) {
	var roles []roleRow
	err := db.SelectContext(ctx, &roles, "select t.id, t.role_name, t.type from sys_role as t left join sys_user_role as t1 on t1.role_id=t.id where t1.user_id=?", userID)
	return roles, err
}

// findPermsByRoleIDs 查询指定 roleId 列表对应的权限表达式集合。
func findPermsByRoleIDs(ctx context.Context, db *sqlx.DB, roleIDsCSV string) ([]string, error) {
	roleIDsCSV = strings.TrimSpace(roleIDsCSV)
	if roleIDsCSV == "" {
		return nil, nil
	}
	q := "select distinct t.expression from sys_permission as t left join sys_role_permission as t1 on t1.permission_id=t.id where t1.role_id in (" + roleIDsCSV + ")"
	var perms []string
	err := db.SelectContext(ctx, &perms, q)
	return perms, err
}

// findUserDataByUser 查询用户数据权限（用户/组织）。
func findUserDataByUser(ctx context.Context, db *sqlx.DB, userID int) ([]domain.ShiroUserData, error) {
	var rows []userDataRow
	if err := db.SelectContext(ctx, &rows, "select * from sys_user_data where user_id=?", userID); err != nil {
		return nil, err
	}

	byType := map[int][]userDataRow{}
	for _, r := range rows {
		byType[r.Type] = append(byType[r.Type], r)
	}

	nameByUserID := map[int]string{}
	if users, ok := byType[1]; ok && len(users) > 0 {
		ids := make([]string, 0, len(users))
		for _, r := range users {
			ids = append(ids, fmt.Sprintf("%d", r.RefID))
		}
		q := "select id, fullname, username from sys_user where id in (" + strings.Join(ids, ",") + ")"
		var urows []struct {
			ID       int    `db:"id"`
			Fullname string `db:"fullname"`
			Username string `db:"username"`
		}
		if err := db.SelectContext(ctx, &urows, q); err == nil {
			for _, ur := range urows {
				nameByUserID[ur.ID] = ur.Fullname + "(" + ur.Username + ")"
			}
		}
	}

	deptByID := map[int]deptRow{}
	if depts, ok := byType[2]; ok && len(depts) > 0 {
		ids := make([]string, 0, len(depts))
		for _, r := range depts {
			ids = append(ids, fmt.Sprintf("%d", r.RefID))
		}
		q := "select id,type,name,path,path_name from sys_dept where id in (" + strings.Join(ids, ",") + ")"
		var drows []deptRow
		if err := db.SelectContext(ctx, &drows, q); err == nil {
			for _, dr := range drows {
				deptByID[dr.ID] = dr
			}
		}
	}

	res := make([]domain.ShiroUserData, 0, len(rows))
	for _, r := range rows {
		ud := domain.ShiroUserData{ID: r.ID, UserID: r.UserID, RefID: r.RefID, Type: r.Type}
		if r.Type == 1 {
			ud.Username = nameByUserID[r.RefID]
		} else if r.Type == 2 {
			if d, ok := deptByID[r.RefID]; ok {
				ud.Path = d.Path
				ud.PathName = d.PathName
			}
		}
		res = append(res, ud)
	}
	return res, nil
}

// uniqueInts 对 int 切片去重并排序。
func uniqueInts(xs []int) []int {
	if len(xs) == 0 {
		return nil
	}
	sort.Ints(xs)
	out := xs[:0]
	var prev int
	for i, v := range xs {
		if i == 0 || v != prev {
			out = append(out, v)
			prev = v
		}
	}
	return out
}

// uniqueStrings 对 string 切片去重并排序。
func uniqueStrings(xs []string) []string {
	if len(xs) == 0 {
		return nil
	}
	sort.Strings(xs)
	out := xs[:0]
	var prev string
	for i, v := range xs {
		if i == 0 || v != prev {
			out = append(out, v)
			prev = v
		}
	}
	return out
}
