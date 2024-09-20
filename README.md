# Aether SD-Core NMS

A Network Management System for managing the Aether SD-Core 5G core network.

The NMS is a component that provides a user interface (UI) for configuring the 5G core network in Aether SD-Core.

![Screenshot](images/nms_screenshot.png)

## Usage

NMS needs to be configured with the following environment variables:
- `WEBUI_ENDPOINT`: The endpoint of the webui. This is used to redirect the swagger operations to the webui. If not set, `localhost:5000` will be used.

```console
export WEBUI_ENDPOINT=<webui_ip>:5000

docker pull ghcr.io/canonical/sdcore-nms:<version>
docker run -it --env WEBUI_ENDPOINT ghcr.io/canonical/sdcore-nms:<version>
```
