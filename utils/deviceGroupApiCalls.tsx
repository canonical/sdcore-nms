function isValidName(name: string): boolean {
  return /^[a-zA-Z0-9-_]+$/.test(name);
}

export const apiGetDeviceGroup = async (name: string) => {
  if (isValidName(name)){
    throw new Error(
      `Error getting device group: Invalid name provided.`,
    );
  }
  try {
    const response = await fetch(`/config/v1/device-group/${name}`, {
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

export const apiGetDeviceGroups = async () => {
  try {
    const response = await fetch(`/config/v1/device-group/`, {
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

export const apiPostDeviceGroup = async (name: string, deviceGroupData: any) => {
  if (isValidName(name)){
    throw new Error(
      `Error updating device group: Invalid name provided.`,
    );
  }
  try {
    const response = await fetch(`/config/v1/device-group/${name}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deviceGroupData),
      });

    return response
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const apiDeleteDeviceGroup = async (name: string) => {
  if (isValidName(name)){
    throw new Error(
      `Error deleting device group: Invalid name provided.`,
    );
  }
  try {
    const response = await fetch(`/config/v1/device-group/${name}`, {
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