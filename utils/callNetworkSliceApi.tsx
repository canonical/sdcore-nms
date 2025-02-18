import  { WebconsoleApiError }  from "@/utils/errors";

function isValidNetworkSliceName(name: string): boolean {
  return /^[a-zA-Z0-9-_]+$/.test(name);
}

export const apiGetAllNetworkSlices = async (token: string): Promise<string[]> => {
  try {
    const response = await fetch(`/config/v1/network-slice`, {
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
    return respData;
  } catch (error) {
    console.error(`Error retrieving network slices ${error}`);
    throw error;
  }
};

export const apiGetNetworkSlice = async (name: string, token: string) => {
  if (!isValidNetworkSliceName(name)) {
    throw new Error(`Error getting network slice: Invalid name provided ${name}.`);
  }
  try {
    return await fetch(`/config/v1/network-slice/${name}`, {
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

export const apiPostNetworkSlice = async (name: string, sliceData: any, token: string) => {
  if (!isValidNetworkSliceName(name)) {
    throw new Error(`Error updating network slice: Invalid name provided ${name}.`);
  }
  try {
    return await fetch(`/config/v1/network-slice/${name}`, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sliceData),
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const apiDeleteNetworkSlice = async (name: string, token: string) => {
  if (!isValidNetworkSliceName(name)) {
    throw new Error(`Error deleting network slice: Invalid name provided ${name}.`);
  }
  try {
    return await fetch(`/config/v1/network-slice/${name}`, {
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