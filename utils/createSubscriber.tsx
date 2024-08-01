import { handleGetDeviceGroup, handlePostDeviceGroup } from "@/utils/handleDeviceGroup";
import { handleGetSubscriber, handlePostSubscriber } from "@/utils/handleSubscriber";

interface CreateSubscriberArgs {
  imsi: string;
  opc: string;
  key: string;
  sequenceNumber: string;
  deviceGroupName: string;
}

export const createSubscriber = async ({
  imsi,
  opc,
  key,
  sequenceNumber,
  deviceGroupName,
}: CreateSubscriberArgs) => {
  const subscriberData = {
    UeId: imsi,
    opc: opc,
    key: key,
    sequenceNumber: sequenceNumber,
  };

  try {
    const getSubscriberResponse = await handleGetSubscriber(imsi);

    // Workaround for https://github.com/omec-project/webconsole/issues/109
    const existingSubscriberData = await getSubscriberResponse.json();
    if (getSubscriberResponse.ok && existingSubscriberData["AuthenticationSubscription"]["authenticationMethod"]) {
      throw new Error("Subscriber already exists.");
    }

    const updateSubscriberResponse = await handlePostSubscriber(imsi, subscriberData);
    if (!updateSubscriberResponse.ok) {
      throw new Error(
        `Error creating subscriber. Error code: ${updateSubscriberResponse.status}`,
      );
    }

    const existingDeviceGroupResponse = await handleGetDeviceGroup(deviceGroupName);
    var existingDeviceGroupData = await existingDeviceGroupResponse.json();

    if (!existingDeviceGroupData["imsis"]) {
      existingDeviceGroupData["imsis"] = [];
    }

    existingDeviceGroupData["imsis"].push(imsi);

    const updateDeviceGroupResponse = await handlePostDeviceGroup(deviceGroupName, existingDeviceGroupData);
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
