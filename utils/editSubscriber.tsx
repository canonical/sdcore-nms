import { apiGetDeviceGroup, apiPostDeviceGroup } from "@/utils/deviceGroupOperations";
import { apiGetSubscriber, apiPostSubscriber } from "@/utils/callSubscriberApi";


interface EditSubscriberArgs {
  imsi: string;
  opc: string;
  key: string;
  sequenceNumber: string;
  oldDeviceGroupName: string;
  newDeviceGroupName: string;
  token: string
}

export const editSubscriber = async ({
  imsi,
  opc,
  key,
  sequenceNumber,
  oldDeviceGroupName,
  newDeviceGroupName,
  token
}: EditSubscriberArgs) => {
  const subscriberData = {
    UeId: imsi,
    opc: opc,
    key: key,
    sequenceNumber: sequenceNumber,
  };

  try {
    var newDeviceGroupData = await getDeviceGroupData(newDeviceGroupName, token);
    if (!newDeviceGroupData){
      throw new Error(`Device group ${newDeviceGroupName} cannot be found`);
    }
    await updateSubscriber(subscriberData, token);
    if (oldDeviceGroupName != newDeviceGroupName) {
      if (oldDeviceGroupName){
        var oldDeviceGroupData = await getDeviceGroupData(oldDeviceGroupName, token);
        if (oldDeviceGroupData){
          const index = oldDeviceGroupData["imsis"].indexOf(imsi);
          oldDeviceGroupData["imsis"].splice(index, 1);
          await apiPostDeviceGroup(oldDeviceGroupName, oldDeviceGroupData, token);
        }
      }
      newDeviceGroupData["imsis"].push(imsi);
      await apiPostDeviceGroup(newDeviceGroupName, newDeviceGroupData, token);
    }
  } catch (error) {
    console.error(error);
    const details =
      error instanceof Error
        ? error.message
        : `Failed to edit subscriber .`;
    throw new Error(details);
  }
};

const updateSubscriber = async (subscriberData: any, token: string) => {
  try {
    const getSubscriberResponse = await apiGetSubscriber(subscriberData.UeId, token);

    // Workaround for https://github.com/omec-project/webconsole/issues/109
    var existingSubscriberData = await getSubscriberResponse.json();
    if (!getSubscriberResponse.ok ||
      (!existingSubscriberData["AuthenticationSubscription"]["authenticationMethod"] &&
        !existingSubscriberData["AccessAndMobilitySubscriptionData"]["nssai"])) {
      throw new Error("Subscriber does not exist.");
    }

    existingSubscriberData["AuthenticationSubscription"]["opc"] = existingSubscriberData["AuthenticationSubscription"]["opc"] ?? {};
    existingSubscriberData["AuthenticationSubscription"]["opc"]["opcValue"] = subscriberData.opc;
    existingSubscriberData["AuthenticationSubscription"]["permanentKey"] = existingSubscriberData["AuthenticationSubscription"]["permanentKey"] ?? {};
    existingSubscriberData["AuthenticationSubscription"]["permanentKey"]["permanentKeyValue"] = subscriberData.key;
    existingSubscriberData["AuthenticationSubscription"]["sequenceNumber"] = subscriberData.sequenceNumber;

    const updateSubscriberResponse = await apiPostSubscriber(subscriberData.UeId, subscriberData, token);
    if (!updateSubscriberResponse.ok) {
      throw new Error(
        `Error editing subscriber. Error code: ${updateSubscriberResponse.status}`,
      );
    }
  } catch (error) {
    console.error(error);
  }
}

const getDeviceGroupData = async (deviceGroupName: string, token: string) => {
  try {
    const existingDeviceGroupResponse = await apiGetDeviceGroup(deviceGroupName, token);
    var existingDeviceGroupData = await existingDeviceGroupResponse.json();

    if (existingDeviceGroupData && !existingDeviceGroupData["imsis"]) {
      existingDeviceGroupData["imsis"] = [];
    }
    return existingDeviceGroupData;
  } catch (error) {
    console.error(error);
  }
}
