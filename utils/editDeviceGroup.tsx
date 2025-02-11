import { apiPostDeviceGroup } from "@/utils/callDeviceGroupApi";
import { getDeviceGroup } from "@/utils/getDeviceGroup";

interface EditDeviceGroupArgs {
  name: string;
  ueIpPool: string;
  dns: string;
  mtu: number;
  MBRUpstreamBps: number;
  MBRDownstreamBps: number;
  qos5qi: number;
  qosArp: number;
  token: string;
}

export const editDeviceGroup = async ({
  name,
  ueIpPool,
  dns,
  mtu,
  MBRUpstreamBps,
  MBRDownstreamBps,
  qos5qi,
  qosArp,
  token
}: EditDeviceGroupArgs) => {
  try {
    const currentConfig = await getDeviceGroup(name, token)
    var imsis = currentConfig["imsis"]

    const deviceGroupData = {
      "site-info": "demo",
      "imsis": imsis,
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
            arp: qosArp,
            pdb: 300,
            pelr: 6,
            qci: qos5qi,
          },
        },
      },
    };

    const response = await apiPostDeviceGroup(name, deviceGroupData, token);
    if (!response.ok) {
      throw new Error(
        `Error updating device group. Error code: ${response.status}`,
      );
    }
    return true;
  } catch (error: unknown) {
    console.error(error);
    const details =
      error instanceof Error
        ? error.message
        : "Failed to edit device group.";
    throw new Error(details);
  }
};
