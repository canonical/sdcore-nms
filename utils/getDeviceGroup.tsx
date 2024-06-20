import { NetworkSlice } from "@/components/types";
import { handleGetDeviceGroup, handleGetDeviceGroups } from "@/utils/handleDeviceGroup";

export const getDeviceGroupsFromNetworkSlice = async (slice?: NetworkSlice) => {
  if (!slice || !slice["site-device-group"]) {
    return [];
  }

  const allDeviceGroups = await Promise.all(
    slice["site-device-group"].map(async (name: string) =>
      await getDeviceGroup(name),
    ),
  );

  return allDeviceGroups.filter((item) => item !== undefined);
}

export const getDeviceGroups = async () => {
  try {
    const response = await handleGetDeviceGroups();
    if (!response.ok)
      throw new Error(
        `Failed to fetch device group. Status: ${response.status}`,
      );
    const deviceGroups = await response.json();

    const deviceGroupsDetails = await Promise.all(
      deviceGroups.map(async (name: string) =>
        await getDeviceGroup(name),
      ),
    );
  
    return deviceGroupsDetails.filter((item) => item !== undefined);

  } catch (error) {
    console.error(error);
  }
};

const getDeviceGroup = async (deviceGroupName: string) => {
  try {
    const response = await handleGetDeviceGroup(deviceGroupName);
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


