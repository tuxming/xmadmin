# server-go

`server-go` 是对 `codebase/server`（Java/JFinal）后端的 Go 版本实现，目标是对外 API 路径与主要返回结构保持兼容。

## 环境要求

- **Go 版本**: >= 1.20 （当前开发环境基于 Go 1.24.5）

## 本地开发与测试

在 `codebase/server-go` 目录执行：

```bash
# 整理依赖
go mod tidy

# 运行服务
go run ./cmd/server-go
```

默认优先读取 `server-go` 自己的配置（已从 Java 版本复制一份，便于独立运行）：

- `codebase/server-go/config/application.properties`
- `codebase/server-go/config/config.properties` / `config-pro.properties`
- `codebase/server-go/config/undertow.properties`

配置文件仅读取本项目的 `codebase/server-go/config/*.properties`。

### 单元测试验证

```bash
go test ./...
```

健康检查接口：`GET /healthz`

## Linux 服务器部署

在开发机器或构建机上，针对 Linux 环境进行交叉编译：

```bash
# 设置环境变量编译 Linux 可执行文件
GOOS=linux GOARCH=amd64 go build -o server-go-app ./cmd/server-go
```

将编译好的 `server-go-app` 文件以及 `config`、`assets` 等相关目录上传到服务器，例如放在 `/opt/xmadmin/` 目录下。

在服务器上运行：
```bash
cd /opt/xmadmin
chmod +x server-go-app
# 后台运行
nohup ./server-go-app > app.log 2>&1 &
```

建议使用 `systemd` 或者 `supervisor` 等工具进行进程管理。

## 环境变量覆盖

支持使用环境变量覆盖配置文件中的配置：

- `SERVER_GO_ENV`：`dev` / `pro`
- `SERVER_GO_HTTP_HOST`、`SERVER_GO_HTTP_PORT`
- `SERVER_GO_MYSQL_DSN`
- `SERVER_GO_REDIS_ADDR`、`SERVER_GO_REDIS_PASSWORD`
- `SERVER_GO_UPLOAD_PATH`
- `SERVER_GO_JWT_SECRET_BASE64`
