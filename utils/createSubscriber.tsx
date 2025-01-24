import { apiGetDeviceGroup, apiPostDeviceGroup } from "@/utils/callDeviceGroupApi";
import { apiGetSubscriber, apiPostSubscriber } from "@/utils/callSubscriberApi";

interface CreateSubscriberArgs {
  imsi: string;
  opc: string;
  key: string;
  sequenceNumber: string;
  deviceGroupName: string;
  token: string
}

export const createSubscriber = async ({
  imsi,
  opc,
  key,
  sequenceNumber,
  deviceGroupName,
  token
}: CreateSubscriberArgs) => {
  const subscriberData = {
    UeId: imsi,
    opc: opc,
    key: key,
    sequenceNumber: sequenceNumber,
  };

  try {
    const getSubscriberResponse = await apiGetSubscriber(imsi, token);

    // Workaround for https://github.com/omec-project/webconsole/issues/109
    const existingSubscriberData = await getSubscriberResponse.json();
    if (getSubscriberResponse.ok && existingSubscriberData["AuthenticationSubscription"]["authenticationMethod"]) {
      throw new Error("Subscriber already exists.");
    }

    const updateSubscriberResponse = await apiPostSubscriber(imsi, subscriberData, token);
    if (!updateSubscriberResponse.ok) {
      throw new Error(
        `Error creating subscriber. Error code: ${updateSubscriberResponse.status}`,
      );
    }

    const existingDeviceGroupResponse = await apiGetDeviceGroup(deviceGroupName, token);
    var existingDeviceGroupData = await existingDeviceGroupResponse.json();

    if (!existingDeviceGroupData){
      console.error("failed to add subscriber to device group");
      return
    }

    if (!existingDeviceGroupData["imsis"]) {
      existingDeviceGroupData["imsis"] = [];
    }
    existingDeviceGroupData["imsis"].push(imsi);

    const updateDeviceGroupResponse = await apiPostDeviceGroup(deviceGroupName, existingDeviceGroupData, token);
    if (!updateDeviceGroupResponse.ok) {
      throw new Error(
        `Error updating device group. Error code: ${updateDeviceGroupResponse.status}`,
      );
    }

    return updateSubscriberResponse.json();
  } catch (error) {
    console.error(error);
    const details =
      error instanceof Error
        ? error.message
        : "Failed to create the subscriber.";
    throw new Error(details);
  }
};
