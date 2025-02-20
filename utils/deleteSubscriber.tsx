import { apiGetNetworkSlice, apiGetAllNetworkSlices } from "@/utils/callNetworkSliceApi";
import { apiGetDeviceGroup, apiPostDeviceGroup } from "@/utils/callDeviceGroupApi";
import { apiDeleteSubscriber } from "@/utils/callSubscriberApi";

export const deleteSubscriber = async (imsi: string, token: string) => {
  try {
    const sliceNames = await apiGetAllNetworkSlices(token);

    for (const sliceName of sliceNames) {
      const networkSliceResponse = await apiGetNetworkSlice(sliceName, token);

      if (!networkSliceResponse.ok) {
        throw new Error(
          `Error fetching network slice. Error code: ${networkSliceResponse.status}`,
        );
      }

      const sliceData = await networkSliceResponse.json();
      const deviceGroupNames = sliceData["site-device-group"];
      for (const groupName of deviceGroupNames) {
        const deviceGroupResponse = await apiGetDeviceGroup(groupName, token);

        if (!deviceGroupResponse.ok) {
          throw new Error(
            `Error fetching device group ${groupName}. Error code: ${deviceGroupResponse.status}`,
          );
        }

        var deviceGroupData = await deviceGroupResponse.json();

        if (deviceGroupData.imsis?.includes(imsi)) {
          deviceGroupData.imsis = deviceGroupData.imsis.filter(
            (id: string) => id !== imsi,
          );

          await apiPostDeviceGroup(groupName, deviceGroupData, token);
        }
      }
    }
    const deleteSubscriberResponse = await apiDeleteSubscriber(imsi, token);
    if (!deleteSubscriberResponse.ok) {
      throw new Error("Failed to delete subscriber");
    }

    return true;
  } catch (error) {
    console.error(error);
  }
};
