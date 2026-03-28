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
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"xmadmin/server-go/internal/domain"
)

// HistoryGet 查询指定 historyId 的日志详情。
func (h *Handler) HistoryGet(c *gin.Context) {
	historyID := strings.TrimSpace(c.Query("historyId"))
	if historyID == "" {
		historyID = strings.TrimSpace(c.Query("id"))
	}
	if historyID == "" {
		c.JSON(http.StatusOK, domain.BizErr(8, "参数不合法"))
		return
	}
	q := "select user_id as userId, username, ip_addr as ipAddr, type, DATE_FORMAT(created, '%Y-%m-%d %H:%i:%s') as created, group_concat(remark order by id SEPARATOR '') as remark from sys_history where history_id=? order by id asc"
	list, err := selectMapList(c.Request.Context(), h.db, q, historyID)
	if err != nil || len(list) == 0 {
		c.JSON(http.StatusOK, domain.BizErr(9, "数据不存在"))
		return
	}
	// Check if group_concat actually found anything, it might return a row with nulls if no match
	if list[0]["userId"] == nil {
		c.JSON(http.StatusOK, domain.BizErr(9, "数据不存在"))
		return
	}
	c.JSON(http.StatusOK, domain.Ok("获取成功", list[0]))
}

type historyQuery struct {
	Start      int      `json:"start"`
	Length     int      `json:"length"`
	BasicValue string   `json:"basicValue"`
	UserID     *int     `json:"userId"`
	IpAddr     *string  `json:"ipAddr"`
	Types      []string `json:"types"`
	Remark     *string  `json:"remark"`
	StartDate  *string  `json:"startDate"`
	EndDate    *string  `json:"endDate"`
}

// HistoryList 分页查询操作日志。
func (h *Handler) HistoryList(c *gin.Context) {
	var q historyQuery
	if err := c.ShouldBindJSON(&q); err != nil {
		c.JSON(http.StatusOK, domain.BizErr(8, "参数不合法"))
		return
	}
	if q.Length <= 0 {
		q.Length = 20
	}
	where := "1=1"
	args := []any{}
	if q.BasicValue != "" {
		where += " and (t.username like ? or t.type like ?)"
		v := "%" + q.BasicValue + "%"
		args = append(args, v, v)
	} else {
		if q.UserID != nil {
			where += " and user_id=?"
			args = append(args, *q.UserID)
		}
		if q.IpAddr != nil && strings.TrimSpace(*q.IpAddr) != "" {
			where += " and ip_addr=?"
			args = append(args, strings.TrimSpace(*q.IpAddr))
		}
		if len(q.Types) > 0 {
			in, a := inStrings("type", q.Types)
			where += " and " + in
			args = append(args, a...)
		}
		if q.Remark != nil && strings.TrimSpace(*q.Remark) != "" {
			where += " and remark like ?"
			args = append(args, "%"+strings.TrimSpace(*q.Remark)+"%")
		}
		if q.StartDate != nil && q.EndDate != nil && strings.TrimSpace(*q.StartDate) != "" && strings.TrimSpace(*q.EndDate) != "" {
			where += " and created between ? and ?"
			args = append(args, *q.StartDate, *q.EndDate)
		}
	}
	dataSQL := "select t.id, t.user_id as userId, t.username, t.ip_addr as ipAddr, t.type, DATE_FORMAT(t.created, '%Y-%m-%d %H:%i:%s') as created, t.remark, t.seq, t.history_id as historyId from sys_history as t where " + where + " order by t.id desc limit ? offset ?"
	args2 := append(args, q.Length, q.Start)
	list, _ := selectMapList(c.Request.Context(), h.db, dataSQL, args2...)
	if list == nil {
		list = []map[string]any{}
	}
	page := domain.PageInfo[map[string]any]{List: list}
	if q.Start == 0 {
		var total int
		_ = h.db.GetContext(c.Request.Context(), &total, "select count(*) from sys_history as t where "+where, args...)
		page.Total = total
	}
	c.JSON(http.StatusOK, domain.Ok("获取成功", page))
}

// HistoryDeletes 批量删除操作日志。
func (h *Handler) HistoryDeletes(c *gin.Context) {
	ids := strings.TrimSpace(c.Query("ids"))
	if ids == "" || !idsRe.MatchString(ids) {
		c.JSON(http.StatusOK, domain.BizErr(7, "参数为空"))
		return
	}
	_, err := h.db.ExecContext(c.Request.Context(), "delete from sys_history where id in ("+ids+")")
	if err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("删除失败", "10"))
		return
	}
	c.JSON(http.StatusOK, domain.Ok("删除成功", nil))
}
