import { apiPostDeviceGroup, getDeviceGroup, getDeviceGroups } from "@/utils/deviceGroupOperations";
import {is404NotFoundError, is409ConflictError, OperationError, WebconsoleApiError } from "@/utils/errors";
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

export async function deleteSubscriber(params: {rawImsi: string, token: string}): Promise<void> {
  if (!isValidSubscriberRawImsi(params.rawImsi)) {
    throw new OperationError(`Error deleting subscriber: Invalid imsi provided ${params.rawImsi}.`);
  }
  try {
    const response =  await fetch(`/api/subscriber/imsi-${params.rawImsi}`, {
      method: "DELETE",
      headers: {
        "Authorization": "Bearer " + params.token,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const respData = await response.json();
      throw new WebconsoleApiError(response.status, respData.error);
    }
  } catch (error) {
    console.error(`Error deleting subscriber ${params.rawImsi}: ${error}`);
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
    if (!response.ok) {
      throw new WebconsoleApiError(response.status, `Error retrieving subscriber data for Imsi ${rawImsi}`);
    }
    const subscriberData: SubscriberData = await response.json();
    if (!subscriberData || !subscriberData.ueId || !subscriberData.AuthenticationSubscription) {
      console.error(`Subscriber data is invalid for IMSI ${rawImsi}`);
      throw new Error(`Invalid subscriber data for IMSI ${rawImsi}`);
    }

    const subscriberAuthData : SubscriberAuthData = {
      rawImsi: subscriberData.ueId.split("-")[1],
      opc: subscriberData.AuthenticationSubscription?.opc?.opcValue ?? "",
      key:  subscriberData.AuthenticationSubscription?.permanentKey?.permanentKeyValue ?? "",
      sequenceNumber: subscriberData.AuthenticationSubscription?.sequenceNumber ?? "" ,
    }
    return subscriberAuthData;
  } catch (error) {
    console.error(`Error retrieving subscriber authentication data for ${ueId}: ${error}`);
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
    if (response.ok) {
      return true;
    } else if (response.status === 404) {
      return false;
    } else {
      throw new WebconsoleApiError(response.status, `Error retrieving subscriber data for Imsi ${rawImsi}`);
    }
  } catch (error) {
    console.error("Error retrieving subscriber:", error);
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
    var existingDeviceGroupData = await getDeviceGroup(deviceGroupName, token);
    try {
      await apiPostSubscriber(subscriberData.rawImsi, subscriberData, token);
    } catch (error) {
      if (is409ConflictError(error)) {
        throw new OperationError(`Subscriber with IMSI ${subscriberData.rawImsi} already exists.`);
      }
      throw error;
    }

    if (!existingDeviceGroupData["imsis"].includes(subscriberData.rawImsi)) {
      existingDeviceGroupData["imsis"].push(subscriberData.rawImsi);
    }
    await apiPostDeviceGroup(deviceGroupName, existingDeviceGroupData, token);

  } catch (error) {
    console.error(`Failed to create subscriber ${subscriberData.rawImsi} : ${error}`);
    throw error;
  }
};


interface EditSubscriberArgs {
  imsi: string;
  previousDeviceGroup: string;
  newDeviceGroupName: string;
  token: string;
}

export async function editSubscriber({
  imsi,
  previousDeviceGroup,
  newDeviceGroupName,
  token
}: EditSubscriberArgs) : Promise<void> {
  try {
    var newDeviceGroupData = await getDeviceGroup(newDeviceGroupName, token);
    const exists = await doesSubscriberExist(imsi, token);
    if (!exists){
      throw new OperationError("Subscriber does not exist.");
    }
    if (previousDeviceGroup != newDeviceGroupName) {
      await updatePreviousDeviceGroup(imsi, previousDeviceGroup, token);
    }
    if (!newDeviceGroupData.imsis.includes(imsi)) {
      newDeviceGroupData.imsis.push(imsi);
    }
    await apiPostDeviceGroup(newDeviceGroupName, newDeviceGroupData, token);
  } catch (error) {
    console.error(`Failed to edit subscriber ${imsi} : ${error}`);
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
