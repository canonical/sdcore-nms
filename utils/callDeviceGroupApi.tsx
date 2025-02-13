import { DeviceGroup } from "@/components/types";
import { HTTPStatus } from "@/utils/utils";

function isValidDeviceGroupName(name: string): boolean {
  return /^[a-zA-Z0-9-_]+$/.test(name);
}

export const apiGetAllDeviceGroups = async (token: string) => {
  try {
    return await fetch(`/config/v1/device-group/`, {
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

export async function apiGetDeviceGroup(name: string, token: string): Promise<Response> {
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
      console.error("Unexpected error:", error);
      throw new Error(`Unexpected error occurred: ${error}`);
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