package handlers

import (
	"bytes"
	"context"
	"crypto/md5"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"image"
	"image/color"
	"image/draw"
	"image/png"
	"math/rand"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
	"golang.org/x/image/font"
	"golang.org/x/image/font/basicfont"
	"golang.org/x/image/math/fixed"

	"xmadmin/server-go/internal/config"
	"xmadmin/server-go/internal/domain"
)

type Handler struct {
	cfg *config.Config
	db  *sqlx.DB
	rdb *redis.Client
}

func New(cfg *config.Config, db *sqlx.DB, rdb *redis.Client) *Handler {
	return &Handler{cfg: cfg, db: db, rdb: rdb}
}

func (h *Handler) Healthz(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
	defer cancel()
	if err := h.db.PingContext(ctx); err != nil {
		c.JSON(http.StatusOK, domain.ErrCode(err.Error(), "500"))
		return
	}
	if err := h.rdb.Ping(ctx).Err(); err != nil {
		c.JSON(http.StatusOK, domain.ErrCode(err.Error(), "500"))
		return
	}
	c.JSON(http.StatusOK, domain.Ok("OK", map[string]any{"env": h.cfg.Env}))
}

func (h *Handler) Index(c *gin.Context) {
	c.String(http.StatusOK, "XMAdmin server-go")
}

func (h *Handler) validateCaptcha(ctx context.Context, cacheKey, clientID, input string) bool {
	input = strings.TrimSpace(input)
	if input == "" {
		return false
	}
	v, err := h.rdb.Get(ctx, cacheKey+":"+clientID).Result()
	if err != nil {
		return false
	}
	return strings.EqualFold(strings.TrimSpace(v), input)
}

func (h *Handler) clearCaptcha(ctx context.Context, cacheKey, clientID string) {
	_ = h.rdb.Del(ctx, cacheKey+":"+clientID).Err()
}

func withTx(ctx context.Context, db *sqlx.DB, fn func(tx *sqlx.Tx) error) error {
	tx, err := db.BeginTxx(ctx, &sql.TxOptions{})
	if err != nil {
		return err
	}
	if err := fn(tx); err != nil {
		_ = tx.Rollback()
		return err
	}
	return tx.Commit()
}

func authCondition(alias string, user *domain.ShiroUser) string {
	if user == nil {
		return "1=0"
	}
	if user.IsAdmin() {
		return "1=1"
	}
	if alias != "" && !strings.HasSuffix(alias, ".") {
		alias += "."
	}
	if len(user.UserIDs) > 0 {
		if len(user.DeptIDs) > 0 {
			return "(" + alias + "id in (" + joinInts(user.UserIDs) + ") or " + alias + "dept_id in (" + joinInts(user.DeptIDs) + "))"
		}
		return alias + "id in (" + joinInts(user.UserIDs) + ")"
	}
	if len(user.DeptIDs) > 0 {
		return alias + "dept_id in (" + joinInts(user.DeptIDs) + ")"
	}
	return fmt.Sprintf("%sid=%d", alias, user.ID)
}

func canAccessUser(loginUser *domain.ShiroUser, targetUserID, targetDeptID int, targetDeptPath string) bool {
	if loginUser.IsAdmin() {
		return true
	}
	if targetUserID == loginUser.ID {
		return true
	}
	for _, id := range loginUser.UserIDs {
		if id == targetUserID {
			return true
		}
	}
	for _, id := range loginUser.DeptIDs {
		if id == targetDeptID {
			return true
		}
	}
	for _, p := range loginUser.DataPath {
		if strings.HasPrefix(targetDeptPath, p) {
			return true
		}
	}
	return false
}

func canAccessDeptPath(loginUser *domain.ShiroUser, deptPath string, deptID int) bool {
	if loginUser.IsAdmin() {
		return true
	}
	for _, id := range loginUser.DeptIDs {
		if id == deptID {
			return true
		}
	}
	for _, p := range loginUser.DataPath {
		if strings.HasPrefix(deptPath, p) {
			return true
		}
	}
	return false
}

func joinInts(vals []int) string {
	if len(vals) == 0 {
		return ""
	}
	bs := make([]string, 0, len(vals))
	for _, v := range vals {
		bs = append(bs, fmt.Sprintf("%d", v))
	}
	return strings.Join(bs, ",")
}

func containsInt(xs []int, v int) bool {
	for _, x := range xs {
		if x == v {
			return true
		}
	}
	return false
}

func hasRoleTypeLTE(user *domain.ShiroUser, maxType int) bool {
	if user == nil {
		return false
	}
	for _, r := range user.Roles {
		if r.Type <= maxType {
			return true
		}
	}
	return false
}

func ensurePath(p string) string {
	p = strings.TrimSpace(p)
	if p == "" {
		return "/"
	}
	if !strings.HasPrefix(p, "/") {
		p = "/" + p
	}
	if !strings.HasSuffix(p, "/") {
		p += "/"
	}
	return p
}

func clientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		parts := strings.Split(xff, ",")
		return strings.TrimSpace(parts[0])
	}
	if xr := r.Header.Get("X-Real-IP"); xr != "" {
		return strings.TrimSpace(xr)
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err == nil {
		return host
	}
	return r.RemoteAddr
}

func randomCode(n int) string {
	const chars = "ABCDEFGHIJILMNOPQRSTUVWXYZ0123456789"
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	var b strings.Builder
	b.Grow(n)
	for i := 0; i < n; i++ {
		b.WriteByte(chars[rng.Intn(len(chars))])
	}
	return b.String()
}

func randomNumberCode(n int) string {
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	var b strings.Builder
	b.Grow(n)
	for i := 0; i < n; i++ {
		b.WriteByte(byte('0' + rng.Intn(10)))
	}
	return b.String()
}

func renderCaptchaPNG(code string) ([]byte, error) {
	w, h := 120, 40
	img := image.NewRGBA(image.Rect(0, 0, w, h))
	draw.Draw(img, img.Bounds(), &image.Uniform{C: color.RGBA{R: 250, G: 250, B: 250, A: 255}}, image.Point{}, draw.Src)

	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	for i := 0; i < 8; i++ {
		x0 := rng.Intn(w)
		y0 := rng.Intn(h)
		x1 := rng.Intn(w)
		y1 := rng.Intn(h)
		drawLine(img, x0, y0, x1, y1, color.RGBA{R: uint8(rng.Intn(150)), G: uint8(rng.Intn(150)), B: uint8(rng.Intn(150)), A: 255})
	}

	d := &font.Drawer{Dst: img, Src: image.NewUniform(color.RGBA{R: 30, G: 30, B: 30, A: 255}), Face: basicfont.Face7x13}
	for i, ch := range code {
		d.Dot = fixed.P(10+i*25+rng.Intn(3), 25+rng.Intn(6))
		d.DrawString(string(ch))
	}

	var buf bytes.Buffer
	if err := png.Encode(&buf, img); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func drawLine(img *image.RGBA, x0, y0, x1, y1 int, col color.RGBA) {
	dx := abs(x1 - x0)
	sx := -1
	if x0 < x1 {
		sx = 1
	}
	dy := -abs(y1 - y0)
	sy := -1
	if y0 < y1 {
		sy = 1
	}
	err := dx + dy
	for {
		img.SetRGBA(x0, y0, col)
		if x0 == x1 && y0 == y1 {
			break
		}
		e2 := 2 * err
		if e2 >= dy {
			err += dy
			x0 += sx
		}
		if e2 <= dx {
			err += dx
			y0 += sy
		}
	}
}

func abs(x int) int {
	if x < 0 {
		return -x
	}
	return x
}

func doubleMD5WithSalt(text string) string {
	const salt = "XM/fie#!89"
	first := md5Hex(text)
	return md5Hex(first + salt)
}

func md5Hex(s string) string {
	sum := md5.Sum([]byte(s))
	return strings.ToLower(hex.EncodeToString(sum[:]))
}

var (
	emailRe = regexp.MustCompile("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")
	phoneRe = regexp.MustCompile("^1[\\d]{10}$")
)

func base64UUID() string {
	b := make([]byte, 16)
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	_, _ = rng.Read(b)
	return base64StdEncode(b)
}

func base64StdEncode(b []byte) string {
	const enc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
	if len(b) == 0 {
		return ""
	}
	var out bytes.Buffer
	for i := 0; i < len(b); i += 3 {
		var n uint32
		remain := len(b) - i
		if remain >= 3 {
			n = uint32(b[i])<<16 | uint32(b[i+1])<<8 | uint32(b[i+2])
			out.WriteByte(enc[(n>>18)&0x3F])
			out.WriteByte(enc[(n>>12)&0x3F])
			out.WriteByte(enc[(n>>6)&0x3F])
			out.WriteByte(enc[n&0x3F])
			continue
		}
		if remain == 2 {
			n = uint32(b[i])<<16 | uint32(b[i+1])<<8
			out.WriteByte(enc[(n>>18)&0x3F])
			out.WriteByte(enc[(n>>12)&0x3F])
			out.WriteByte(enc[(n>>6)&0x3F])
			out.WriteByte('=')
			continue
		}
		n = uint32(b[i]) << 16
		out.WriteByte(enc[(n>>18)&0x3F])
		out.WriteByte(enc[(n>>12)&0x3F])
		out.WriteByte('=')
		out.WriteByte('=')
	}
	return out.String()
}

func locateJavaResource(name string) (string, error) {
	wd, err := os.Getwd()
	if err != nil {
		return "", err
	}
	for i := 0; i < 8; i++ {
		path := filepath.Join(wd, "codebase", "server", "src", "main", "resources", name)
		if _, err := os.Stat(path); err == nil {
			return path, nil
		}
		parent := filepath.Dir(wd)
		if parent == wd {
			break
		}
		wd = parent
	}
	return "", errors.New("resource not found")
}

func jsonClone(v any) string {
	bs, _ := json.Marshal(v)
	return string(bs)
}
