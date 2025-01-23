import { apiGetDeviceGroup, apiPostDeviceGroup } from "@/utils/callDeviceGroupApi";
import { apiGetSubscriber, apiPostSubscriber } from "@/utils/callSubscriberApi";
import { StepIconClassKey } from "@mui/material";

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
    await updateSubscriber(subscriberData, token);
    if (oldDeviceGroupName != newDeviceGroupName) {
      var oldDeviceGroupData = await getDeviceGroupData(oldDeviceGroupName, token);
      if (oldDeviceGroupData){
        const index = oldDeviceGroupData["imsis"].indexOf(imsi);
        oldDeviceGroupData["imsis"].splice(index, 1);
        await updateDeviceGroupData(oldDeviceGroupName, oldDeviceGroupData, token);
      }
      var newDeviceGroupData = await getDeviceGroupData(newDeviceGroupName, token);
      if (newDeviceGroupData){
        newDeviceGroupData["imsis"].push(imsi);
        await updateDeviceGroupData(newDeviceGroupName, newDeviceGroupData, token);
      }
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

const updateDeviceGroupData = async (deviceGroupName: string, deviceGroupData: any, token: string) => {
  try {
    const updateDeviceGroupResponse = await apiPostDeviceGroup(deviceGroupName, deviceGroupData, token);
    if (!updateDeviceGroupResponse.ok) {
      throw new Error(
        `Error updating device group. Error code: ${updateDeviceGroupResponse.status}`,
      );
    }
  } catch (error) {
    console.error(error);
  }
}
