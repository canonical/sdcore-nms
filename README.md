<div align="center">
  <img src="./onf-icon.svg" alt="ONF Icon" width="200" height="200">
</div>
<br/>
<div align="center">
  <h1>SD-Core NMS</h1>
</div>

A Network Management System for managing the SD-Core 5G core network.

## Usage

The NMS server needs to have access to a UPF configuration file that contains. An example of this file can be seen in `examples/upf_config.json`.

```console
export UPF_CONFIG_PATH=/path/to/upf_config.json
docker pull ghcr.io/canonical/sdcore-nms:0.1
docker run -it --env UPF_CONFIG_PATH ghcr.io/canonical/sdcore-nms:0.1
```
