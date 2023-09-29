export const getDeviceGroup = async (deviceGroupName: string) => {
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
