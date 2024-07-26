function isValidNetworkSliceName(name: string): boolean {
  return /^[a-zA-Z0-9-_]+$/.test(name);
}

const WEBUI_ENDPOINT = process.env.WEBUI_ENDPOINT || 'http://localhost:3000';

export const apiGetAllNetworkSlices = async () => {
  const url = `http://${WEBUI_ENDPOINT}/config/v1/network-slice`
  try {
    const networkSlicesResponse = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return networkSlicesResponse
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const apiGetNetworkSlice = async (name: string) => {
  if (!isValidNetworkSliceName(name)){
    throw new Error(`Error getting network slice: Invalid name provided ${name}`);
  }
  try {
    const response = await fetch(`http://${WEBUI_ENDPOINT}/config/v1/network-slice/${name}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const apiPostNetworkSlice = async (name: string, sliceData: any) => {
  if (!isValidNetworkSliceName(name)){
    throw new Error(`Error updating network slice: Invalid name provided ${name}`);
  }
  try {
    const response = await fetch(`http://${WEBUI_ENDPOINT}/config/v1/network-slice/${name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sliceData),
    });
    return response
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const apiDeleteNetworkSlice = async (name: string) => {
  if (!isValidNetworkSliceName(name)){
    throw new Error(`Error deleting network slice: Invalid name provided ${name}`);
  }
  try {
    const response = await fetch(`http://${WEBUI_ENDPOINT}/config/v1/network-slice/${name}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response
  } catch (error) {
    console.error(error);
    throw error;
  }
};