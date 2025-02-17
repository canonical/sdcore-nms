import { apiGetNetworkSlice, apiPostNetworkSlice } from "@/utils/callNetworkSliceApi";
import { apiGetDeviceGroup, apiPostDeviceGroup } from "@/utils/callDeviceGroupApi";
import { getDeviceGroup } from "@/utils/getDeviceGroup";
import { HTTPStatus } from "@/utils/utils";
import  { WebconsoleApiError, OperationError}  from "@/utils/errors";

const QCI_MAP = new Map<number, { pdb: number; pelr: number }>([
  [1, { pdb: 100, pelr: 2 }],
  [2, { pdb: 150, pelr: 3 }],
  [9, { pdb: 300, pelr: 6 }],
]);

const getQCIValues = (qci: number): { pdb: number; pelr: number } | null => {
  return QCI_MAP.get(qci) || null;
};


interface CreateDeviceGroupArgs {
  name: string;
  ueIpPool: string;
  dns: string;
  mtu: number;
  MBRUpstreamBps: number;
  MBRDownstreamBps: number;
  networkSliceName: string;
  qos5qi: number;
  qosArp: number;
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
  qos5qi,
  qosArp,
  token
}: CreateDeviceGroupArgs) => {

  const cqiValues = getQCIValues(qos5qi)
  if (!cqiValues) {
    console.error(`invalid QOS 5QI ${qos5qi}`);
    throw new OperationError("Failed to create device group: invalid QOS");
  }
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
          arp: qosArp,
          pdb: cqiValues?.pdb,
          pelr: cqiValues?.pelr,
          qci: qos5qi,
        },
      },
    },
  };

  try {
    const getDeviceGroupResponse = await apiGetDeviceGroup(name, token);
    if (getDeviceGroupResponse.ok) {
      throw new OperationError("Device group already exists");
    }
    if (getDeviceGroupResponse.status !== 404) {
      const deviceGroupData = await getDeviceGroupResponse.json();
      throw new WebconsoleApiError(getDeviceGroupResponse.status, deviceGroupData.error);
    }

    const postDeviceGroupResponse = await apiPostDeviceGroup(name, deviceGroupData, token);
    if (!postDeviceGroupResponse.ok) {
      const postDeviceGroupData = await postDeviceGroupResponse.json();
      throw new WebconsoleApiError(postDeviceGroupResponse.status, postDeviceGroupData.error);
    }

    const getNetworkSliceResponse = await apiGetNetworkSlice(networkSliceName, token);
    var existingSliceData = await getNetworkSliceResponse.json();
    if (!getNetworkSliceResponse.ok) {
      throw new WebconsoleApiError(getNetworkSliceResponse.status, existingSliceData.error);
    }
    if (!existingSliceData["site-device-group"]) {
      existingSliceData["site-device-group"] = [];
    }
    existingSliceData["site-device-group"].push(name);

    const postNetworkSliceResponse = await apiPostNetworkSlice(networkSliceName, existingSliceData, token);
    if (!postNetworkSliceResponse.ok) {
      const postNetworkSliceData = await postNetworkSliceResponse.json();
      throw new WebconsoleApiError(postNetworkSliceResponse.status, postNetworkSliceData.error);
    }
  } catch (error: unknown) {
    console.error(`Failed to create device group ${name} : ${error}`);
    throw error;
  }
};



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
    const cqiValues = getQCIValues(qos5qi)
    if (!cqiValues) {
      console.error(`invalid QOS 5QI ${qos5qi}`);
      throw new OperationError("Failed to create device group: invalid QOS");
    }
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
            pdb: cqiValues?.pdb,
            pelr: cqiValues?.pelr,
            qci: qos5qi,
          },
        },
      },
    };

    const response = await apiPostDeviceGroup(name, deviceGroupData, token);
    if (!response.ok) {
      const responseData = await response.json();
      throw new WebconsoleApiError(response.status, responseData.error);
    }
  } catch (error: unknown) {
    console.error(`Failed to edit device group ${name} : ${error}`);
    throw error;
  }
};

