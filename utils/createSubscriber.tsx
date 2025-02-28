import { apiPostDeviceGroup, getDeviceGroup } from "@/utils/deviceGroupOperations";
import { apiGetSubscriber, apiPostSubscriber } from "@/utils/callSubscriberApi";
import { OperationError } from "@/utils/errors";

interface CreateSubscriberArgs {
  imsi: string;
  opc: string;
  key: string;
  sequenceNumber: string;
  deviceGroupName: string;
  token: string
}

export async function createSubscriber({
  imsi,
  opc,
  key,
  sequenceNumber,
  deviceGroupName,
  token
}: CreateSubscriberArgs) : Promise<void> {
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
      throw new OperationError("Subscriber already exists.");
    }

    var existingDeviceGroupData = await getDeviceGroup(deviceGroupName, token);
    await apiPostSubscriber(imsi, subscriberData, token);
    if (!existingDeviceGroupData["imsis"].includes(imsi)) {
      existingDeviceGroupData["imsis"].push(imsi);
      await apiPostDeviceGroup(deviceGroupName, existingDeviceGroupData, token);
    }

  } catch (error) {
    console.error(`Failed to create subscriber ${imsi} : ${error}`);
    throw error;
  }
};
