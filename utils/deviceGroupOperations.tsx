import { apiGetNetworkSlice, apiPostNetworkSlice, getNetworkSlices } from "@/utils/networkSliceOperations";
import { NetworkSlice, DeviceGroup } from "@/components/types";
import { WebconsoleApiError, OperationError } from "@/utils/errors";


const FIVEQI_MAP = new Map<number, { pdb: number; pelr: number }>([
  [1, { pdb: 100, pelr: 2 }],
  [2, { pdb: 150, pelr: 3 }],
  [9, { pdb: 300, pelr: 6 }],
]);

export const getQosCharacteristics = (qci: number): { pdb: number; pelr: number } | null => {
  return FIVEQI_MAP.get(qci) || null;
};

function isValidDeviceGroupName(name: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9-_]+$/.test(name);
}

export const apiGetAllDeviceGroupNames = async (token: string): Promise<string[]> => {
  try {
    const response = await fetch(`/config/v1/device-group/`, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
    });
    const respData = await response.json();
    if (!response.ok) {
      throw new WebconsoleApiError(response.status, respData.error);
    }
    return respData
  } catch (error) {
    console.error(`Error retrieving device group list: ${error}`);
    throw error;
  }
};

export async function apiGetDeviceGroup(name: string, token: string): Promise<Response> {
  if (!isValidDeviceGroupName(name)) {
    throw new OperationError(`Error getting device group: Invalid name provided ${name}.`);
  }
  try {
    return await fetch(`/config/v1/device-group/${name}`, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    console.error(`Error retrieving device group: ${error}`);
    throw error;
  }
};

export async function apiPostDeviceGroup(name: string, deviceGroupData: any, token: string): Promise<void> {
  if (!isValidDeviceGroupName(name)) {
    throw new OperationError(`Error updating device group: Invalid name provided ${name}.`);
  }
  try {
    const response = await fetch(`/config/v1/device-group/${name}`, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(deviceGroupData),
    });
    if (!response.ok) {
      const respData = await response.json();
      throw new WebconsoleApiError(response.status, respData.error);
    }
  } catch (error) {
    console.error(`Error in POST device group ${name}: ${error}`);
    throw error;
  }
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

export async function createDeviceGroup({
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
}: CreateDeviceGroupArgs): Promise<void> {

  const qosCharacteristics = getQosCharacteristics(qos5qi);
  if (!qosCharacteristics) {
    console.error(`invalid QoS 5QI ${qos5qi}`);
    throw new OperationError("Failed to create device group: invalid QoS 5QI");
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
          pdb: qosCharacteristics?.pdb,
          pelr: qosCharacteristics?.pelr,
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

    await apiPostDeviceGroup(name, deviceGroupData, token);

    const getNetworkSliceResponse = await apiGetNetworkSlice(networkSliceName, token);
    var existingSliceData = await getNetworkSliceResponse.json();
    if (!getNetworkSliceResponse.ok) {
      throw new WebconsoleApiError(getNetworkSliceResponse.status, existingSliceData.error);
    }
    if (!existingSliceData["site-device-group"]) {
      existingSliceData["site-device-group"] = [];
    }
    existingSliceData["site-device-group"].push(name);
    await apiPostNetworkSlice(networkSliceName, existingSliceData, token);

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

export async function editDeviceGroup({
  name,
  ueIpPool,
  dns,
  mtu,
  MBRUpstreamBps,
  MBRDownstreamBps,
  qos5qi,
  qosArp,
  token
}: EditDeviceGroupArgs): Promise<void> {
    const qosCharacteristics = getQosCharacteristics(qos5qi);
    if (!qosCharacteristics) {
      console.error(`invalid QoS 5QI ${qos5qi}`);
      throw new OperationError("Failed to create device group: invalid QoS 5QI");
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
            pdb: qosCharacteristics?.pdb,
            pelr: qosCharacteristics?.pelr,
            qci: qos5qi,
          },
        },
      },
    };

    await apiPostDeviceGroup(name, deviceGroupData, token);

  } catch (error: unknown) {
    console.error(`Failed to edit device group ${name} : ${error}`);
    throw error;
  }
};

export async function getDeviceGroups(token: string): Promise<DeviceGroup[]> {
  try {
    const deviceGroupNames = await apiGetAllDeviceGroupNames(token);
    const networkSlices = await getNetworkSlices(token);
    const deviceGroups = await Promise.all(
      deviceGroupNames.map(async (deviceGroupName: string) => {
        const deviceGroup = await getDeviceGroup(deviceGroupName, token);
        const networkSliceName = findDeviceGroupNetworkSlice(deviceGroupName, networkSlices);
        return { ...deviceGroup, "network-slice": networkSliceName };
      })
    );
    return deviceGroups
  } catch (error) {
    console.error(`Failed to get device groups: ${error}`);
    throw error;
  }
};

async function getDeviceGroup(deviceGroupName: string, token: string): Promise<DeviceGroup> {
  try {
    const response = await apiGetDeviceGroup(deviceGroupName, token);
    const deviceGroup = await response.json();
    if (!response.ok) {
      throw new WebconsoleApiError(response.status, deviceGroup.error);
    }
    return deviceGroup as DeviceGroup;

  } catch (error) {
    console.error(`Failed to get device group ${deviceGroupName} : ${error}`);
    throw error;
  }
};

const findDeviceGroupNetworkSlice = (deviceGroupName: string, networkSlices: NetworkSlice[]): string => {
  for (const networkSlice of networkSlices) {
    if (networkSlice["site-device-group"] && networkSlice["site-device-group"].includes(deviceGroupName)) {
      return networkSlice["slice-name"];
    }
  }
  return "";
}


export async function deleteDeviceGroup(name: string, token: string): Promise<void> {
  if (!isValidDeviceGroupName(name)) {
    throw new OperationError(`Error deleting device group: Invalid name provided ${name}.`);
  }
  try {
    const response = await fetch(`/config/v1/device-group/${name}`, {
      method: "DELETE",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const respData = await response.json();
      throw new WebconsoleApiError(response.status, respData.error);
    }
  } catch (error) {
    console.error(`Error deleting device group ${name} ${error}`);
    throw error;
  }
};
