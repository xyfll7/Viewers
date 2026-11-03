ROOT_DIR := $(shell pwd)
ADMIN_DIR := $(ROOT_DIR)

# Docker 相关配置
DOCKER_IMAGE := ohif/viewer:taoding
DOCKER_PORT  := 8080
# APP_CONFIG 路径相对于 platform/app/public（见 .webpack/webpack.pwa.js:20,117）
APP_CONFIG   := config/default_taoding.js
CONTAINER_NAME := ohif-taoding

.PHONY: tab build docker-build docker-run docker-up docker-stop

## 构建 taoding 前端（执行 platform/app 的 build:taoding），压缩 dist 并打开 Finder
build:
	cd platform/app && yarn run build:taoding
	cd platform/app && rm -f dist.zip && zip -r dist.zip dist
	open -R $(ROOT_DIR)/platform/app/dist.zip

## 在现有 Terminal 窗口中新建一个 tab 标签，并 cd 到 Viewers 目录
tab:
	@osascript \
	    -e 'tell application "Terminal"' \
	    -e 'activate' \
	    -e 'tell application "System Events" to keystroke "t" using command down' \
	    -e 'delay 0.5' \
	    -e 'do script "cd $(ADMIN_DIR) && yarn run dev" in (selected tab of front window)' \
	    -e 'end tell'

## 构建 Docker 镜像（使用 taoding 配置）
docker-build:
	docker build \
		--build-arg APP_CONFIG=$(APP_CONFIG) \
		--build-arg PUBLIC_URL=/ \
		-t $(DOCKER_IMAGE) .

## 运行 Docker 容器（映射端口到宿主机）
docker-run:
	docker run -p $(DOCKER_PORT):80 --rm --name $(CONTAINER_NAME) $(DOCKER_IMAGE)

## 构建并运行（访问 http://localhost:8080
docker-up: docker-build docker-run

## 停止并删除容器
docker-stop:
	-docker stop $(CONTAINER_NAME)
	-docker rm $(CONTAINER_NAME)
