import { handleGetNetworkSlice, handlePostNetworkSlice } from "@/utils/handleNetworkSlice";
import { handleGetDeviceGroup, handlePostDeviceGroup } from "@/utils/handleDeviceGroup";

interface DeviceGroupArgs {
  name: string;
  ueIpPool: string;
  dns: string;
  mtu: number;
  MBRUpstreamBps: number;
  MBRDownstreamBps: number;
  networkSliceName: string;
}

export const createDeviceGroup = async ({
  name,
  ueIpPool,
  dns,
  mtu,
  MBRUpstreamBps,
  MBRDownstreamBps,
  networkSliceName,
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
    const getDeviceGroupResponse = await handleGetDeviceGroup(name);
    if (getDeviceGroupResponse.ok) {
      throw new Error("Device group already exists");
    }

    const postDeviceGroupResponse = await handlePostDeviceGroup(name, deviceGroupData);
    if (!postDeviceGroupResponse.ok) {
      throw new Error(
        `Error creating device group. Error code: ${postDeviceGroupResponse.status}`,
      );
    }

    const existingSliceResponse = await handleGetNetworkSlice(networkSliceName);
    var existingSliceData = await existingSliceResponse.json();

    if (!existingSliceData["site-device-group"]) {
      existingSliceData["site-device-group"] = [];
    }

    existingSliceData["site-device-group"].push(name);

    const updateSliceResponse = await handlePostNetworkSlice(networkSliceName, existingSliceData);

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
