BUILD_FOLDER := build
ARTIFACT_FOLDER := artifacts

WEBCONSOLE_PROJECT_DIR := webconsole-src
WEBCONSOLE_FILES := $(shell find $(BUILD_FOLDER)/$(WEBCONSOLE_PROJECT_DIR) -regex ".*\.go" 2> /dev/null)
WEBCONSOLE_REPO_URL := https://github.com/omec-project/webconsole.git
WEBCONSOLE_ARTIFACT_NAME := webconsole

NMS_FILES := $(shell find app components images utils -type f) package.json package-lock.json
NMS_ARTIFACT_NAME := nms-static

ROCK_ARTIFACT_NAME := sdcore-nms.rock

$(shell   mkdir -p $(BUILD_FOLDER))
$(shell   mkdir -p $(ARTIFACT_FOLDER))

webconsole: $(ARTIFACT_FOLDER)/$(WEBCONSOLE_ARTIFACT_NAME)
	@echo "Built Webconsole with frontend"

rock: $(ARTIFACT_FOLDER)/$(ROCK_ARTIFACT_NAME)
	@echo "Built rock with local webconsole"

deploy: rockcraft.yaml
	@if [ "$$(lxc list 2> /dev/null | grep nms > /dev/null; echo $$?)" = 1 ]; then \
		echo "creating new NMS VM instance in LXD"; \
		lxc launch ubuntu:24.04 --vm nms; \
	fi
	@echo "waiting for the VM to start"
	@while [ "$$(lxc info nms 2> /dev/null | grep Processes | grep "\-1" > /dev/null; echo $$?)" = 0 ]; do sleep 2; done 
	@echo "waiting for the vm to work"
	sleep 10
	lxc exec nms -- snap install docker --classic
	lxc exec nms -- snap install rockcraft --classic
	lxc exec nms -- docker pull mongo:noble 	
	@if [ "$$(lxc exec nms -- docker ps 2> /dev/null | grep mongodb > /dev/null; echo $$?)" = 1 ]; then \
		echo "creating and running MongoDB as a replica set in Docker"; \
		lxc exec nms -- docker run -d \
			--name mongodb \
			--network host \
			-e MONGO_REPLICA_SET_NAME=rs0 \
			mongo:noble --replSet rs0; \
		sleep 10; \
		echo "Initializing replica set"; \
		lxc exec nms -- docker exec mongodb mongosh --eval 'rs.initiate({_id: "rs0", members: [{_id: 0, host: "127.0.0.1:27017"}]})'; \
	fi

	lxc file push $(ARTIFACT_FOLDER)/$(ROCK_ARTIFACT_NAME) nms/root/$(ROCK_ARTIFACT_NAME)
	lxc file push examples/config/webuicfg.yaml nms/root/
	@if [ "$$(lxc exec nms -- docker ps 2> /dev/null | grep nms > /dev/null; echo $$?)" = 0 ]; then \
		echo "removing old nms container"; \
		lxc exec nms -- docker stop nms; \
		lxc exec nms -- docker rm nms; \
	fi
	
	lxc exec nms -- rockcraft.skopeo --insecure-policy copy oci-archive:sdcore-nms.rock docker-daemon:nms:latest
	lxc exec nms -- docker run -d \
		--name nms \
		-e WEBUI_ENDPOINT=$$(lxc info nms | grep enp5s0 -A 15 | grep inet: | grep -oE '([0-9]{1,3}\.){3}[0-9]{1,3}'):5000 \
		-v /root/webuicfg.yaml:/config/webuicfg.yaml \
		--network host \
		nms:latest --verbose
	@echo "You can access NMS at $$(lxc info nms | grep enp5s0 -A 15 | grep inet: | grep -oE '([0-9]{1,3}\.){3}[0-9]{1,3}'):5000"

hotswap: artifacts/webconsole examples/config/webuicfg.yaml
	@echo "make: replacing nms binary with new binary"
	lxc file push artifacts/webconsole nms/root/
	lxc file push examples/config/webuicfg.yaml nms/root/
	lxc exec nms -- docker cp ./webconsole nms:/bin/webconsole
	lxc exec nms -- docker exec nms pebble restart nms

logs:
	lxc exec nms -- docker logs nms --tail 20

clean:
	rm -rf $(BUILD_FOLDER)
	rm -rf $(ARTIFACT_FOLDER)
	-lxc stop nms
	-lxc delete nms

clean-vm:
	-lxc stop nms
	-lxc delete nms

$(BUILD_FOLDER)/fetch-repo:
	-git clone $(WEBCONSOLE_REPO_URL) $(BUILD_FOLDER)/$(WEBCONSOLE_PROJECT_DIR)
	touch $(BUILD_FOLDER)/fetch-repo

$(BUILD_FOLDER)/$(NMS_ARTIFACT_NAME): $(NMS_FILES)
	@npm install && npm run build
	rm -rf $@
	mv out $@

$(ARTIFACT_FOLDER)/$(WEBCONSOLE_ARTIFACT_NAME): $(BUILD_FOLDER)/fetch-repo $(WEBCONSOLE_FILES) $(BUILD_FOLDER)/$(NMS_ARTIFACT_NAME)
	rm -rf $(BUILD_FOLDER)/$(WEBCONSOLE_PROJECT_DIR)/ui/frontend_files/*
	cp -R $(BUILD_FOLDER)/$(NMS_ARTIFACT_NAME)/* $(BUILD_FOLDER)/$(WEBCONSOLE_PROJECT_DIR)/ui/frontend_files
	cd $(BUILD_FOLDER)/$(WEBCONSOLE_PROJECT_DIR) && go build --tags ui -o $(WEBCONSOLE_ARTIFACT_NAME) ./server.go

	mv $(BUILD_FOLDER)/$(WEBCONSOLE_PROJECT_DIR)/$(WEBCONSOLE_ARTIFACT_NAME) $@

$(ARTIFACT_FOLDER)/$(ROCK_ARTIFACT_NAME): $(ARTIFACT_FOLDER)/$(WEBCONSOLE_ARTIFACT_NAME) rockcraft.yaml
	@echo "make: building oci image with a local version of webconsole"
	mv rockcraft.yaml rockcraft_default.yaml
	sed "s~source-type.*~~; s~source-tag.*~~; s~source: https.*~source: .\/$(BUILD_FOLDER)/$(WEBCONSOLE_PROJECT_DIR)~" rockcraft_default.yaml > rockcraft.yaml
	-rockcraft pack
	mv rockcraft_default.yaml rockcraft.yaml
	@if [ -n "$$(ls | grep *.rock)" ]; then \
		mv $$(ls | grep *.rock) $@; \
	fi

