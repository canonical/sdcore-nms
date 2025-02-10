import { NetworkSlice, DeviceGroup } from "@/components/types";
import { apiGetDeviceGroup, apiGetAllDeviceGroups } from "@/utils/callDeviceGroupApi";
import { getNetworkSlices } from "@/utils/getNetworkSlices";
import { HTTPStatus } from "@/utils/utils";

export const getDeviceGroups = async (token: string): Promise<DeviceGroup[]> => {
  try {
    const deviceGroupResponse = await apiGetAllDeviceGroups(token);
    const deviceGroupNames = await deviceGroupResponse.json();
    if (!deviceGroupResponse.ok) {
        throw new Error(`${deviceGroupResponse.status}: ${HTTPStatus(deviceGroupResponse.status)}. ${deviceGroupNames.error}`)
    }
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
    console.error(error);
    throw error;
  }
};

export const getDeviceGroup = async (deviceGroupName: string, token: string): Promise<DeviceGroup> => {
  try {
    const response = await apiGetDeviceGroup(deviceGroupName, token);
    const deviceGroup = await response.json();
    if (!response.ok) {
      throw new Error(`${response.status}: ${HTTPStatus(response.status)}. ${deviceGroup.error}`)
  }
    return deviceGroup as DeviceGroup;

  } catch (error) {
    console.error(error);
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
