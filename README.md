# Aether SD-Core NMS

A Network Management System for managing the Aether SD-Core 5G core network.

![Screenshot](images/nms_screenshot.png)

## Usage

NMS needs to be configured with the following environment variables:
- `WEBUI_ENDPOINT`: The endpoint of the webui. This is used to redirect the swagger operations to the webui.

```console
export WEBUI_ENDPOINT=10.1.182.28:5000

docker pull ghcr.io/canonical/sdcore-nms:<version>
docker run -it --env WEBUI_ENDPOINT ghcr.io/canonical/sdcore-nms:<version>
```
