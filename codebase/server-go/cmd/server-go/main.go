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

package main

import (
	"context"
	"errors"
	"fmt"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"xmadmin/server-go/internal/config"
	"xmadmin/server-go/internal/db"
	"xmadmin/server-go/internal/httpx"
	"xmadmin/server-go/internal/redix"
)

// main 启动 server-go：加载配置，初始化 MySQL/Redis，并启动 HTTP 服务。
func main() {
	cfg, err := config.Load()
	if err != nil {
		panic(err)
	}

	if err := config.LoadPerms(); err != nil {
		panic(err)
	}

	mysqlDB, err := db.OpenMySQL(cfg)
	if err != nil {
		panic(err)
	}
	defer mysqlDB.Close()

	rdb, err := redix.Open(cfg)
	if err != nil {
		panic(err)
	}
	defer rdb.Close()

	router := httpx.NewRouter(cfg, mysqlDB, rdb)

	srv := &http.Server{
		Addr:              cfg.HTTP.Addr(),
		Handler:           router,
		ReadHeaderTimeout: 10 * time.Second,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			var opErr *net.OpError
			if errors.As(err, &opErr) && errors.Is(opErr.Err, syscall.EADDRINUSE) {
				_, _ = fmt.Fprintf(os.Stderr, "listen %s failed: %v\n", srv.Addr, err)
				_, _ = fmt.Fprintln(os.Stderr, "port is already in use. stop the process using this port, or set SERVER_GO_PORT to another port (e.g. 81).")
				os.Exit(1)
			}
			_, _ = fmt.Fprintf(os.Stderr, "listen %s failed: %v\n", srv.Addr, err)
			os.Exit(1)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = srv.Shutdown(ctx)
}
