import { apiPostDeviceGroup, getDeviceGroup } from "@/utils/deviceGroupOperations";
import { is404NotFoundError, OperationError, WebconsoleApiError }  from "@/utils/errors";
import { SubscriberAuthData, SubscriberData, SubscriberId } from "@/components/types";


function isValidSubscriberRawImsi(rawImsi: string): boolean {
  return /^[0-9]+$/.test(rawImsi);
}

async function apiGetAllSubscribersIds(token: string): Promise<SubscriberId[]> {
  try {
    const response = await fetch(`/api/subscriber`, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
    });
    const respData = await response.json();
    if (!response.ok) {
      throw new WebconsoleApiError(response.status, respData.error);
    }
    return respData
  } catch (error) {
    console.error(`Error retrieving subscribers list: ${error}`);
    throw error;
  }
};

async function apiGetSubscriber(rawImsi: string, token: string): Promise<Response> {
  if (!isValidSubscriberRawImsi(rawImsi)) {
    throw new OperationError(`Error getting subscriber: Invalid imsi provided ${rawImsi}.`);
  }
  try {
    return await fetch(`/api/subscriber/imsi-${rawImsi}`, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(`Error retrieving subscriber ${rawImsi}: ${error}`);
    throw error;
  }
};

async function apiPostSubscriber(rawImsi: string, subscriberData: SubscriberAuthData, token: string): Promise<void> {
  if (!isValidSubscriberRawImsi(rawImsi)) {
    throw new OperationError(`Error getting subscriber: Invalid imsi provided ${rawImsi}.`);
  }
  try {
    const response = await fetch(`/api/subscriber/imsi-${rawImsi}`, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscriberData),
    });
    if (!response.ok) {
      const respData = await response.json();
      throw new WebconsoleApiError(response.status, respData.error);
    }
  } catch (error) {
    console.error(`Error in POST subscriber ${rawImsi}: ${error}`);
    throw error;
  }
};

export async function deleteSubscriber(rawImsi: string, token: string): Promise<void> {
  if (!isValidSubscriberRawImsi(rawImsi)) {
    throw new OperationError(`Error deleting subscriber: Invalid imsi provided ${rawImsi}.`);
  }
  try {
    const response =  await fetch(`/api/subscriber/imsi-${rawImsi}`, {
      method: "DELETE",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const respData = await response.json();
      throw new WebconsoleApiError(response.status, respData.error);
    }
  } catch (error) {
    console.error(`Error deleting subscriber ${rawImsi}: ${error}`);
    throw error;
  }
};

export async function getSubscribersAuthData(token: string): Promise<SubscriberAuthData[]> {
  try {
    var subscriberNames = await apiGetAllSubscribersIds(token);

    const allSubscribers = await Promise.all(
      subscriberNames.map(async (subscriber: SubscriberId) =>
        await getSubscriberAuthData(subscriber.ueId, token),
      ),
    );
    return allSubscribers.filter((item) => item !== undefined);

  } catch (error) {
    console.error(`Error retrieving subscribers: ${error}`);
    throw error;
  }
};

async function getSubscriberAuthData(ueId: string, token: string): Promise<SubscriberAuthData> {
  try {
    const rawImsi = ueId.split("-")[1];
    const response = await apiGetSubscriber(rawImsi, token);
    const subscriber = await response.json();
    if (!response.ok) {
      throw new WebconsoleApiError(response.status, subscriber.error);
    }

    const subscriberData = subscriber as SubscriberData;
    const subscriberAuthData : SubscriberAuthData = {
      rawImsi: subscriberData.ueId.split("-")[1],
      opc: subscriberData.AuthenticationSubscription?.opc?.opcValue ?? "",
      key:  subscriberData.AuthenticationSubscription?.permanentKey?.permanentKeyValue ?? "",
      sequenceNumber: subscriberData.AuthenticationSubscription?.sequenceNumber ?? "" ,
    }
    return subscriberAuthData;
  } catch (error) {
    console.error(`Error retrieving subscriber ${ueId}: ${error}`);
    throw error;
  }
};

async function doesSubscriberExist(rawImsi: string, token: string) : Promise<boolean>{
  try {
    const subscribers: SubscriberId[] = await apiGetAllSubscribersIds(token);
    return subscribers.some(subscriber => subscriber.ueId.split("-")[1] === rawImsi);
  } catch (error) {
    console.error("Error retrieving subscribers:", error);
    throw error;
  }
}

export async function filterSubscribers(subscribers: string[], token: string): Promise<string[]> {
  try {
    const allSubscribers: SubscriberId[] = await apiGetAllSubscribersIds(token);
    const existingImsis = new Set(allSubscribers.map(sub => sub.ueId.split("-")[1]));

    return subscribers.filter(imsi => existingImsis.has(imsi));
  } catch (error) {
    console.error("Error retrieving subscribers:", error);
    throw error;
  }
}


interface CreateSubscriberArgs {
  subscriberData: SubscriberAuthData;
  deviceGroupName: string;
  token: string
}

export async function createSubscriber({
  subscriberData,
  deviceGroupName,
  token
}: CreateSubscriberArgs) : Promise<void> {
  try {
    const exists = await doesSubscriberExist(subscriberData.rawImsi, token);
    if (exists){
      throw new OperationError("Subscriber already exist.");
    }

    var existingDeviceGroupData = await getDeviceGroup(deviceGroupName, token);
    await apiPostSubscriber(subscriberData.rawImsi, subscriberData, token);
    if (!existingDeviceGroupData["imsis"].includes(subscriberData.rawImsi)) {
      existingDeviceGroupData["imsis"].push(subscriberData.rawImsi);
      await apiPostDeviceGroup(deviceGroupName, existingDeviceGroupData, token);
    }

  } catch (error) {
    console.error(`Failed to create subscriber ${subscriberData.rawImsi} : ${error}`);
    throw error;
  }
};


interface EditSubscriberArgs {
  subscriberData: SubscriberAuthData;
  previousDeviceGroup: string;
  newDeviceGroupName: string;
  token: string
}

export async function editSubscriber({
  subscriberData,
  previousDeviceGroup,
  newDeviceGroupName,
  token
}: EditSubscriberArgs) : Promise<void> {
  try {
    var newDeviceGroupData = await getDeviceGroup(newDeviceGroupName, token);
    const exists = await doesSubscriberExist(subscriberData.rawImsi, token);
    if (!exists){
      throw new OperationError("Subscriber does not exist.");
    }
    await apiPostSubscriber(subscriberData.rawImsi, subscriberData, token);
    if (previousDeviceGroup != newDeviceGroupName) {
      await updatePreviousDeviceGroup(subscriberData.rawImsi, previousDeviceGroup, token);
    }
    if (!newDeviceGroupData.imsis.includes(subscriberData.rawImsi)) {
      newDeviceGroupData.imsis.push(subscriberData.rawImsi);
      await apiPostDeviceGroup(newDeviceGroupName, newDeviceGroupData, token);
    }
  } catch (error) {
    console.error(`Failed to edit subscriber ${subscriberData.rawImsi} : ${error}`);
    throw error;
  }
};

async function updatePreviousDeviceGroup(rawImsi: string, previousDeviceGroup: string, token: string) : Promise<void>{
  try{
    if (!previousDeviceGroup){
      return
    }
    var oldDeviceGroupData = await getDeviceGroup(previousDeviceGroup, token);
    if (oldDeviceGroupData){
      const index = oldDeviceGroupData.imsis.indexOf(rawImsi);
      if (index !== -1) {
        oldDeviceGroupData.imsis.splice(index, 1);
        await apiPostDeviceGroup(previousDeviceGroup, oldDeviceGroupData, token);
      }
    }
  }
  catch (error){
    if (is404NotFoundError(error)) {
      console.debug(`${previousDeviceGroup} not found when editing subscriber ${rawImsi}.`);
      return;
    }
    console.error(`Failed to update device group ${previousDeviceGroup} : ${error}`);
    throw error;
  }
}
