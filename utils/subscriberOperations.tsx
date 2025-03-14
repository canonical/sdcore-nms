import { apiPostDeviceGroup, getDeviceGroup, getDeviceGroups } from "@/utils/deviceGroupOperations";
import {is404NotFoundError, is409ConflictError, OperationError, WebconsoleApiError} from "@/utils/errors";
import { DeviceGroup, SubscriberAuthData, SubscriberData, SubscriberId, SubscriberTableData } from "@/components/types";


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
    const response = await fetch(`/api/subscriber/imsi-${rawImsi}`, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 404) {
      throw new WebconsoleApiError(404, "Subscriber not found");
    }

    if (!response.ok) {
      var respData;
      try {
        respData = await response.json();
      } catch {
        respData = { error: "Malformed JSON response" };
      }
      throw new WebconsoleApiError(response.status, respData.error || "Unknown error");
    }

    return response;

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

    if (response.status === 409) {
      throw new WebconsoleApiError(409, "Subscriber already exists");
    }

    if (!response.ok) {
      var respData;
      try {
        respData = await response.json();
      } catch {
        respData = { error: "Malformed JSON response" };
      }
      throw new WebconsoleApiError(response.status, respData.error || "Unknown error");
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

export async function getSubscribersTableData(token: string): Promise<SubscriberTableData[]> {
  try {
    var subscriberNames = await apiGetAllSubscribersIds(token);
    const deviceGroups = await getDeviceGroups(token);
    const allSubscribers = await Promise.all(
      subscriberNames.map(async (subscriber: SubscriberId) => {
        const subscriberAuthData = await getSubscriberAuthData(subscriber.ueId, token);
        const parents = findDeviceGroupByImsi(subscriber.ueId.split("-")[1], deviceGroups);
          return { ...subscriberAuthData, networkSliceName: parents?.networkSliceName || "", deviceGroupName: parents?.deviceGroupName || "" };
        })
      );
    return allSubscribers.filter((item) => item !== undefined);

  } catch (error) {
    console.error(`Error retrieving subscribers: ${error}`);
    throw error;
  }
};

const findDeviceGroupByImsi = (
  rawImsi: string,
  deviceGroups: DeviceGroup[]
): { deviceGroupName: string; networkSliceName: string } | null => {
  for (const deviceGroup of deviceGroups) {
    if (deviceGroup.imsis && deviceGroup.imsis.includes(rawImsi)) {
      return {
        deviceGroupName: deviceGroup["group-name"],
        networkSliceName: deviceGroup["network-slice"] ?? ""
      };
    }
  }
  return null;
};


async function getSubscriberAuthData(ueId: string, token: string): Promise<SubscriberAuthData> {
  try {
    const rawImsi = ueId.split("-")[1];
    const response = await apiGetSubscriber(rawImsi, token);
    const subscriber = await response.json();
    if (!subscriber) {
      console.error(`Subscriber data is null or undefined for IMSI ${rawImsi}`);
      throw new Error(`Empty subscriber data for IMSI ${rawImsi}`);
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
    if (is404NotFoundError(error)) {
      console.error(`Subscriber with IMSI ${ueId.split("-")[1]} does not exist.`);
      throw error
    }
    console.error(`Error retrieving subscriber ${ueId}: ${error}`);
    throw error;
  }
};

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

async function doesSubscriberExist(rawImsi: string, token: string) : Promise<boolean>{
  try {
    const response = await apiGetSubscriber(rawImsi, token);
    return response.ok;
  } catch (error) {

    if (is404NotFoundError(error)) {
      return false;
    }

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
      throw new OperationError(`Subscriber with IMSI ${subscriberData.rawImsi} already exists.`);
    }

    var existingDeviceGroupData = await getDeviceGroup(deviceGroupName, token);
    await apiPostSubscriber(subscriberData.rawImsi, subscriberData, token);
    if (!existingDeviceGroupData["imsis"].includes(subscriberData.rawImsi)) {
      existingDeviceGroupData["imsis"].push(subscriberData.rawImsi);
    }
    await apiPostDeviceGroup(deviceGroupName, existingDeviceGroupData, token);

  } catch (error) {
    if (is409ConflictError(error)) {
      console.debug(`Subscriber with IMSI ${subscriberData.rawImsi} already exists.`);
      throw error;
    }

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
    if (previousDeviceGroup != newDeviceGroupName) {
      await updatePreviousDeviceGroup(subscriberData.rawImsi, previousDeviceGroup, token);
    }
    if (!newDeviceGroupData.imsis.includes(subscriberData.rawImsi)) {
      newDeviceGroupData.imsis.push(subscriberData.rawImsi);
    }
    await apiPostDeviceGroup(newDeviceGroupName, newDeviceGroupData, token);
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
