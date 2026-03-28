package handlers

import (
	"log"
	"net/http"
	"strconv"

	"xmadmin/server-go/internal/domain"
	"xmadmin/server-go/internal/httpx/mw"

	"github.com/gin-gonic/gin"
)

func (h *Handler) MenuCurr(c *gin.Context) {
	loginUser := mw.GetLoginUser(c)
	if loginUser == nil {
		c.JSON(http.StatusOK, domain.BizErr(1, "用户未登录"))
		return
	}
	var menus []map[string]any
	if loginUser.IsAdmin() {
		menus, _ = selectMapList(c.Request.Context(), h.db, "select id, name, parent_id as parentId, icon, path, query, type, status, sort from sys_menu order by sort asc")
	} else {
		// fetch menus from roles
		roleIds := make([]int, len(loginUser.Roles))
		for i, r := range loginUser.Roles {
			roleIds[i] = r.ID
		}
		if len(roleIds) > 0 {
			in, a := inInts("t2.role_id", roleIds)
			query := "select distinct t1.id, t1.name, t1.parent_id as parentId, t1.icon, t1.path, t1.query, t1.type, t1.status, t1.sort from sys_menu t1 inner join sys_role_menu t2 on t1.id = t2.menu_id where " + in + " order by t1.sort asc"
			menus, _ = selectMapList(c.Request.Context(), h.db, query, a...)
		} else {
			menus = []map[string]any{}
		}
	}

	if menus == nil {
		menus = []map[string]any{}
	}

	c.JSON(http.StatusOK, domain.Ok("获取成功", menus))
}

func (h *Handler) MenuList(c *gin.Context) {
	idStr := c.Query("id")
	query := "select id, name, parent_id as parentId, icon, path, query as queryStr, type, status, sort from sys_menu"
	var args []any

	if idStr != "" {
		id, err := strconv.Atoi(idStr)
		if err == nil {
			query += " where parent_id = ?"
			args = append(args, id)
		}
	}

	query += " order by sort asc"

	menus, err := selectMapList(c.Request.Context(), h.db, query, args...)
	if err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("获取失败", "500"))
		return
	}

	// Format to ensure 'children' is present to match Java output structure
	for i := range menus {
		menus[i]["children"] = []any{}
	}

	c.JSON(http.StatusOK, domain.Ok("获取成功", menus))
}

type MenuDto struct {
	ID       *int   `json:"id"`
	Name     string `json:"name"`
	ParentID int    `json:"parentId"`
	Icon     string `json:"icon"`
	Path     string `json:"path"`
	Query    string `json:"query"`
	Type     int    `json:"type"`
	Status   int    `json:"status"`
	Sort     int    `json:"sort"`
}

func (h *Handler) MenuSaveOrUpdate(c *gin.Context) {
	var dto MenuDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		log.Println("MenuSaveOrUpdate Bind Error:", err)
		c.JSON(http.StatusOK, domain.BizErr(3, "参数为空"))
		return
	}
	if dto.ID == nil || *dto.ID == 0 {
		_, err := h.db.ExecContext(c.Request.Context(), "insert into sys_menu (name, parent_id, icon, path, query, type, status, sort) values (?, ?, ?, ?, ?, ?, ?, ?)",
			dto.Name, dto.ParentID, dto.Icon, dto.Path, dto.Query, dto.Type, dto.Status, dto.Sort)
		if err != nil {
			log.Println("MenuSaveOrUpdate Insert Error:", err)
			c.JSON(http.StatusOK, domain.BizErr(500, "添加失败"))
			return
		}
	} else {
		_, err := h.db.ExecContext(c.Request.Context(), "update sys_menu set name=?, parent_id=?, icon=?, path=?, query=?, type=?, status=?, sort=? where id=?",
			dto.Name, dto.ParentID, dto.Icon, dto.Path, dto.Query, dto.Type, dto.Status, dto.Sort, *dto.ID)
		if err != nil {
			log.Println("MenuSaveOrUpdate Update Error:", err)
			c.JSON(http.StatusOK, domain.BizErr(500, "更新失败"))
			return
		}
	}
	c.JSON(http.StatusOK, domain.Ok("操作成功", nil))
}

func (h *Handler) MenuDelete(c *gin.Context) {
	idStr := c.Query("id")
	if idStr == "" {
		idStr = c.PostForm("id")
	}
	id, _ := strconv.Atoi(idStr)
	if id == 0 {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数无效"))
		return
	}
	h.db.ExecContext(c.Request.Context(), "delete from sys_menu where id=?", id)
	h.db.ExecContext(c.Request.Context(), "delete from sys_role_menu where menu_id=?", id)
	c.JSON(http.StatusOK, domain.Ok("删除成功", nil))
}

func (h *Handler) MenuByRole(c *gin.Context) {
	roleIdStr := c.Query("id")
	roleId, _ := strconv.Atoi(roleIdStr)
	if roleId == 0 {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数无效"))
		return
	}

	// 从数据库查询该角色关联的菜单列表
	list, err := selectMapList(c.Request.Context(), h.db, "select menu_id as id, checked from sys_role_menu where role_id=?", roleId)
	if err != nil {
		log.Println("MenuByRole query error", err)
		c.JSON(http.StatusOK, domain.BizErr(500, "查询失败"))
		return
	}

	if list == nil {
		list = []map[string]any{}
	}

	// 格式化输出，符合前端期望的结构: [{ id: 1, checked: 1|2 }, ...]
	var result []map[string]any
	for _, item := range list {
		id := item["id"]

		checkedVal := 2 // 默认为全选
		if val, ok := item["checked"].(int64); ok {
			checkedVal = int(val)
		} else if val, ok := item["checked"].(string); ok {
			checkedVal, _ = strconv.Atoi(val)
		} else if val, ok := item["checked"].([]uint8); ok {
			checkedVal, _ = strconv.Atoi(string(val))
		}

		result = append(result, map[string]any{
			"id":      id,
			"checked": checkedVal,
		})
	}

	if result == nil {
		result = []map[string]any{}
	}

	c.JSON(http.StatusOK, domain.Ok("获取成功", result))
}
