package handlers

import (
	"context"
	"net/http"
	"strconv"

	"xmadmin/server-go/internal/domain"

	"github.com/gin-gonic/gin"
)

func (h *Handler) LangGroups(c *gin.Context) {
	var list []string
	err := h.db.SelectContext(c.Request.Context(), &list, "select name from sys_language_resource_group")
	if err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("获取失败", "500"))
		return
	}
	if list == nil {
		list = []string{}
	}
	c.JSON(http.StatusOK, domain.Ok("获取成功", list))
}

func (h *Handler) LangLangs(c *gin.Context) {
	list, err := selectMapList(c.Request.Context(), h.db, "select id, label, code from sys_language")
	if err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("获取失败", "500"))
		return
	}
	c.JSON(http.StatusOK, domain.Ok("获取成功", list))
}

type LangResQuery struct {
	LangID    int    `json:"langId"`
	GroupName string `json:"groupName"`
	Start     int    `json:"start"`
	Length    int    `json:"length"`
}

func (h *Handler) LangResources(c *gin.Context) {
	var q LangResQuery
	if err := c.ShouldBindJSON(&q); err != nil || q.GroupName == "" {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数为空"))
		return
	}
	if q.Length <= 0 {
		q.Length = 10
	}

	where := "category=?"
	args := []any{q.GroupName}
	if q.LangID > 0 {
		where += " and language_id=?"
		args = append(args, q.LangID)
	}

	var total int
	h.db.GetContext(c.Request.Context(), &total, "select count(1) from sys_language_resource where "+where, args...)

	args2 := append(args, q.Length, q.Start)
	list, err := selectMapList(c.Request.Context(), h.db, "select id, language_id as languageId, category, res_key as resKey, res_value as resValue from sys_language_resource where "+where+" order by id desc limit ? offset ?", args2...)
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

type LangDto struct {
	ID    *int   `json:"id"`
	Label string `json:"label"`
	Code  string `json:"code"`
}

// Helper: Clear lang cache from Redis
func (h *Handler) removeLangCache(ctx context.Context, langCode string, category string) {
	if h.rdb == nil {
		return
	}
	pipe := h.rdb.Pipeline()
	pipe.HDel(ctx, "LANGS", "all")
	if langCode != "" && category != "" {
		pipe.HDel(ctx, "LANG_RES", langCode+"#"+category)
	} else {
		pipe.Del(ctx, "LANG_RES")
	}
	_, _ = pipe.Exec(ctx)
}

func (h *Handler) LangAdd(c *gin.Context) {
	var dto LangDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数为空"))
		return
	}
	res, err := h.db.ExecContext(c.Request.Context(), "insert into sys_language (label, code) values (?, ?)", dto.Label, dto.Code)
	if err != nil {
		c.JSON(http.StatusOK, domain.BizErr(10, "创建失败"))
		return
	}
	id, _ := res.LastInsertId()
	h.removeLangCache(c.Request.Context(), "", "")
	c.JSON(http.StatusOK, domain.Ok("创建成功", int(id)))
}

func (h *Handler) LangUpdate(c *gin.Context) {
	var dto LangDto
	if err := c.ShouldBindJSON(&dto); err != nil || dto.ID == nil {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数为空"))
		return
	}
	h.db.ExecContext(c.Request.Context(), "update sys_language set label=?, code=? where id=?", dto.Label, dto.Code, *dto.ID)
	h.removeLangCache(c.Request.Context(), "", "")
	c.JSON(http.StatusOK, domain.Ok("更新成功", nil))
}

func (h *Handler) LangDelete(c *gin.Context) {
	idStr := c.Query("id")
	if idStr == "" {
		idStr = c.PostForm("id")
	}
	id, _ := strconv.Atoi(idStr)
	if id == 0 {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数无效"))
		return
	}
	h.db.ExecContext(c.Request.Context(), "delete from sys_language where id=?", id)
	h.db.ExecContext(c.Request.Context(), "delete from sys_language_resource where lang_id=?", id)
	h.removeLangCache(c.Request.Context(), "", "")
	c.JSON(http.StatusOK, domain.Ok("删除成功", nil))
}

type LangResDto struct {
	ID         *int   `json:"id"`
	LanguageId int    `json:"languageId"`
	Category   string `json:"category"`
	ResKey     string `json:"resKey"`
	ResValue   string `json:"resValue"`
}

func (h *Handler) LangResUpdate(c *gin.Context) {
	var dtos []LangResDto
	if err := c.ShouldBindJSON(&dtos); err != nil || len(dtos) == 0 {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数为空"))
		return
	}
	for _, dto := range dtos {
		if dto.ID == nil {
			h.db.ExecContext(c.Request.Context(), "insert into sys_language_resource (language_id, category, res_key, res_value) values (?, ?, ?, ?)", dto.LanguageId, dto.Category, dto.ResKey, dto.ResValue)
		} else {
			h.db.ExecContext(c.Request.Context(), "update sys_language_resource set language_id=?, category=?, res_key=?, res_value=? where id=?", dto.LanguageId, dto.Category, dto.ResKey, dto.ResValue, *dto.ID)
		}
	}
	h.removeLangCache(c.Request.Context(), "", "")
	c.JSON(http.StatusOK, domain.Ok("更新成功", nil))
}

func (h *Handler) LangResDelete(c *gin.Context) {
	idStr := c.Query("id")
	if idStr == "" {
		idStr = c.PostForm("id")
	}
	id, _ := strconv.Atoi(idStr)
	if id == 0 {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数无效"))
		return
	}
	h.db.ExecContext(c.Request.Context(), "delete from sys_language_resource where id=?", id)
	h.removeLangCache(c.Request.Context(), "", "")
	c.JSON(http.StatusOK, domain.Ok("删除成功", nil))
}

func (h *Handler) LangResourceByKey(c *gin.Context) {
	key := c.Query("key")
	if key == "" {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数无效"))
		return
	}
	list, err := selectMapList(c.Request.Context(), h.db, "select id, language_id as languageId, category as groupName, res_key as k, res_value as v from sys_language_resource where res_key=?", key)
	if err != nil || len(list) == 0 {
		c.JSON(http.StatusOK, domain.Ok("获取成功", nil))
		return
	}
	c.JSON(http.StatusOK, domain.Ok("获取成功", list[0]))
}
