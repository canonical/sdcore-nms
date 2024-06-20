import { handleGetNetworkSlice, handleGetNetworkSlices } from "@/utils/handleNetworkSlice";
import { handleGetDeviceGroup, handlePostDeviceGroup } from "@/utils/handleDeviceGroup";
import { handleDeleteSubscriber } from "@/utils/handleSubscriber";

export const deleteSubscriber = async (imsi: string) => {
  try {
    const networkSlicesResponse = await handleGetNetworkSlices();

    if (!networkSlicesResponse.ok) {
      throw new Error(
        `Error fetching network slices. Error code: ${networkSlicesResponse.status}`,
      );
    }

    const sliceNames = await networkSlicesResponse.json();

    for (const sliceName of sliceNames) {
      const networkSliceResponse = await handleGetNetworkSlice(sliceName);

      if (!networkSliceResponse.ok) {
        throw new Error(
          `Error fetching network slice. Error code: ${networkSlicesResponse.status}`,
        );
      }

      const slice = await networkSliceResponse.json();

      const deviceGroupNames = slice["site-device-group"];
      for (const groupName of deviceGroupNames) {
        const deviceGroupResponse = await handleGetDeviceGroup(groupName);

        if (!deviceGroupResponse.ok) {
          throw new Error(
            `Error fetching device group ${groupName}. Error code: ${deviceGroupResponse.status}`,
          );
        }

        const deviceGroup = await deviceGroupResponse.json();

        if (deviceGroup.imsis?.includes(imsi)) {
          deviceGroup.imsis = deviceGroup.imsis.filter(
            (id: string) => id !== imsi,
          );

          await handlePostDeviceGroup(groupName, deviceGroup);
        }
      }
    }
    const deleteSubscriberResponse = await handleDeleteSubscriber(imsi);

    if (!deleteSubscriberResponse.ok) {
      throw new Error("Failed to delete subscriber");
    }

    return true;
  } catch (error) {
    console.error(error);
  }
};
