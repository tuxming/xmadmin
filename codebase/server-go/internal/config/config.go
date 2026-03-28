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

package config

import (
	"errors"
	"fmt"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

type Config struct {
	Env    string
	HTTP   HTTPConfig
	MySQL  MySQLConfig
	Redis  RedisConfig
	Upload UploadConfig
	JWT    JWTConfig
}

type HTTPConfig struct {
	Host        string
	Port        int
	ContextPath string
}

// Addr 返回 HTTP 监听地址（host:port），并提供默认值兜底。
func (c HTTPConfig) Addr() string {
	host := c.Host
	if host == "" {
		host = "0.0.0.0"
	}
	port := c.Port
	if port == 0 {
		port = 80
	}
	return fmt.Sprintf("%s:%d", host, port)
}

type MySQLConfig struct {
	DSN string
}

type RedisConfig struct {
	Addr     string
	Password string
	DB       int
}

type UploadConfig struct {
	BaseUploadPath   string
	BaseDownloadPath string
}

type JWTConfig struct {
	SecretBase64 string
	CookieName   string
	ExpireHours  int
	RefreshMin   int
}

// Load 加载配置：读取 `{baseDir}/config/*.properties`。
func Load() (*Config, error) {
	baseDir, err := findBaseDir()
	if err != nil {
		return nil, err
	}

	localCfgDir := filepath.Join(baseDir, "config")

	app, _ := readPropertiesFile(filepath.Join(localCfgDir, "application.properties"))
	env := strings.TrimSpace(app["pdev"])
	if env == "" {
		env = "dev"
	}
	if v := strings.TrimSpace(os.Getenv("SERVER_GO_ENV")); v != "" {
		env = v
	}

	cfgPropsName := "config.properties"
	if strings.EqualFold(env, "pro") {
		cfgPropsName = "config-pro.properties"
	}
	props, err := readPropertiesFile(filepath.Join(localCfgDir, cfgPropsName))
	if err != nil {
		return nil, fmt.Errorf("read %s: %w", cfgPropsName, err)
	}
	undertow, _ := readPropertiesFile(filepath.Join(localCfgDir, "undertow.properties"))

	host := strings.TrimSpace(undertow["undertow.host"])
	port := atoiDefault(strings.TrimSpace(undertow["undertow.port"]), 80)
	contextPath := strings.TrimSpace(undertow["undertow.contextPath"])
	if contextPath == "" {
		contextPath = "/"
	}
	if v := strings.TrimSpace(os.Getenv("SERVER_GO_HOST")); v != "" {
		host = v
	}
	if v := strings.TrimSpace(os.Getenv("SERVER_GO_PORT")); v != "" {
		port = atoiDefault(v, port)
	}
	if v := strings.TrimSpace(os.Getenv("PORT")); v != "" && strings.TrimSpace(os.Getenv("SERVER_GO_PORT")) == "" {
		port = atoiDefault(v, port)
	}

	jdbcURL := strings.TrimSpace(props["jdbc_url"])
	user := strings.TrimSpace(props["user"])
	password := strings.TrimSpace(props["password"])
	dsn, err := jdbcToMySQLDSN(jdbcURL, user, password)
	if err != nil {
		return nil, err
	}

	redisHost := strings.TrimSpace(props["redis.server"])
	redisPort := atoiDefault(strings.TrimSpace(props["redis.port"]), 6379)
	redisPwd := strings.TrimSpace(props["redis.password"])

	cfg := &Config{
		Env:   env,
		HTTP:  HTTPConfig{Host: host, Port: port, ContextPath: contextPath},
		MySQL: MySQLConfig{DSN: dsn},
		Redis: RedisConfig{Addr: fmt.Sprintf("%s:%d", redisHost, redisPort), Password: redisPwd, DB: 0},
		Upload: UploadConfig{
			BaseUploadPath:   strings.TrimSpace(props["base_upload_path"]),
			BaseDownloadPath: strings.TrimSpace(props["base_download_path"]),
		},
		JWT: JWTConfig{SecretBase64: "XM2013admin20240623", CookieName: "jwtToken", ExpireHours: 24, RefreshMin: 30},
	}

	applyOverrides(cfg)

	if cfg.MySQL.DSN == "" {
		return nil, errors.New("mysql dsn is empty")
	}
	if cfg.Redis.Addr == "" {
		return nil, errors.New("redis addr is empty")
	}
	return cfg, nil
}

// applyOverrides 应用环境变量覆盖项（用于开发/部署时快速调整配置）。
func applyOverrides(cfg *Config) {
	if v := strings.TrimSpace(os.Getenv("SERVER_GO_HTTP_HOST")); v != "" {
		cfg.HTTP.Host = v
	}
	if v := strings.TrimSpace(os.Getenv("SERVER_GO_HTTP_PORT")); v != "" {
		cfg.HTTP.Port = atoiDefault(v, cfg.HTTP.Port)
	}
	if v := strings.TrimSpace(os.Getenv("SERVER_GO_HTTP_CONTEXT_PATH")); v != "" {
		cfg.HTTP.ContextPath = v
	}
	if v := strings.TrimSpace(os.Getenv("SERVER_GO_MYSQL_DSN")); v != "" {
		cfg.MySQL.DSN = v
	}
	if v := strings.TrimSpace(os.Getenv("SERVER_GO_REDIS_ADDR")); v != "" {
		cfg.Redis.Addr = v
	}
	if v := strings.TrimSpace(os.Getenv("SERVER_GO_REDIS_PASSWORD")); v != "" {
		cfg.Redis.Password = v
	}
	if v := strings.TrimSpace(os.Getenv("SERVER_GO_UPLOAD_PATH")); v != "" {
		cfg.Upload.BaseUploadPath = v
	}
	if v := strings.TrimSpace(os.Getenv("SERVER_GO_JWT_SECRET_BASE64")); v != "" {
		cfg.JWT.SecretBase64 = v
	}
}

// atoiDefault 将字符串转为 int，失败时返回默认值。
func atoiDefault(s string, def int) int {
	n, err := strconv.Atoi(strings.TrimSpace(s))
	if err != nil {
		return def
	}
	return n
}

// findBaseDir 定位 server-go 的基础目录（部署时应以 server-go 为 basePath）。
func findBaseDir() (string, error) {
	if v := strings.TrimSpace(os.Getenv("SERVER_GO_BASE_DIR")); v != "" {
		return v, nil
	}

	wd, err := os.Getwd()
	if err != nil {
		return "", err
	}

	candidates := []string{wd}
	if exe, err := os.Executable(); err == nil {
		candidates = append(candidates, filepath.Dir(exe))
	}

	for _, start := range candidates {
		dir := start
		for i := 0; i < 8; i++ {
			if hasConfigFiles(dir) {
				return dir, nil
			}
			parent := filepath.Dir(dir)
			if parent == dir {
				break
			}
			dir = parent
		}
	}

	return "", errors.New("cannot locate server-go base dir (no config/*.properties found)")
}

func hasConfigFiles(baseDir string) bool {
	cfgDir := filepath.Join(baseDir, "config")
	if _, err := os.Stat(cfgDir); err != nil {
		return false
	}
	if _, err := os.Stat(filepath.Join(cfgDir, "application.properties")); err == nil {
		return true
	}
	if _, err := os.Stat(filepath.Join(cfgDir, "config.properties")); err == nil {
		return true
	}
	if _, err := os.Stat(filepath.Join(cfgDir, "config-pro.properties")); err == nil {
		return true
	}
	if _, err := os.Stat(filepath.Join(cfgDir, "undertow.properties")); err == nil {
		return true
	}
	return false
}

// readPropertiesFile 读取 Java properties 文件为 map。
func readPropertiesFile(path string) (map[string]string, error) {
	bs, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	lines := strings.Split(string(bs), "\n")
	m := make(map[string]string)
	for _, raw := range lines {
		line := strings.TrimSpace(strings.TrimRight(raw, "\r"))
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		idx := strings.Index(line, "=")
		if idx < 0 {
			continue
		}
		key := strings.TrimSpace(line[:idx])
		val := strings.TrimSpace(line[idx+1:])
		m[key] = val
	}
	return m, nil
}

// jdbcToMySQLDSN 将 JDBC URL + 用户密码转换为 MySQL DSN。
func jdbcToMySQLDSN(jdbcURL, user, password string) (string, error) {
	jdbcURL = strings.TrimSpace(jdbcURL)
	if jdbcURL == "" {
		return "", errors.New("jdbc_url is empty")
	}

	const prefix = "jdbc:mysql://"
	if !strings.HasPrefix(jdbcURL, prefix) {
		return "", fmt.Errorf("unsupported jdbc_url: %s", jdbcURL)
	}

	raw := strings.TrimPrefix(jdbcURL, prefix)
	parts := strings.SplitN(raw, "?", 2)
	hostDB := parts[0]
	query := ""
	if len(parts) == 2 {
		query = parts[1]
	}

	hostDB = strings.TrimSpace(hostDB)
	hostPort, dbName, ok := strings.Cut(hostDB, "/")
	if !ok {
		return "", fmt.Errorf("invalid jdbc_url (missing database name): %s", jdbcURL)
	}
	hostPort = strings.TrimSpace(hostPort)
	dbName = strings.TrimSpace(dbName)
	if hostPort == "" || dbName == "" {
		return "", fmt.Errorf("invalid jdbc_url (missing host or database): %s", jdbcURL)
	}

	urlValues, _ := url.ParseQuery(query)
	if v := urlValues.Get("characterEncoding"); v != "" {
		urlValues.Set("charset", v)
		urlValues.Del("characterEncoding")
	}
	urlValues.Del("serverTimezone")
	urlValues.Del("useSSL")
	urlValues.Del("autoReconnect")
	urlValues.Del("zeroDateTimeBehavior")

	allowed := map[string]struct{}{
		"allowAllFiles":           {},
		"allowCleartextPasswords": {},
		"allowNativePasswords":    {},
		"charset":                 {},
		"checkConnLiveness":       {},
		"clientFoundRows":         {},
		"collation":               {},
		"columnsWithAlias":        {},
		"interpolateParams":       {},
		"loc":                     {},
		"maxAllowedPacket":        {},
		"multiStatements":         {},
		"parseTime":               {},
		"readTimeout":             {},
		"rejectReadOnly":          {},
		"timeout":                 {},
		"tls":                     {},
		"writeTimeout":            {},
	}
	for k := range urlValues {
		if _, ok := allowed[k]; !ok {
			urlValues.Del(k)
		}
	}
	if urlValues.Get("parseTime") == "" {
		urlValues.Set("parseTime", "true")
	}
	if urlValues.Get("loc") == "" {
		urlValues.Set("loc", "Asia/Shanghai")
	}

	encoded := urlValues.Encode()
	if encoded != "" {
		encoded = "?" + encoded
	}

	if user == "" {
		user = "root"
	}

	return fmt.Sprintf("%s:%s@tcp(%s)/%s%s", user, password, hostPort, dbName, encoded), nil
}
