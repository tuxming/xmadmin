package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"xmadmin/server-go/internal/domain"

	"github.com/gin-gonic/gin"
)

func renderLogo(c *gin.Context) {
	// Serve the default logo.png from the assets folder
	baseDir, _ := os.Getwd()
	logoPath := filepath.Join(baseDir, "assets", "logo.png")
	
	file, err := os.Open(logoPath)
	if err != nil {
		c.JSON(http.StatusOK, domain.BizErr(4, "默认图片不存在"))
		return
	}
	defer file.Close()

	fileInfo, _ := file.Stat()
	c.DataFromReader(http.StatusOK, fileInfo.Size(), "image/png", file, map[string]string{
		"Cache-Control": "public, max-age=31536000",
	})
}

func (h *Handler) PublicImg(c *gin.Context) {
	idStr := c.Query("id")
	if idStr == "" {
		renderLogo(c)
		return
	}
	id, err := strconv.Atoi(idStr)
	if err != nil || id == 0 {
		renderLogo(c)
		return
	}

	var pathStr string
	err = h.db.GetContext(c.Request.Context(), &pathStr, "select path from sys_document where id=?", id)
	if err != nil || pathStr == "" {
		renderLogo(c)
		return
	}

	// If the file path in DB starts with "/", we trim it
	if len(pathStr) > 0 && pathStr[0] == '/' {
		pathStr = pathStr[1:]
	}

	// Determine the actual absolute upload path from the config
	uploadDir := h.cfg.Upload.BaseUploadPath
	if uploadDir == "" {
		// Fallback to default if not configured properly
		baseDir, _ := os.Getwd()
		uploadDir = filepath.Join(filepath.Dir(filepath.Dir(baseDir)), "upload")
	}

	fullPath := filepath.Join(uploadDir, pathStr)
	
	// Open file
	file, err := os.Open(fullPath)
	if err != nil {
		fmt.Println("Error opening image file:", err, "Path:", fullPath)
		renderLogo(c)
		return
	}
	defer file.Close()

	// Read file contents
	fileInfo, _ := file.Stat()
	contentType := "image/jpeg" // Default fallback
	ext := filepath.Ext(pathStr)
	switch ext {
	case ".png":
		contentType = "image/png"
	case ".gif":
		contentType = "image/gif"
	case ".webp":
		contentType = "image/webp"
	case ".svg":
		contentType = "image/svg+xml"
	}

	c.DataFromReader(http.StatusOK, fileInfo.Size(), contentType, file, map[string]string{
		"Cache-Control": "public, max-age=31536000",
	})
}

func (h *Handler) WallpaperAllCategories(c *gin.Context) {
	c.JSON(http.StatusOK, domain.Ok("获取成功", nil))
}

func (h *Handler) WallpaperImageList(c *gin.Context) {
	c.JSON(http.StatusOK, domain.Ok("获取成功", nil))
}

func (h *Handler) Locales(c *gin.Context) {
	lang := c.Query("lng")
	if lang == "" {
		lang = "zh_CN"
	}
	ns := c.Query("ns")
	var list []map[string]any
	var err error
	if ns != "" {
		query := "select t.id, t.category as groupName, t.res_key as k, t.res_value as v from sys_language_resource t left join sys_language t1 on t.language_id=t1.id where t1.code=? and t.category=?"
		list, err = selectMapList(c.Request.Context(), h.db, query, lang, ns)
	} else {
		query := "select t.id, t.category as groupName, t.res_key as k, t.res_value as v from sys_language_resource t left join sys_language t1 on t.language_id=t1.id where t1.code=?"
		list, err = selectMapList(c.Request.Context(), h.db, query, lang)
	}
	if err != nil {
		c.JSON(http.StatusOK, gin.H{})
		return
	}
	res := make(map[string]string)
	for _, row := range list {
		k, _ := row["k"].(string)
		v, _ := row["v"].(string)
		res[k] = v
	}
	c.JSON(http.StatusOK, res)
}

type LocaleDto struct {
	Lang      string `json:"lang"`
	GroupName string `json:"groupName"`
	K         string `json:"k"`
	V         string `json:"v"`
}

func (h *Handler) LocalesAdd(c *gin.Context) {
	var dto LocaleDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.JSON(http.StatusOK, domain.BizErr(3, "参数为空"))
		return
	}
	var langId int
	h.db.GetContext(c.Request.Context(), &langId, "select id from sys_language where code=?", dto.Lang)
	if langId == 0 {
		c.JSON(http.StatusOK, domain.BizErr(3, "语言不存在"))
		return
	}
	h.db.ExecContext(c.Request.Context(), "insert into sys_language_resource (lang_id, group_name, k, v) values (?, ?, ?, ?)", langId, dto.GroupName, dto.K, dto.V)
	c.JSON(http.StatusOK, domain.Ok("添加成功", nil))
}
