import { apiGetNetworkSlice, apiPostNetworkSlice } from "@/utils/callNetworkSliceApi";
import { apiPostDeviceGroup } from "@/utils/callDeviceGroupApi";

interface GnbItem {
  name: string;
  tac: number;
}

interface CreateNetworkSliceArgs {
  name: string;
  mcc: string;
  mnc: string;
  upfName: string;
  upfPort: string;
  gnbList: GnbItem[];
  token: string;
}

export const createNetworkSlice = async ({
  name,
  mcc,
  mnc,
  upfName,
  upfPort,
  gnbList,
  token
}: CreateNetworkSliceArgs) => {
  const deviceGroupName = `${name}-default`;
  const sliceData = {
    "slice-id": {
      sst: "1",
      sd: "102030",
    },
    "site-device-group": [deviceGroupName],
    "site-info": {
      "site-name": "demo",
      plmn: {
        mcc,
        mnc,
      },
      gNodeBs: gnbList,
      upf: {
        "upf-name": upfName,
        "upf-port": upfPort,
      },
    },
  };

  const deviceGroupData = {
    "site-info": "demo",
    "ip-domain-name": "pool1",
    "ip-domain-expanded": {
      dnn: "internet",
      "ue-ip-pool": "172.250.1.0/16",
      "dns-primary": "8.8.8.8",
      mtu: 1456,
      "ue-dnn-qos": {
        "dnn-mbr-uplink": 20 * 1000000,
        "dnn-mbr-downlink": 200 * 1000000,
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
    const getNetworkSliceResponse = await apiGetNetworkSlice(name, token)
    if (getNetworkSliceResponse.ok) {
      throw new Error("Network slice already exists");
    }

    const devicegroupResponse = await apiPostDeviceGroup(deviceGroupName, deviceGroupData, token);
    if (!devicegroupResponse.ok) {
      throw new Error(
        `Error creating device group. Error code: ${devicegroupResponse.status}`,
      );
    }

    const updateNetworkSliceResponse = await apiPostNetworkSlice(name, sliceData, token);
    if (!updateNetworkSliceResponse.ok) {
      const networkSliceData = await updateNetworkSliceResponse.json();
      if (networkSliceData.error) {
        throw new Error(networkSliceData.error);
      }
      debugger;
      throw new Error(
        `Error creating network slice. Error code: ${updateNetworkSliceResponse.status}`,
      );
    }

    return updateNetworkSliceResponse.json();
  } catch (error: unknown) {
    console.error(error);
    const details =
      error instanceof Error
        ? error.message
        : "Failed to configure the network.";
    throw new Error(details);
  }
};
