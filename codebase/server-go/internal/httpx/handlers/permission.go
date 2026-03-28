package handlers

import (
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"

	"xmadmin/server-go/internal/config"
	"xmadmin/server-go/internal/domain"
	"xmadmin/server-go/internal/httpx/mw"
)

type PermQuery struct {
	BasicValue string `json:"basicValue"`
	Start      int    `json:"start"`
	Length     int    `json:"length"`
}

func (h *Handler) PermissionList(c *gin.Context) {
	var q PermQuery
	if err := c.ShouldBindJSON(&q); err != nil {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数为空"))
		return
	}
	if q.Length <= 0 {
		q.Length = 10
	}
	where := "1=1"
	var args []any
	if q.BasicValue != "" {
		where += " and (group_name like ? or name like ? or expression like ?)"
		likeVal := "%" + q.BasicValue + "%"
		args = append(args, likeVal, likeVal, likeVal)
	}

	var total int
	h.db.GetContext(c.Request.Context(), &total, "select count(1) from sys_permission where "+where, args...)

	args = append(args, q.Length, q.Start)
	list, err := selectMapList(c.Request.Context(), h.db, "select id, name, expression, group_name as groupName from sys_permission where "+where+" order by id desc limit ? offset ?", args...)
	if err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("获取失败", "500"))
		return
	}

	page := domain.PageInfo[any]{
		Total: total,
		List:  make([]any, len(list)),
	}
	for i, v := range list {
		page.List[i] = v
	}
	c.JSON(http.StatusOK, domain.Ok("获取成功", page))
}

type PermDto struct {
	ID         *int   `json:"id" toml:"id"`
	GroupName  string `json:"groupName" toml:"groupName"`
	Name       string `json:"name" toml:"name"`
	Expression string `json:"expression" toml:"expression"`
}

func (h *Handler) PermissionCreate(c *gin.Context) {
	var dto PermDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数为空"))
		return
	}
	res, err := h.db.ExecContext(c.Request.Context(), "insert into sys_permission (name, expression, group_name) values (?, ?, ?)", dto.Name, dto.Expression, dto.GroupName)
	if err != nil {
		c.JSON(http.StatusOK, domain.BizErr(10, "创建失败"))
		return
	}
	id, _ := res.LastInsertId()
	c.JSON(http.StatusOK, domain.Ok("创建成功", id))
}

func (h *Handler) PermissionUpdate(c *gin.Context) {
	var dto PermDto
	if err := c.ShouldBindJSON(&dto); err != nil || dto.ID == nil {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数为空"))
		return
	}
	h.db.ExecContext(c.Request.Context(), "update sys_permission set name=?, expression=?, group_name=? where id=?", dto.Name, dto.Expression, dto.GroupName, *dto.ID)
	c.JSON(http.StatusOK, domain.Ok("更新成功", nil))
}

func (h *Handler) PermissionDeletes(c *gin.Context) {
	idsStr := c.Query("ids")
	if idsStr == "" {
		idsStr = c.PostForm("ids")
	}
	if idsStr == "" {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数无效"))
		return
	}
	arr := strings.Split(idsStr, ",")
	for _, s := range arr {
		id, _ := strconv.Atoi(s)
		if id > 0 {
			h.db.ExecContext(c.Request.Context(), "delete from sys_permission where id=?", id)
			h.db.ExecContext(c.Request.Context(), "delete from sys_role_permission where permission_id=?", id)
		}
	}
	c.JSON(http.StatusOK, domain.Ok("删除成功", nil))
}

func (h *Handler) PermissionScan(c *gin.Context) {
	perms := config.GetAllPerms()

	results := make(map[string]string)

	for _, p := range perms {
		var count int
		h.db.GetContext(c.Request.Context(), &count, "select count(1) from sys_permission where expression=?", p.Expression)
		if count == 0 {
			_, err := h.db.ExecContext(c.Request.Context(), "insert into sys_permission (name, expression, group_name) values (?, ?, ?)", p.Name, p.Expression, p.GroupName)
			if err != nil {
				results[p.Name+","+p.Expression] = err.Error()
			} else {
				results[p.Name+","+p.Expression] = "New"
			}
		} else {
			results[p.Name+","+p.Expression] = "Exist"
		}
	}

	log.Println("Permission scan completed", "results", results)

	c.JSON(http.StatusOK, domain.Ok("扫描成功", results))
}

func (h *Handler) PermissionCurr(c *gin.Context) {
	loginUser := mw.GetLoginUser(c)
	if loginUser == nil {
		c.JSON(http.StatusOK, domain.BizErr(1, "用户未登录"))
		return
	}

	// 在权限分配界面调用此接口获取所有可分配权限。如果当前用户是超级管理员，应返回系统内所有权限。
	if loginUser.IsAdmin() {
		list, _ := selectMapList(c.Request.Context(), h.db, "select id, name, expression, group_name as groupName from sys_permission")
		if list == nil {
			list = []map[string]any{}
		}
		c.JSON(http.StatusOK, domain.Ok("获取成功", list))
		return
	}

	// 否则返回当前用户自己拥有的权限（如果是从loginUser.Permissions中获取需要转换格式，或者直接从数据库查）
	// 这里为了统一返回格式，直接从数据库查用户权限：
	roleIds := make([]int, len(loginUser.Roles))
	for i, r := range loginUser.Roles {
		roleIds[i] = r.ID
	}
	if len(roleIds) > 0 {
		in, a := inInts("t2.role_id", roleIds)
		query := "select distinct t1.id, t1.name, t1.expression, t1.group_name as groupName from sys_permission t1 inner join sys_role_permission t2 on t1.id = t2.permission_id where " + in
		list, _ := selectMapList(c.Request.Context(), h.db, query, a...)
		if list == nil {
			list = []map[string]any{}
		}
		c.JSON(http.StatusOK, domain.Ok("获取成功", list))
	} else {
		c.JSON(http.StatusOK, domain.Ok("获取成功", []map[string]any{}))
	}
}

func (h *Handler) PermissionByRole(c *gin.Context) {
	roleIdStr := c.Query("id")
	roleId, _ := strconv.Atoi(roleIdStr)
	if roleId == 0 {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数无效"))
		return
	}
	list, _ := selectMapList(c.Request.Context(), h.db, "select permission_id as id from sys_role_permission where role_id=?", roleId)
	if list == nil {
		list = []map[string]any{}
	}
	c.JSON(http.StatusOK, domain.Ok("获取成功", list))
}

func (h *Handler) PermissionGet(c *gin.Context) {
	idStr := c.Query("id")
	id, _ := strconv.Atoi(idStr)
	if id == 0 {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数为空"))
		return
	}
	list, err := selectMapList(c.Request.Context(), h.db, "select id, name, expression, group_name as groupName from sys_permission where id=?", id)
	if err != nil || len(list) == 0 {
		c.JSON(http.StatusOK, domain.Ok("获取成功", nil))
		return
	}
	c.JSON(http.StatusOK, domain.Ok("获取成功", list[0]))
}
