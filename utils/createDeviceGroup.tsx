import { apiGetNetworkSlice, apiPostNetworkSlice } from "@/utils/callNetworkSliceApi";
import { apiGetDeviceGroup, apiPostDeviceGroup } from "@/utils/callDeviceGroupApi";

interface DeviceGroupArgs {
  name: string;
  ueIpPool: string;
  dns: string;
  mtu: number;
  MBRUpstreamBps: number;
  MBRDownstreamBps: number;
  networkSliceName: string;
  token: string;
}

export const createDeviceGroup = async ({
  name,
  ueIpPool,
  dns,
  mtu,
  MBRUpstreamBps,
  MBRDownstreamBps,
  networkSliceName,
  token
}: DeviceGroupArgs) => {
  const deviceGroupData = {
    "site-info": "demo",
    "ip-domain-name": "pool1",
    "ip-domain-expanded": {
      dnn: "internet",
      "ue-ip-pool": ueIpPool,
      "dns-primary": dns,
      mtu: mtu,
      "ue-dnn-qos": {
        "dnn-mbr-uplink": MBRUpstreamBps,
        "dnn-mbr-downlink": MBRDownstreamBps,
        "bitrate-unit": "bps",
        "traffic-class": {
          name: "platinum",
          arp: 6,
          pdb: 300,
          pelr: 6,
          qci: 8,
        },
      },
    },
  };

  try {
    const getDeviceGroupResponse = await apiGetDeviceGroup(name, token);
    if (getDeviceGroupResponse.ok) {
      throw new Error("Device group already exists");
    }

    const updateDeviceGroupResponse = await apiPostDeviceGroup(name, deviceGroupData, token);
    if (!updateDeviceGroupResponse.ok) {
      throw new Error(
        `Error creating device group. Error code: ${updateDeviceGroupResponse.status}`,
      );
    }

    const existingSliceResponse = await apiGetNetworkSlice(networkSliceName, token);
    var existingSliceData = await existingSliceResponse.json();

    if (!existingSliceData["site-device-group"]) {
      existingSliceData["site-device-group"] = [];
    }
    existingSliceData["site-device-group"].push(name);

    const updateSliceResponse = await apiPostNetworkSlice(networkSliceName, existingSliceData, token);
    if (!updateSliceResponse.ok) {
      throw new Error(
        `Error updating network slice. Error code: ${updateSliceResponse.status}`,
      );
    }

    return true;
  } catch (error: unknown) {
    console.error(error);
    const details =
      error instanceof Error
        ? error.message
        : "Failed to configure the network.";
    throw new Error(details);
  }
};
