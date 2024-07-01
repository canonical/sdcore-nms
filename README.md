# Aether SD-Core NMS

A Network Management System for managing the Aether SD-Core 5G core network.

![Screenshot](images/nms_screenshot.png)

## Usage

NMS needs to be configured with the following environment variables:
- `UPF_CONFIG_PATH`: The path to the UPF configuration file. An example of this file can be seen in the `examples/` directory.
- `GNB_CONFIG_PATH`: The path to the gNodeB configuration file. An example of this file can be seen in the `examples/` directory.

```console
export UPF_CONFIG_PATH=/path/to/upf_config.json
export GNB_CONFIG_PATH=/path/to/gnb_config.json

docker pull ghcr.io/canonical/sdcore-nms:0.2.0
docker run -it --env UPF_CONFIG_PATH --env GNB_CONFIG_PATH ghcr.io/canonical/sdcore-nms:0.2.0
```
