import { apiPostDeviceGroup, getDeviceGroup} from "@/utils/deviceGroupOperations";
import { apiGetSubscriber, apiPostSubscriber } from "@/utils/callSubscriberApi";
import { is404NotFound, OperationError } from "@/utils/errors";


interface EditSubscriberArgs {
  imsi: string;
  opc: string;
  key: string;
  sequenceNumber: string;
  oldDeviceGroupName: string;
  newDeviceGroupName: string;
  token: string
}

export async function editSubscriber({
  imsi,
  opc,
  key,
  sequenceNumber,
  oldDeviceGroupName,
  newDeviceGroupName,
  token
}: EditSubscriberArgs) : Promise<void> {
  const subscriberData = {
    UeId: imsi,
    opc: opc,
    key: key,
    sequenceNumber: sequenceNumber,
  };

  try {
    var newDeviceGroupData = await getDeviceGroup(newDeviceGroupName, token);
    await updateSubscriber(subscriberData, token);
    if (oldDeviceGroupName != newDeviceGroupName) {
      await updateOldDeviceGroup(imsi, oldDeviceGroupName, token);
    }
    if (!newDeviceGroupData.imsis.includes(imsi)) {
      newDeviceGroupData.imsis.push(imsi);
      await apiPostDeviceGroup(newDeviceGroupName, newDeviceGroupData, token);
    }
  } catch (error) {
    console.error(`Failed to edit subscriber ${imsi} : ${error}`);
    throw error;
  }
};

async function updateSubscriber(subscriberData: any, token: string) : Promise<void>{
  try {
    const getSubscriberResponse = await apiGetSubscriber(subscriberData.UeId, token);

    // Workaround for https://github.com/omec-project/webconsole/issues/109
    var existingSubscriberData = await getSubscriberResponse.json();
    if (!getSubscriberResponse.ok ||
      (!existingSubscriberData["AuthenticationSubscription"]["authenticationMethod"] &&
        !existingSubscriberData["AccessAndMobilitySubscriptionData"]["nssai"])) {
      throw new OperationError("Subscriber does not exist.");
    }

    existingSubscriberData["AuthenticationSubscription"]["opc"] = existingSubscriberData["AuthenticationSubscription"]["opc"] ?? {};
    existingSubscriberData["AuthenticationSubscription"]["opc"]["opcValue"] = subscriberData.opc;
    existingSubscriberData["AuthenticationSubscription"]["permanentKey"] = existingSubscriberData["AuthenticationSubscription"]["permanentKey"] ?? {};
    existingSubscriberData["AuthenticationSubscription"]["permanentKey"]["permanentKeyValue"] = subscriberData.key;
    existingSubscriberData["AuthenticationSubscription"]["sequenceNumber"] = subscriberData.sequenceNumber;

    await apiPostSubscriber(subscriberData.UeId, subscriberData, token);

  } catch (error) {
    console.error(`Failed to update subscriber ${subscriberData.UeId} : ${error}`);
    throw error;
  }
}

async function updateOldDeviceGroup(imsi: string, oldDeviceGroupName: string, token: string) : Promise<void>{
  try{
    if (!oldDeviceGroupName){
      return
    }
    var oldDeviceGroupData = await getDeviceGroup(oldDeviceGroupName, token);
    if (oldDeviceGroupData){
      const index = oldDeviceGroupData.imsis.indexOf(imsi);
      if (index !== -1) {
        oldDeviceGroupData.imsis.splice(index, 1);
        await apiPostDeviceGroup(oldDeviceGroupName, oldDeviceGroupData, token);
      }
    }
  }
  catch (error){
    if (is404NotFound(error)) {
      console.debug(`${oldDeviceGroupName} not found when editing subscriber ${imsi}.`);
      return;
    }
    console.error(`Failed to update device group ${oldDeviceGroupName} : ${error}`);
    throw error;
  }
}
