ROOT_DIR := $(shell pwd)
ADMIN_DIR := $(ROOT_DIR)

.PHONY: tab build

## 在现有 Terminal 窗口中新建一个 tab 标签，并 cd 到 Viewers 目录
tab:
	@osascript \
	    -e 'tell application "Terminal"' \
	    -e 'activate' \
	    -e 'tell application "System Events" to keystroke "t" using command down' \
	    -e 'delay 0.5' \
	    -e 'do script "cd $(ADMIN_DIR) && yarn run dev" in (selected tab of front window)' \
	    -e 'end tell'
