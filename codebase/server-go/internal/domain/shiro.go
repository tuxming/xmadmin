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

type ShiroRole struct {
	ID   int    `json:"id"`   // 角色ID
	Name string `json:"name"` // 角色名称
	Type int    `json:"type"` // 角色类型：0-系统角色，1-管理员，2-普通角色
}

// ShiroDept 组织部门简要信息
type ShiroDept struct {
	ID       int    `json:"id"`       // 组织ID
	Type     int    `json:"type"`     // 组织类型
	Name     string `json:"name"`     // 组织名称
	Path     string `json:"path"`     // 组织路径
	PathName string `json:"pathName"` // 组织路径名称
}

// ShiroUserData 数据权限信息
type ShiroUserData struct {
	ID       int    `json:"id"`                 // 数据权限记录ID
	UserID   int    `json:"userId"`             // 所属用户ID
	RefID    int    `json:"refId"`              // 关联引用ID
	Type     int    `json:"type"`               // 权限类型：1-用户，2-组织
	Username string `json:"username,omitempty"` // 冗余：用户名
	Path     string `json:"path,omitempty"`     // 冗余：组织路径
	PathName string `json:"pathName,omitempty"` // 冗余：组织路径名称
}

// ShiroUser 登录用户的身份及权限上下文信息
type ShiroUser struct {
	ID       int    `json:"id"`       // 用户ID
	Username string `json:"username"` // 用户名
	Fullname string `json:"fullname"` // 姓名
	ParentID int    `json:"parentId"` // 上级ID
	Code     string `json:"code"`     // 唯一码
	Gender   int    `json:"gender"`   // 性别
	Email    string `json:"email"`    // 邮箱
	Phone    string `json:"phone"`    // 手机号
	Photo    int    `json:"photo"`    // 头像ID

	Roles       []ShiroRole     `json:"roles,omitempty"`       // 拥有的角色列表
	Dept        *ShiroDept      `json:"dept,omitempty"`        // 所属部门
	Company     *ShiroDept      `json:"company,omitempty"`     // 所属公司
	Group       *ShiroDept      `json:"group,omitempty"`       // 所属集团
	Permissions []string        `json:"permissions,omitempty"` // 权限表达式列表
	UserDatas   []ShiroUserData `json:"userDatas,omitempty"`   // 数据权限配置列表

	UserIDs  []int    `json:"-"` // 数据权限可访问的用户ID集合
	DeptIDs  []int    `json:"-"` // 数据权限可访问的部门ID集合
	DataPath []string `json:"-"` // 数据权限可访问的部门路径集合
}

// IsSys 判断当前用户是否为系统管理员
func (u *ShiroUser) IsSys() bool {
	for _, r := range u.Roles {
		if r.Type == 0 {
			return true
		}
	}
	return false
}

// IsAdmin 判断当前用户是否为管理员（role.type<=2 或内置 admin）。
func (u *ShiroUser) IsAdmin() bool {
	for _, r := range u.Roles {
		if r.Type <= 2 {
			return true
		}
	}
	return false
}

// HasPerm 判断当前用户是否拥有指定权限（包含 `*` 与通配匹配）。
func (u *ShiroUser) HasPerm(perm string) bool {
	for _, p := range u.Permissions {
		if MatchWildcardPermission(p, perm) {
			return true
		}
	}
	return false
}
