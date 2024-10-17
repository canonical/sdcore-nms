BUILD_FOLDER := build
ARTIFACT_FOLDER := artifacts

WEBCONSOLE_PROJECT_DIR := build/webconsole-src
WEBCONSOLE_FILES := $(filter-out $(WEBCONSOLE_PROJECT_DIR)/ui/frontend_files  $(WEBCONSOLE_PROJECT_DIR)/ui/frontend_files/*, $(wildcard $(WEBCONSOLE_PROJECT_DIR)/**/* $(WEBCONSOLE_PROJECT_DIR)/*))
WEBCONSOLE_REPO_URL := https://github.com/omec-project/webconsole.git
WEBCONSOLE_ARTIFACT_NAME := webconsole

NMS_FILES := $(wildcard app/**/* app/**/**/* components/**/* images/**/* utils/* package.json package-lock.json)
NMS_ARTIFACT_NAME := nms-static

ROCK_ARTIFACT_NAME := sdcore-nms.rock

$(shell   mkdir -p $(BUILD_FOLDER))
$(shell   mkdir -p $(ARTIFACT_FOLDER))

webconsole-ui: $(ARTIFACT_FOLDER)/$(WEBCONSOLE_ARTIFACT_NAME)
	@echo "Built Webconsole with frontend"

deploy: rockcraft.yaml
ifeq ($(shell lxc list | grep nms > /dev/null; echo $$?), 1)
	@echo "creating new NMS VM instance in LXD"
	lxc launch ubuntu:24.04 --vm nms
	sleep 10
endif

	lxc exec nms -- snap install docker --classic
	lxc exec nms -- snap install rockcraft --classic
	lxc exec nms -- docker pull mongo:noble 	
ifeq ($(shell lxc exec nms -- docker ps | grep mongodb > /dev/null; echo $$?), 1)
	@echo "creating and running mongodb in Docker"
	lxc exec nms -- docker run -d \
		--name mongodb \
		--network host \
		mongo:noble
endif

	lxc file push $(ARTIFACT_FOLDER)/$(ROCK_ARTIFACT_NAME) nms/root/$(ROCK_ARTIFACT_NAME)
	lxc file push examples/config/webuicfg.yaml nms/root/
ifeq ($(shell lxc exec nms -- docker ps | grep nms > /dev/null; echo $$?), 0)
	@echo "removing old nms container"
	lxc exec nms -- docker stop nms
	lxc exec nms -- docker rm nms
	sleep 2
endif

	lxc exec nms -- rockcraft.skopeo --insecure-policy copy oci-archive:sdcore-nms.rock docker-daemon:nms:latest
	lxc exec nms -- docker run -d \
		--name nms \
		-e WEBUI_ENDPOINT=localhost:5000 \
		-v /root/webuicfg.yaml:/config/webuicfg.yaml \
		--network host \
		nms:latest --verbose

hotswap: artifacts/webconsole
	@echo "make: replacing nms binary with new binary"
	lxc file push artifacts/webconsole nms/root/
	lxc file push examples/config/webuicfg.yaml nms/root/
	lxc exec nms -- docker cp ./webconsole nms:/bin/webconsole
	lxc exec nms -- docker exec nms pebble restart nms

clean:
	rm -rf $(BUILD_FOLDER)
	rm -rf $(ARTIFACT_FOLDER)
	-lxc stop nms
	-lxc delete nms

logs:
	lxc exec nms -- docker logs nms --tail 20


$(BUILD_FOLDER)/fetch-repo:
	-git clone $(WEBCONSOLE_REPO_URL) $(WEBCONSOLE_PROJECT_DIR)
	touch $(BUILD_FOLDER)/fetch-repo

$(BUILD_FOLDER)/$(NMS_ARTIFACT_NAME): $(NMS_FILES)
	@npm install && npm run build
	rm -rf $@
	mv out $@

$(ARTIFACT_FOLDER)/$(WEBCONSOLE_ARTIFACT_NAME): build/fetch-repo $(WEBCONSOLE_FILES) build/$(NMS_ARTIFACT_NAME)
	rm -rf $(WEBCONSOLE_PROJECT_DIR)/ui/frontend_files/*
	cp -R $(BUILD_FOLDER)/$(NMS_ARTIFACT_NAME)/* $(WEBCONSOLE_PROJECT_DIR)/ui/frontend_files
	cd $(WEBCONSOLE_PROJECT_DIR) && go build --tags ui -o $(WEBCONSOLE_ARTIFACT_NAME) ./server.go

	mv $(WEBCONSOLE_PROJECT_DIR)/$(WEBCONSOLE_ARTIFACT_NAME) $@

$(ARTIFACT_FOLDER)/$(ROCK_ARTIFACT_NAME): $(ARTIFACT_FOLDER)/$(WEBCONSOLE_ARTIFACT_NAME) rockcraft.yaml
	@echo "make: building oci image with a local version of webconsole"
	mv rockcraft.yaml rockcraft_default.yaml
	sed "s~source-type.*~~; s~source-tag.*~~; s~source: https.*~source: .\/$(WEBCONSOLE_PROJECT_DIR)~" rockcraft_default.yaml > rockcraft.yaml
	rockcraft pack
	mv rockcraft_default.yaml rockcraft.yaml
	mv $$(ls | grep *.rock) $@

