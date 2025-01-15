# Aether SD-Core NMS

A Network Management System for managing the Aether SD-Core 5G core network.

![Screenshot](images/nms_screenshot.png)

## Usage

The NMS has a swagger UI page that rus by default on `localhost`. If the NMS will run remotely, set the following environment.
```console
export WEBUI_ENDPOINT=<NMS-ip>:5000
```

Run the NMS as follows:

```console
docker pull ghcr.io/canonical/sdcore-nms:1.1.0
docker run -it --env WEBUI_ENDPOINT  -v <path-to-config-file>:/config/webuicfg.yaml -p 5000:5000 ghcr.io/canonical/sdcore-nms:1.1.0
```

An example of the config file can be found in `examples/config/webuicfg.yaml`
