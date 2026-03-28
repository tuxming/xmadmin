package handlers

import (
	"context"
	"fmt"
	"math/rand"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"xmadmin/server-go/internal/domain"
	"xmadmin/server-go/internal/httpx/mw"

	"github.com/gin-gonic/gin"
)

type DocQuery struct {
	Name      string `json:"name"`
	Type      string `json:"type"`
	StartDate string `json:"startDate"`
	EndDate   string `json:"endDate"`
	Start     int    `json:"start"`
	Length    int    `json:"length"`
}

func (h *Handler) DocumentList(c *gin.Context) {
	var q DocQuery
	if err := c.ShouldBindJSON(&q); err != nil {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数为空"))
		return
	}
	if q.Length <= 0 {
		q.Length = 10
	}
	where := "1=1"
	var args []any
	if q.Name != "" {
		where += " and old_name like ?"
		args = append(args, "%"+q.Name+"%")
	}
	if q.Type != "" {
		where += " and suffix = ?"
		args = append(args, q.Type)
	}
	if q.StartDate != "" {
		where += " and created >= ?"
		args = append(args, q.StartDate+" 00:00:00")
	}
	if q.EndDate != "" {
		where += " and created <= ?"
		args = append(args, q.EndDate+" 23:59:59")
	}

	var total int
	h.db.GetContext(c.Request.Context(), &total, "select count(1) from sys_document where "+where, args...)

	args2 := append(args, q.Length, q.Start)
	list, err := selectMapList(c.Request.Context(), h.db, "select id, file_name as fileName, path, created, user_id as userId, type, remark from sys_document where "+where+" order by id desc limit ? offset ?", args2...)
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

func (h *Handler) DocumentUpload(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("上传失败: 未找到文件", "10"))
		return
	}

	docType := c.Query("type")
	if docType == "" {
		docType = "common"
	}
	
	// press := c.Query("press") // ignored for now

	user := mw.GetLoginUser(c)
	if user == nil {
		c.JSON(http.StatusOK, domain.BizErr(1, "用户未登录"))
		return
	}

	originFilename := file.Filename
	ext := ""
	idx := strings.LastIndex(originFilename, ".")
	if idx > -1 {
		ext = strings.ToLower(originFilename[idx+1:])
	}

	rand.Seed(time.Now().UnixNano())
	targetFilename := fmt.Sprintf("%d%03d.%s", time.Now().UnixMilli(), rand.Intn(100), ext)

	uploadPath := "E:/work/xmadmin/upload" // Fallback, could read from config
	userIdStr := strconv.Itoa(user.ID)

	relativeFile := filepath.ToSlash(filepath.Join(userIdStr, docType, targetFilename))
	targetPath := filepath.Join(uploadPath, userIdStr, docType)

	if err := os.MkdirAll(targetPath, 0755); err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("上传失败: 创建目录失败", "10"))
		return
	}

	dst := filepath.Join(targetPath, targetFilename)
	if err := c.SaveUploadedFile(file, dst); err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("上传失败: 保存文件失败", "10"))
		return
	}

	// Insert into database
	res, err := h.db.ExecContext(c.Request.Context(), 
		"INSERT INTO sys_document (file_name, path, created, user_id, type, remark) VALUES (?, ?, ?, ?, ?, ?)",
		originFilename, relativeFile, time.Now(), user.ID, docType, "")
	
	if err != nil {
		c.JSON(http.StatusOK, domain.ErrCode("上传失败: 数据库写入失败", "10"))
		return
	}

	id, _ := res.LastInsertId()
	c.JSON(http.StatusOK, domain.Ok("上传成功", id))
}

// Helper: Clear document cache from Redis
func (h *Handler) removeDocumentCache(ctx context.Context, id int) {
	if h.rdb == nil {
		return
	}
	h.rdb.HDel(ctx, "document.id", strconv.Itoa(id))
}

func (h *Handler) DocumentDeletes(c *gin.Context) {
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
			h.db.ExecContext(c.Request.Context(), "delete from sys_document where id=?", id)
			h.removeDocumentCache(c.Request.Context(), id)
		}
	}
	c.JSON(http.StatusOK, domain.Ok("删除成功", nil))
}
