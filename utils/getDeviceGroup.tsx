import { NetworkSlice } from "@/components/types";

export const getAllDeviceGroups = async (slice?: NetworkSlice) => {
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

const getDeviceGroup = async (deviceGroupName: string) => {
  try {
    const response = await fetch(`/api/device-group/${deviceGroupName}`, {
      method: "GET",
    });
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

export const getDeviceGroupsDetails = async () => {
  try {
    const response = await fetch(`/api/device-group/`, {
      method: "GET",
    });
    if (!response.ok)
      throw new Error(
        `Failed to fetch device group. Status: ${response.status}`,
      );
    const deviceGroups = await response.json();
    //console.error(deviceGroups);

    const allDeviceGroups = await Promise.all(
      deviceGroups.map(async (name: string) =>
        await getDeviceGroup(name),
      ),
    );
    //console.error(allDeviceGroups);
  
    return allDeviceGroups.filter((item) => item !== undefined);

    //return deviceGroups;
  } catch (error) {
    console.error(error);
  }
};
