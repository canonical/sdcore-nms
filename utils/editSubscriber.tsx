import { apiPostDeviceGroup, getDeviceGroup} from "@/utils/deviceGroupOperations";
import { apiGetSubscriber, apiPostSubscriber } from "@/utils/callSubscriberApi";
import { OperationError, WebconsoleApiError } from "@/utils/errors";


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
      if (oldDeviceGroupName){
        var oldDeviceGroupData = null;
        try {
          oldDeviceGroupData = await getDeviceGroup(oldDeviceGroupName, token);
        }
        catch{
          console.debug(`Previous device group ${oldDeviceGroupName} was not found.`)
        }
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

