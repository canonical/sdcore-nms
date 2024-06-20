export const handleGetDeviceGroup = async (name: string) => {
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

export const handleGetDeviceGroups = async () => {
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

export const handlePostDeviceGroup = async (name: string, deviceGroupData: any) => {
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

export const handleDeleteDeviceGroup = async (name: string) => {
  try {
    const deleteResponse = await fetch(`/config/v1/device-group/${name}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
    });

    return deleteResponse
  } catch (error) {
    console.error(error);
      throw error;
  }
};