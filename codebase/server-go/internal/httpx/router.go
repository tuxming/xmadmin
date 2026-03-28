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

package httpx

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"

	"xmadmin/server-go/internal/config"
	"xmadmin/server-go/internal/httpx/handlers"
	"xmadmin/server-go/internal/httpx/mw"
)

// NewRouter 创建并返回 HTTP 路由器，API 路径与 Java 端保持兼容。
func NewRouter(cfg *config.Config, db *sqlx.DB, rdb *redis.Client) http.Handler {
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(mw.CORS())

	h := handlers.New(cfg, db, rdb)

	r.GET("/healthz", h.Healthz)

	r.GET("/", h.Index)
	r.GET("/index", h.Index)
	r.GET("/user", h.Index)

	sys := r.Group("/sys")
	sys.Use(mw.Auth(cfg, db))
	sys.GET("", h.Index)
	sys.GET("/", h.Index)
	sys.GET("/index", h.Index)
	sys.GET("/user", h.Index)
	sys.GET("/sys", h.Index)

	auth := r.Group("/auth")
	auth.GET("/code", h.AuthCode)
	auth.POST("/login", h.AuthLogin)
	auth.GET("/sendPhoneCode", h.SendPhoneCode)
	auth.GET("/sendMailCode", h.SendMailCode)
	auth.POST("/resetPassword", h.ResetPassword)

	pub := r.Group("/public")
	pub.GET("/img", h.PublicImg)
	pub.GET("/wallpaperAllCategories", h.WallpaperAllCategories)
	pub.GET("/wallpaperImageList", h.WallpaperImageList)
	pub.GET("/locales", h.Locales)
	pub.POST("/localesAdd", h.LocalesAdd)

	am := r.Group("/am")
	am.Use(mw.Auth(cfg, db))
	am.Use(mw.HistoryLogger(db))

	menu := am.Group("/menu")
	menu.GET("/curr", h.MenuCurr)
	menu.GET("/list", mw.RequirePerm("sys:menu:list"), h.MenuList)
	menu.POST("/saveOrUpdate", mw.RequireAnyPerm("sys:menu:create", "sys:menu:update"), h.MenuSaveOrUpdate)
	menu.Any("/delete", mw.RequirePerm("sys:menu:delete"), h.MenuDelete)
	menu.GET("/byRole", h.MenuByRole)

	user := am.Group("/user")
	user.GET("/get", mw.RequirePerm("sys:user:get"), h.UserGet)
	user.GET("/userInfo", h.UserInfo)
	user.POST("/list", mw.RequirePerm("sys:user:list"), h.UserList)
	user.Any("/search", h.UserSearch)
	user.POST("/create", mw.RequirePerm("sys:user:create"), h.UserCreate)
	user.POST("/update", mw.RequirePerm("sys:user:update"), h.UserUpdate)
	user.Any("/delete", mw.RequirePerm("sys:user:delete"), h.UserDelete)
	user.Any("/forceDelete", mw.RequirePerm("sys:user:forceDelete"), h.UserForceDelete)
	user.Any("/dataPermissions", mw.RequirePerm("sys:user:grant:data"), h.UserDataPermissions)
	user.POST("/userDataAdd", mw.RequirePerm("sys:user:grant:data"), h.UserDataAdd)
	user.Any("/userDataDelete", mw.RequirePerm("sys:user:grant:data"), h.UserDataDelete)
	user.GET("/userRoles", mw.RequirePerm("sys:user:grant:role"), h.UserRoles)
	user.Any("/userRoleAdd", mw.RequirePerm("sys:user:grant:role"), h.UserRoleAdd)
	user.Any("/userRoleDelete", mw.RequirePerm("sys:user:grant:role"), h.UserRoleDelete)
	user.GET("/loginAs", mw.RequirePerm("sys:user:login:as"), h.UserLoginAs)

	role := am.Group("/role")
	role.Any("/search", h.RoleSearch)
	role.POST("/list", mw.RequirePerm("sys:role:list"), h.RoleList)
	role.POST("/create", mw.RequirePerm("sys:role:create"), h.RoleCreate)
	role.POST("/update", mw.RequirePerm("sys:role:edit"), h.RoleUpdate)
	role.Any("/deletes", mw.RequirePerm("sys:role:delete"), h.RoleDeletes)
	role.POST("/grantPermissions", mw.RequirePerm("sys:role:grant:permission"), h.RoleGrantPermissions)
	role.POST("/grantMenus", mw.RequirePerm("sys:role:grant:menu"), h.RoleGrantMenus)

	perm := am.Group("/permission")
	perm.GET("/get", mw.RequirePerm("sys:permission:get"), h.PermissionGet)
	perm.POST("/list", mw.RequirePerm("sys:permission:list"), h.PermissionList)
	perm.POST("/create", mw.RequirePerm("sys:permission:create"), h.PermissionCreate)
	perm.POST("/update", mw.RequirePerm("sys:permission:edit"), h.PermissionUpdate)
	perm.Any("/deletes", mw.RequirePerm("sys:permission:delete"), h.PermissionDeletes)
	perm.Any("/scan", mw.RequirePerm("sys:permission:scan"), h.PermissionScan)
	perm.GET("/curr", h.PermissionCurr)
	perm.GET("/byRole", h.PermissionByRole)

	dept := am.Group("/dept")
	dept.GET("/get", h.DeptGet)
	dept.POST("/list", mw.RequirePerm("sys:dept:list"), h.DeptList)
	dept.POST("/create", mw.RequirePerm("sys:dept:create"), h.DeptCreate)
	dept.POST("/update", mw.RequirePerm("sys:dept:update"), h.DeptUpdate)
	dept.Any("/delete", mw.RequirePerm("sys:dept:delete"), h.DeptDelete)

	dict := am.Group("/dict")
	dict.GET("/groups", h.DictGroups)
	dict.POST("/dicts", h.DictDicts)
	dict.POST("/saveOrUpdateGroup", mw.RequireAnyPerm("sys:dictGroup:create", "sys:dictGroup:update"), h.DictSaveOrUpdateGroup)
	dict.Any("/deleteGroup", mw.RequirePerm("sys:dictGroup:delete"), h.DictDeleteGroup)
	dict.POST("/addDict", mw.RequirePerm("sys:dict:add"), h.DictAdd)
	dict.POST("/updateDict", mw.RequirePerm("sys:dict:update"), h.DictUpdate)
	dict.Any("/deleteDict", mw.RequirePerm("sys:dict:delete"), h.DictDelete)
	dict.GET("/byKey", h.DictByKey)

	lang := am.Group("/lang")
	lang.GET("/groups", h.LangGroups)
	lang.GET("/langs", h.LangLangs)
	lang.POST("/resources", h.LangResources)
	lang.POST("/addLang", mw.RequirePerm("sys:lang:create"), h.LangAdd)
	lang.POST("/updateLang", mw.RequirePerm("sys:lang:edit"), h.LangUpdate)
	lang.Any("/deleteLang", mw.RequirePerm("sys:lang:delete"), h.LangDelete)
	lang.POST("/updateRes", mw.RequirePerm("sys:res:edit"), h.LangResUpdate)
	lang.Any("/deleteRes", mw.RequirePerm("sys:res:delete"), h.LangResDelete)
	lang.GET("/resourceByKey", h.LangResourceByKey)

	history := am.Group("/history")
	history.GET("/get", mw.RequirePerm("sys:history:get"), h.HistoryGet)
	history.POST("/list", mw.RequirePerm("sys:history:list"), h.HistoryList)
	history.Any("/deletes", mw.RequirePerm("sys:history:delete"), h.HistoryDeletes)

	doc := am.Group("/document")
	doc.POST("/list", mw.RequirePerm("sys:doc:list"), h.DocumentList)
	doc.POST("/upload", mw.RequirePerm("sys:doc:upload"), h.DocumentUpload)
	doc.Any("/deletes", mw.RequirePerm("sys:doc:delete"), h.DocumentDeletes)

	return r
}
