package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"xmadmin/server-go/internal/domain"

	"github.com/gin-gonic/gin"
)

func (h *Handler) DictGroups(c *gin.Context) {
	list, err := selectMapList(c.Request.Context(), h.db, "select code, label, remark from sys_dict_group")
	if err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("获取失败", "500"))
		return
	}
	c.JSON(http.StatusOK, domain.Ok("获取成功", list))
}

type DictQuery struct {
	GroupName string `json:"groupName"`
	Start     int    `json:"start"`
	Length    int    `json:"length"`
}

func (h *Handler) DictDicts(c *gin.Context) {
	var q DictQuery
	if err := c.ShouldBindJSON(&q); err != nil || q.GroupName == "" {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数为空"))
		return
	}
	if q.Length <= 0 {
		q.Length = 10
	}

	var total int
	h.db.GetContext(c.Request.Context(), &total, "select count(1) from sys_dict where group_name=?", q.GroupName)

	list, err := selectMapList(c.Request.Context(), h.db, "select d.id, d.dict_label as dictLabel, d.dict_value as dictValue, d.dict_key as dictKey, d.type, d.group_name as groupName, d.remark, g.label as groupLabel from sys_dict d left join sys_dict_group g on d.group_name=g.code where d.group_name=? order by d.id desc limit ? offset ?", q.GroupName, q.Length, q.Start)
	if err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("获取失败", "500"))
		return
	}
	
	if list == nil {
		list = []map[string]any{}
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

type DictGroupDto struct {
	Code   string `json:"code"`
	Label  string `json:"label"`
	Remark string `json:"remark"`
}

func (h *Handler) DictSaveOrUpdateGroup(c *gin.Context) {
	var dto DictGroupDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数为空"))
		return
	}
	var count int
	h.db.GetContext(c.Request.Context(), &count, "select count(*) from sys_dict_group where code=?", dto.Code)
	if count == 0 {
		h.db.ExecContext(c.Request.Context(), "insert into sys_dict_group (code, label, remark) values (?, ?, ?)", dto.Code, dto.Label, dto.Remark)
	} else {
		h.db.ExecContext(c.Request.Context(), "update sys_dict_group set label=?, remark=? where code=?", dto.Label, dto.Remark, dto.Code)
	}
	c.JSON(http.StatusOK, domain.Ok("操作成功", nil))
}

func (h *Handler) DictDeleteGroup(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		code = c.PostForm("code")
	}
	if code == "" {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数无效"))
		return
	}
	h.db.ExecContext(c.Request.Context(), "delete from sys_dict_group where code=?", code)
	h.db.ExecContext(c.Request.Context(), "delete from sys_dict where group_name=?", code)
	c.JSON(http.StatusOK, domain.Ok("删除成功", nil))
}

type DictDto struct {
	ID        *int   `json:"id"`
	DictLabel string `json:"dictLabel"`
	DictValue any    `json:"dictValue"`
	DictKey   string `json:"dictKey"`
	Type      int    `json:"type"`
	GroupName string `json:"groupName"`
	Remark    string `json:"remark"`
}

func (h *Handler) DictAdd(c *gin.Context) {
	var dto DictDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数为空"))
		return
	}
	
	dictValueStr := ""
	if dto.DictValue != nil {
		dictValueStr = fmt.Sprintf("%v", dto.DictValue)
	}

	res, err := h.db.ExecContext(c.Request.Context(), "insert into sys_dict (dict_label, dict_value, dict_key, type, group_name, remark) values (?, ?, ?, ?, ?, ?)", dto.DictLabel, dictValueStr, dto.DictKey, dto.Type, dto.GroupName, dto.Remark)
	if err != nil {
		c.JSON(http.StatusOK, domain.BizErr(10, "创建失败"))
		return
	}
	id, _ := res.LastInsertId()
	c.JSON(http.StatusOK, domain.Ok("创建成功", int(id)))
}

func (h *Handler) DictUpdate(c *gin.Context) {
	var dto DictDto
	if err := c.ShouldBindJSON(&dto); err != nil || dto.ID == nil {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数为空"))
		return
	}
	
	dictValueStr := ""
	if dto.DictValue != nil {
		dictValueStr = fmt.Sprintf("%v", dto.DictValue)
	}

	h.db.ExecContext(c.Request.Context(), "update sys_dict set dict_label=?, dict_value=?, dict_key=?, type=?, group_name=?, remark=? where id=?", dto.DictLabel, dictValueStr, dto.DictKey, dto.Type, dto.GroupName, dto.Remark, *dto.ID)
	c.JSON(http.StatusOK, domain.Ok("更新成功", nil))
}

func (h *Handler) DictDelete(c *gin.Context) {
	idStr := c.Query("id")
	if idStr == "" {
		idStr = c.PostForm("id")
	}
	id, _ := strconv.Atoi(idStr)
	if id == 0 {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数无效"))
		return
	}
	h.db.ExecContext(c.Request.Context(), "delete from sys_dict where id=?", id)
	c.JSON(http.StatusOK, domain.Ok("删除成功", nil))
}

func (h *Handler) DictByKey(c *gin.Context) {
	key := c.Query("key")
	if key == "" {
		key = strings.TrimSpace(c.Param("key"))
	}
	if key == "" {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数无效"))
		return
	}
	// Note: Java uses group_name, not dict_key, to find all items belonging to a specific dictionary group key.
	list, err := selectMapList(c.Request.Context(), h.db, "select id, dict_label as dictLabel, dict_value as dictValue, dict_key as dictKey, type, group_name as groupName, remark from sys_dict where group_name=?", key)
	if err != nil {
		c.JSON(http.StatusOK, domain.Ok("获取成功", []map[string]any{}))
		return
	}
	if list == nil {
		list = []map[string]any{}
	}
	c.JSON(http.StatusOK, domain.Ok("获取成功", list))
}
