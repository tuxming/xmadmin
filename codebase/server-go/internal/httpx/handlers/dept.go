package handlers

import (
	"context"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"xmadmin/server-go/internal/domain"
	"xmadmin/server-go/internal/httpx/mw"
)

func (h *Handler) DeptGet(c *gin.Context) {
	idStr := c.Query("id")
	id, _ := strconv.Atoi(idStr)
	if id == 0 {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数为空"))
		return
	}

	var dept map[string]any
	query := "select * from sys_dept where id=?"
	list, err := selectMapList(c.Request.Context(), h.db, query, id)
	if err != nil || len(list) == 0 {
		c.JSON(http.StatusOK, domain.Ok("获取成功", nil))
		return
	}
	dept = list[0]
	c.JSON(http.StatusOK, domain.Ok("获取成功", dept))
}

type DeptQuery struct {
	ParentID *int `json:"parentId"`
	Start    int  `json:"start"`
	Length   int  `json:"length"`
}

func (h *Handler) DeptList(c *gin.Context) {
	var q DeptQuery
	if err := c.ShouldBindJSON(&q); err != nil {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数为空"))
		return
	}

	if q.Length <= 0 {
		q.Length = 50
	}
	loginUser := mw.GetLoginUser(c)
	where := "1=1"
	args := []any{}

	if loginUser != nil && !loginUser.IsAdmin() {
		deptIDs := loginUser.DeptIDs
		if len(deptIDs) == 0 {
			c.JSON(http.StatusOK, domain.Ok("获取成功", domain.PageInfo[any]{Total: 0, List: []any{}}))
			return
		}
		in, a := inInts("t.id", deptIDs)
		where += " and " + in
		args = append(args, a...)

		if q.ParentID == nil {
			rootIDs := make([]int, 0)
			for _, ud := range loginUser.UserDatas {
				if ud.Type == 2 && ud.RefID > 0 {
					rootIDs = append(rootIDs, ud.RefID)
				}
			}
			if len(rootIDs) == 0 {
				c.JSON(http.StatusOK, domain.Ok("获取成功", domain.PageInfo[any]{Total: 0, List: []any{}}))
				return
			}
			in2, a2 := inInts("t.id", rootIDs)
			where += " and " + in2
			args = append(args, a2...)
		}
	}

	if q.ParentID != nil {
		where += " and t.parent_id=?"
		args = append(args, *q.ParentID)
	} else {
		if loginUser == nil || loginUser.IsAdmin() {
			where += " and t.parent_id=0"
		}
	}

	dataSQL := "select t.id, t.parent_id as parentId, t.name, t.path, t.path_name as pathName, t.type from sys_dept as t where " + where + " order by t.id asc limit ? offset ?"
	args2 := append(args, q.Length, q.Start)

	list, err := selectMapList(c.Request.Context(), h.db, dataSQL, args2...)
	if err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("获取失败", "500"))
		return
	}

	if list == nil {
		list = []map[string]any{}
	}

	ids := make([]int, 0, len(list))
	for _, row := range list {
		id := 0
		switch v := row["id"].(type) {
		case int64:
			id = int(v)
		case int:
			id = v
		}
		ids = append(ids, id)
	}

	childrenCount := make(map[int]int)
	if len(ids) > 0 {
		in, a := inInts("parent_id", ids)
		countSQL := "select parent_id, count(1) as c from sys_dept where " + in + " group by parent_id"
		counts, _ := selectMapList(c.Request.Context(), h.db, countSQL, a...)
		for _, row := range counts {
			pid := 0
			c := 0
			switch v := row["parent_id"].(type) {
			case int64:
				pid = int(v)
			case int:
				pid = v
			}
			switch v := row["c"].(type) {
			case int64:
				c = int(v)
			case int:
				c = v
			}
			childrenCount[pid] = c
		}
	}

	for _, row := range list {
		id := 0
		switch v := row["id"].(type) {
		case int64:
			id = int(v)
		case int:
			id = v
		}
		row["hasChildren"] = childrenCount[id] > 0
		row["isLeaf"] = childrenCount[id] == 0
		if childrenCount[id] > 0 {
			row["children"] = []any{}
			row["total"] = childrenCount[id]
		} else {
			row["children"] = []any{}
		}
	}

	var total int
	countSQL2 := "select count(1) from sys_dept as t where " + where
	h.db.GetContext(c.Request.Context(), &total, countSQL2, args...)

	page := domain.PageInfo[any]{
		Total: total,
		List:  make([]any, len(list)),
	}
	for i, v := range list {
		page.List[i] = v
	}

	c.JSON(http.StatusOK, domain.Ok("获取成功", page))
}

type DeptDto struct {
	ID       *int   `json:"id"`
	Name     string `json:"name"`
	ParentID int    `json:"parentId"`
	Type     int    `json:"type"`
}

func (h *Handler) DeptCreate(c *gin.Context) {
	var dto DeptDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数为空"))
		return
	}

	path := fmt.Sprintf("/%d/", dto.ParentID)
	pathName := fmt.Sprintf("/%s/", dto.Name)

	if dto.ParentID > 0 {
		var parent map[string]any
		list, _ := selectMapList(c.Request.Context(), h.db, "select path, path_name from sys_dept where id=?", dto.ParentID)
		if len(list) > 0 {
			parent = list[0]
			pPath, _ := parent["path"].(string)
			pPathName, _ := parent["path_name"].(string)
			if string(pPathName) != "" {
				pathName = string(pPathName) + dto.Name + "/"
			}
			path = string(pPath)
		}
	}

	res, err := h.db.ExecContext(c.Request.Context(), "insert into sys_dept (name, parent_id, type, path, path_name) values (?, ?, ?, ?, ?)", dto.Name, dto.ParentID, dto.Type, "", pathName)
	if err != nil {
		c.JSON(http.StatusOK, domain.BizErr(10, "创建失败"))
		return
	}
	id, _ := res.LastInsertId()

	path = path + fmt.Sprintf("%d/", id)
	h.db.ExecContext(c.Request.Context(), "update sys_dept set path=? where id=?", path, id)

	c.JSON(http.StatusOK, domain.Ok("创建成功", int(id)))
}

// Helper: Clear dept cache from Redis
func (h *Handler) removeDeptCache(ctx context.Context, id, parentID int, path string) {
	if h.rdb == nil {
		return
	}
	pipe := h.rdb.Pipeline()
	if id > 0 {
		pipe.HDel(ctx, "DEPT_ID", strconv.Itoa(id))
	}
	if parentID > 0 {
		pipe.HDel(ctx, "DEPT_PARENT_ID", strconv.Itoa(parentID))
	}
	if path != "" {
		pipe.HDel(ctx, "DEPT_PARENT_PATH", path)
		pipe.HDel(ctx, "DEPT_PARENT_CHILD_PATH", path)
	}
	_, _ = pipe.Exec(ctx)
}

func (h *Handler) DeptUpdate(c *gin.Context) {
	var dto DeptDto
	if err := c.ShouldBindJSON(&dto); err != nil || dto.ID == nil || *dto.ID == 0 {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数为空"))
		return
	}

	h.db.ExecContext(c.Request.Context(), "update sys_dept set name=?, parent_id=?, type=? where id=?", dto.Name, dto.ParentID, dto.Type, *dto.ID)

	h.removeDeptCache(c.Request.Context(), *dto.ID, dto.ParentID, "")

	c.JSON(http.StatusOK, domain.Ok("更新成功", nil))
}

func (h *Handler) DeptDelete(c *gin.Context) {
	idStr := c.Query("id")
	if idStr == "" {
		idStr = c.PostForm("id")
	}
	id, _ := strconv.Atoi(idStr)
	if id == 0 {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数无效"))
		return
	}

	var count int
	h.db.GetContext(c.Request.Context(), &count, "select count(1) from sys_dept where parent_id=?", id)
	if count > 0 {
		c.JSON(http.StatusOK, domain.ErrCode("包含下级部门，请先删除下级部门", "10"))
		return
	}
	h.db.GetContext(c.Request.Context(), &count, "select count(1) from sys_user where dept_id=?", id)
	if count > 0 {
		c.JSON(http.StatusOK, domain.ErrCode("该部门包含有用户，请先转移或删除用户", "10"))
		return
	}

	h.db.ExecContext(c.Request.Context(), "delete from sys_dept where id=?", id)

	h.removeDeptCache(c.Request.Context(), id, 0, "")

	c.JSON(http.StatusOK, domain.Ok("删除成功", nil))
}
