function isValidDeviceGroupName(name: string): boolean {
  return /^[a-zA-Z0-9-_]+$/.test(name);
}

export const apiGetAllDeviceGroups = async () => {
  try {
    return await fetch(`/config/v1/device-group/`, {
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

export const apiGetDeviceGroup = async (name: string) => {
  if (!isValidDeviceGroupName(name)){
    throw new Error(`Error getting device group: Invalid name provided ${name}.`);
  }
  try {
    return await fetch(`/config/v1/device-group/${name}`, {
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

export const apiPostDeviceGroup = async (name: string, deviceGroupData: any) => {
  if (!isValidDeviceGroupName(name)){
    throw new Error(`Error updating device group: Invalid name provided ${name}.`);
  }
  try {
    return await fetch(`/config/v1/device-group/${name}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deviceGroupData),
      });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const apiDeleteDeviceGroup = async (name: string) => {
  if (!isValidDeviceGroupName(name)){
    throw new Error(`Error deleting device group: Invalid name provided ${name}.`);
  }
  try {
    return await fetch(`/config/v1/device-group/${name}`, {
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