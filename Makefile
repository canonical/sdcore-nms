NMS_REPO_PATH ?= /path/to/nms/repo
WEBUI_REPO_PATH ?= /path/to/webui/repo
CONFIG_FILE_PATH ?= $(NMS_REPO_PATH)/example/webuicfg.yaml

all: clean build-node copy-files copy-config build-webui run-webui

build-node:
	@echo "Building NMS project..."
	cd $(NMS_REPO_PATH) && npm install && npm run build


copy-files:
	@echo "Copying generated files to the webui repo..."
	cp -r $(NMS_REPO_PATH)/out/* $(WEBUI_REPO_PATH)/ui/frontend_files/

copy-config:
	@echo "Copying config file to webui repo..."
	cp $(CONFIG_FILE_PATH) $(WEBUI_REPO_PATH)/config/webuicfg.yaml

build-webui:
	@echo "Building webui project..."
	cd $(WEBUI_REPO_PATH) && make webconsole-ui

run-webui:
	@echo "Launching webconsole-ui..."
	cd $(WEBUI_REPO_PATH) && ./bin/webconsole-ui

clean:
	@echo "Cleaning generated files..."
	rm -rf $(NMS_REPO_PATH)/out/*
	rm -rf $(WEBUI_REPO_PATH)/ui/frontend_files/*
	rm -f $(WEBUI_REPO_PATH)/config/webuicfg.yaml

.PHONY: all build-node copy-files copy-config build-webui run-webui clean