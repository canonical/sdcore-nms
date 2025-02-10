import { NetworkSlice, DeviceGroup } from "@/components/types";
import { apiGetDeviceGroup, apiGetAllDeviceGroups } from "@/utils/callDeviceGroupApi";
import { getNetworkSlices } from "@/utils/getNetworkSlices";

export const getDeviceGroupsFromNetworkSlice = async (token: string, slice?: NetworkSlice) => {
  if (!slice || !slice["site-device-group"]) {
    return [];
  }

  const allDeviceGroups = await Promise.all(
    slice["site-device-group"].map(async (name: string) =>
      await getDeviceGroup(name, token),
    ),
  );

  return allDeviceGroups.filter((item) => item !== undefined);
}

export const getDeviceGroups = async (token: string) => {
  try {
    const response = await apiGetAllDeviceGroups(token);
    if (!response.ok)
      throw new Error(
        `Failed to fetch device group. Status: ${response.status}`,
      );
    const deviceGroups = await response.json();

    const deviceGroupsDetails = await Promise.all(
      deviceGroups.map(async (name: string) =>
        await getDeviceGroup(name, token),
      ),
    );

    return deviceGroupsDetails.filter((item) => item !== undefined);

  } catch (error) {
    console.error(error);
  }
};

export const getDeviceGroup = async (deviceGroupName: string, token: string) => {
  try {
    const response = await apiGetDeviceGroup(deviceGroupName, token);
    if (!response.ok)
      throw new Error(
        `Failed to fetch device group. Status: ${response.status}`,
      );
    const deviceGroup = await response.json();
    return deviceGroup;
  } catch (error) {
    console.error(error);
  }
};

export const getDeviceGroups2 = async (token: string): Promise<DeviceGroup[]> => {
  try {
    const deviceGroupResponse = await apiGetAllDeviceGroups(token);
    if (!deviceGroupResponse.ok) {
      throw new Error("Failed to fetch Device Group list");
    }
    const deviceGroupNames = await deviceGroupResponse.json();
    const networkSlices = await getNetworkSlices(token);

    const dgs = await Promise.all(
      deviceGroupNames.map(async (name: string) => {
        const deviceGroup = await getDeviceGroup2(name, token);
        const networkSliceName = getNetworkSliceNameFromDeviceGroup(name, networkSlices);
        return { ...deviceGroup, "network-slice": networkSliceName };
      })
    );
    return dgs

  } catch (error) {
    console.error(error);
    throw error;
  }
};


export const getDeviceGroup2 = async (deviceGroupName: string, token: string): Promise<DeviceGroup> => {
  try {
    const response = await apiGetDeviceGroup(deviceGroupName, token);
    if (!response.ok) {
      throw new Error("Failed to fetch device group list");
    }
    const deviceGroup = await response.json();
    return deviceGroup as DeviceGroup;

  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getNetworkSliceNameFromDeviceGroup = (deviceGroupName: string, networkSlices: NetworkSlice[]) => {
  for (const networkSlice of networkSlices) {
    if (networkSlice["site-device-group"] && networkSlice["site-device-group"].includes(deviceGroupName)) {
      return networkSlice["slice-name"];
    }
  }
  return "";
}
