function isValidNetworkSliceName(name: string): boolean {
  return /^[a-zA-Z0-9-_]+$/.test(name);
}

export const apiGetAllNetworkSlices = async () => {
  try {
    return await fetch(`/config/v1/network-slice`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const apiGetNetworkSlice = async (name: string) => {
  if (!isValidNetworkSliceName(name)){
    throw new Error(`Error getting network slice: Invalid name provided ${name}.`);
  }
  try {
    return await fetch(`/config/v1/network-slice/${name}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const apiPostNetworkSlice = async (name: string, sliceData: any) => {
  if (!isValidNetworkSliceName(name)){
    throw new Error(`Error updating network slice: Invalid name provided ${name}.`);
  }
  try {
    return await fetch(`/config/v1/network-slice/${name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sliceData),
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const apiDeleteNetworkSlice = async (name: string) => {
  if (!isValidNetworkSliceName(name)){
    throw new Error(`Error deleting network slice: Invalid name provided ${name}.`);
  }
  try {
    return await fetch(`/config/v1/network-slice/${name}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};