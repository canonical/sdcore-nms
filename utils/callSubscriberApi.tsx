import { Subscriber } from "@/components/types";
import { OperationError, WebconsoleApiError }  from "@/utils/errors";

function isValidSubscriberName(name: string): boolean {
  return /^[a-zA-Z0-9-_]+$/.test(name);
}

export async function apiGetAllSubscribers(token: string): Promise<Subscriber[]> {
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

export async function apiGetSubscriber(imsi: string, token: string): Promise<any> {
  if (!isValidSubscriberName(imsi)) {
    throw new OperationError(`Error getting device group: Invalid name provided ${imsi}.`);
  }
  try {
    return await fetch(`/api/subscriber/imsi-${imsi}`, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(`Error retrieving subscriber ${imsi}: ${error}`);
    throw error;
  }
};

export async function apiPostSubscriber(imsi: string, subscriberData: any, token: string): Promise<void> {
  if (!isValidSubscriberName(imsi)) {
    throw new OperationError(`Error getting device group: Invalid name provided ${imsi}.`);
  }
  try {
    const response = await fetch(`/api/subscriber/imsi-${imsi}`, {
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
    console.error(`Error in POST subscriber ${imsi}: ${error}`);
    throw error;
  }
};

export const apiDeleteSubscriber = async (imsi: string, token: string) => {
  if (!isValidSubscriberName(imsi)) {
    throw new Error(`Error deleting subscriber: Invalid name provided ${imsi}.`);
  }
  try {
    return await fetch(`/api/subscriber/imsi-${imsi}`, {
      method: "DELETE",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};