WEBCONSOLE_PROJECT_DIR := build
WEBCONSOLE_REPO_URL := https://github.com/omec-project/webconsole.git

.PHONY: clean build-npm build-go clone-npm-project
clone-webconsole:
	@if [ ! -d "build" ]; then                   \
		echo "make: cloning webconsole";         \
		git clone $(WEBCONSOLE_REPO_URL) build;  \
	else                                         \
		echo "make: already cloned webconsole."; \
	fi

nms: clone-webconsole
	echo "make: building nms"
	npm install && npm run build

webconsole: nms clone-webconsole
	echo "make: building webconsole"
	rm -rf $(WEBCONSOLE_PROJECT_DIR)/ui/frontend_files/*
	cp -R out/* $(WEBCONSOLE_PROJECT_DIR)/ui/frontend_files
	cd $(WEBCONSOLE_PROJECT_DIR) && go build --tags ui -o $(WEBCONSOLE_PROJECT_DIR)/$@ ./server.go
	mkdir -p artifacts
	cp -R $(WEBCONSOLE_PROJECT_DIR)/build/* artifacts/

run:
	echo "make: running webconsole locally"
	cd examples && ../artifacts/webconsole

rock: webconsole
	echo "make: building oci image with a local version of webconsole"
	mv rockcraft.yaml rockcraft_default.yaml
	sed "s/source-type.*//; s/source-tag.*//; s/source: https.*/source: .\/build/" rockcraft_default.yaml > rockcraft.yaml
	rockcraft pack
	mv rockcraft_default.yaml rockcraft.yaml

deploy: 
	echo "make: deploying nms image to lxd"
	@if [ -z "$$(lxc list | grep nms)" ]; then     		\
		lxc launch ubuntu:24.04 --vm nms; 		        \
	else 												\
		echo "make: using already available instance."; \
	fi
	# sleep 5
	lxc exec nms -- snap install docker --classic
	lxc exec nms -- snap install rockcraft --classic
	lxc exec nms -- docker pull mongo:noble 
	
	@if [ -z "$$(lxc exec nms -- docker ps | grep mongodb)" ]; then 	\
		lxc exec nms -- docker run --name mongodb -d --network host mongo:noble \
	else 											\
		echo "make: mongodb already running."; \
	fi
	
	lxc file push sdcore-nms_1.0.0_amd64.rock nms/root/sdcore.rock
	lxc file push examples/config/webuicfg.yaml nms/root/
	
	@if [ -n "$$(lxc exec nms -- docker ps | grep nms)" ]; then 	\
		lxc exec nms -- docker stop nms;   			\
		lxc exec nms -- docker rm nms;			\
	else 											\
		echo "make: nms not running."; \
	fi
	lxc exec nms -- rockcraft.skopeo --insecure-policy copy oci-archive:sdcore.rock docker-daemon:nms:latest
	lxc exec nms -- docker run -d \
		--name nms \
		-e WEBUI_ENDPOINT=localhost:5000 \
		-v /root/webuicfg.yaml:/config/webuicfg.yaml \
		--network host \
		nms:latest

hotswap: webconsole
	echo "make: replacing nms binary with new binary"
	lxc file push artifacts/webconsole nms/root/
	lxc exec nms -- docker cp ./webconsole nms:/bin/webconsole
	lxc exec nms -- docker exec nms pebble restart nms

watch: 
	echo "make: watching for changes in nms and hotswapping when a change is detected"

clean:
	rm -rf out
	rm -rf artifacts
	rm -rf $(WEBCONSOLE_PROJECT_DIR)
	lxc stop nms
	lxc delete nms

