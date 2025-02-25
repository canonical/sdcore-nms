import { WebconsoleApiError } from "@/utils/errors";


function isValidDeviceGroupName(name: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9-_]+$/.test(name);
}

export const apiGetAllDeviceGroupNames = async (token: string): Promise<string[]> => {
  try {
    const response = await fetch(`/config/v1/device-group/`, {
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
    console.error(`Error retrieving device group list: ${error}`);
    throw error;
  }
};

export const apiGetDeviceGroup = async (name: string, token: string) => {
  if (!isValidDeviceGroupName(name)) {
    throw new Error(`Error getting device group: Invalid name provided ${name}.`);
  }
  try {
    return await fetch(`/config/v1/device-group/${name}`, {
      method: "GET",
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

export const apiPostDeviceGroup = async (name: string, deviceGroupData: any, token: string) => {
  if (!isValidDeviceGroupName(name)) {
    throw new Error(`Error updating device group: Invalid name provided ${name}.`);
  }
  try {
    return await fetch(`/config/v1/device-group/${name}`, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(deviceGroupData),
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const apiDeleteDeviceGroup = async (name: string, token: string) => {
  if (!isValidDeviceGroupName(name)) {
    throw new Error(`Error deleting device group: Invalid name provided ${name}.`);
  }
  try {
    return await fetch(`/config/v1/device-group/${name}`, {
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