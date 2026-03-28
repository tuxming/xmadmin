package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"xmadmin/server-go/internal/domain"
	"xmadmin/server-go/internal/httpx/mw"

	"github.com/gin-gonic/gin"
)

type RoleQuery struct {
	BasicValue string `json:"basicValue"`
	RoleName   string `json:"roleName"`
	Code       string `json:"code"`
	Types      []int  `json:"types"`
	Creaters   []int  `json:"creaters"`
	Start      int    `json:"start"`
	Length     int    `json:"length"`
}

func (h *Handler) RoleSearch(c *gin.Context) {
	key := c.Query("k")
	query := "select id, role_name as roleName, code from sys_role where role_name like ? or code like ? order by id desc limit 20"
	arg := "%" + key + "%"
	list, err := selectMapList(c.Request.Context(), h.db, query, arg, arg)
	if err != nil {
		c.JSON(http.StatusOK, domain.Ok("获取成功", map[string]string{}))
		return
	}
	options := make(map[string]string)
	for _, row := range list {
		idVal := ""
		switch v := row["id"].(type) {
		case int64:
			idVal = strconv.FormatInt(v, 10)
		case int:
			idVal = strconv.Itoa(v)
		}
		rn, _ := row["roleName"].(string)
		code, _ := row["code"].(string)
		options[idVal] = rn + "(" + code + ")"
	}
	c.JSON(http.StatusOK, domain.Ok("获取成功", options))
}

func (h *Handler) RoleList(c *gin.Context) {
	var q RoleQuery
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
		where += " and (t.role_name like ? or t.code like ?)"
		likeVal := "%" + q.BasicValue + "%"
		args = append(args, likeVal, likeVal)
	} else {
		if q.RoleName != "" {
			where += " and t.role_name like ?"
			args = append(args, "%"+q.RoleName+"%")
		}
		if q.Code != "" {
			where += " and t.code = ?"
			args = append(args, q.Code)
		}
		if len(q.Types) > 0 {
			inQ, inArgs := inInts("t.type", q.Types)
			where += " and " + inQ
			args = append(args, inArgs...)
		}
		if len(q.Creaters) > 0 {
			inQ, inArgs := inInts("t.creater", q.Creaters)
			where += " and " + inQ
			args = append(args, inArgs...)
		}
	}

	var total int
	h.db.GetContext(c.Request.Context(), &total, "select count(1) from sys_role t left join sys_user u on t.creater = u.id where "+where, args...)

	args2 := append(args, q.Length, q.Start)
	list, err := selectMapList(c.Request.Context(), h.db, "select t.id, t.role_name as roleName, t.code, t.type, t.creater, IFNULL(NULLIF(u.fullname, ''), u.username) as createrName from sys_role t left join sys_user u on t.creater = u.id where "+where+" order by t.id desc limit ? offset ?", args2...)
	if err != nil {
		fmt.Println("RoleList Error:", err)
		c.JSON(http.StatusOK, domain.ErrCode("获取失败", "500"))
		return
	}

	for i, v := range list {
		if cName, ok := v["createrName"]; !ok || cName == nil || cName == "" {
			list[i]["createrName"] = "admin"
		}
	}

	page := domain.PageInfo[any]{
		Total: total,
		List:  make([]any, len(list)),
	}
	for i, v := range list {
		// selectMapList might return strings as []byte, let's fix createrName explicitly
		if b, ok := v["createrName"].([]byte); ok {
			v["createrName"] = string(b)
		}
		page.List[i] = v
	}
	c.JSON(http.StatusOK, domain.Ok("获取成功", page))
}

type RoleDto struct {
	ID       *int   `json:"id"`
	RoleName string `json:"roleName"`
	Code     string `json:"code"`
	Type     int    `json:"type"`
	Status   int    `json:"status"`
}

func (h *Handler) RoleCreate(c *gin.Context) {
	var dto RoleDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数为空"))
		return
	}
	loginUser := mw.GetLoginUser(c)
	uid := 0
	if loginUser != nil {
		uid = loginUser.ID
	}
	res, err := h.db.ExecContext(c.Request.Context(), "insert into sys_role (role_name, code, type, creater) values (?, ?, ?, ?)", dto.RoleName, dto.Code, dto.Type, uid)
	if err != nil {
		fmt.Println("RoleCreate Error:", err)
		c.JSON(http.StatusOK, domain.BizErr(10, "创建失败"))
		return
	}
	id, _ := res.LastInsertId()
	c.JSON(http.StatusOK, domain.Ok("创建成功", int(id)))
}

func (h *Handler) RoleUpdate(c *gin.Context) {
	var dto RoleDto
	if err := c.ShouldBindJSON(&dto); err != nil || dto.ID == nil {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数为空"))
		return
	}
	if *dto.ID <= 4 {
		c.JSON(http.StatusOK, domain.BizErr(10, "内置角色不能修改"))
		return
	}
	h.db.ExecContext(c.Request.Context(), "update sys_role set role_name=?, code=?, type=? where id=?", dto.RoleName, dto.Code, dto.Type, *dto.ID)
	c.JSON(http.StatusOK, domain.Ok("更新成功", nil))
}

func (h *Handler) RoleDeletes(c *gin.Context) {
	idsStr := c.Query("ids")
	if idsStr == "" {
		idsStr = c.PostForm("ids")
	}
	if idsStr == "" {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数无效"))
		return
	}
	arr := strings.Split(idsStr, ",")
	tx, err := h.db.Beginx()
	if err != nil {
		c.JSON(http.StatusOK, domain.BizErr(500, "删除失败"))
		return
	}
	defer tx.Rollback()

	for _, s := range arr {
		id, _ := strconv.Atoi(s)
		if id > 4 {
			tx.ExecContext(c.Request.Context(), "delete from sys_role where id=?", id)
			tx.ExecContext(c.Request.Context(), "delete from sys_role_menu where role_id=?", id)
			tx.ExecContext(c.Request.Context(), "delete from sys_role_permission where role_id=?", id)
			tx.ExecContext(c.Request.Context(), "delete from sys_user_role where role_id=?", id)
		}
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusOK, domain.BizErr(500, "删除失败"))
		return
	}
	c.JSON(http.StatusOK, domain.Ok("删除成功", nil))
}

func (h *Handler) RoleGrantPermissions(c *gin.Context) {
	idStr := c.Query("id")
	roleId, _ := strconv.Atoi(idStr)
	if roleId == 0 {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数无效"))
		return
	}
	var permIds []int
	if err := c.ShouldBindJSON(&permIds); err != nil {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数无效"))
		return
	}
	tx, _ := h.db.Beginx()
	tx.ExecContext(c.Request.Context(), "delete from sys_role_permission where role_id=?", roleId)
	for _, pid := range permIds {
		tx.ExecContext(c.Request.Context(), "insert into sys_role_permission (role_id, permission_id) values (?, ?)", roleId, pid)
	}
	tx.Commit()
	c.JSON(http.StatusOK, domain.Ok("分配成功", nil))
}

type RoleMenuDto struct {
	MenuID  int `json:"menuId"`
	Checked int `json:"checked"`
}

func (h *Handler) RoleGrantMenus(c *gin.Context) {
	idStr := c.Query("id")
	roleId, _ := strconv.Atoi(idStr)
	if roleId == 0 {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数无效"))
		return
	}
	var menus []RoleMenuDto
	if err := c.ShouldBindJSON(&menus); err != nil {
		fmt.Println("RoleGrantMenus Bind Error:", err)
		c.JSON(http.StatusOK, domain.BizErr(3, "参数无效"))
		return
	}
	tx, _ := h.db.Beginx()
	tx.ExecContext(c.Request.Context(), "delete from sys_role_menu where role_id=?", roleId)
	for _, m := range menus {
		tx.ExecContext(c.Request.Context(), "insert into sys_role_menu (role_id, menu_id, checked) values (?, ?, ?)", roleId, m.MenuID, m.Checked)
	}
	tx.Commit()
	c.JSON(http.StatusOK, domain.Ok("分配成功", nil))
}
