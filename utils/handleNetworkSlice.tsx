export const handleGetNetworkSlice = async (name: string) => {
    try {
      const response = await fetch(`/config/v1/network-slice/${name}`, {
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

export const handleGetNetworkSlices = async () => {
    try {
      const networkSlicesResponse = await fetch(`/config/v1/network-slice`, {
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

export const handlePostNetworkSlice = async (name: string, sliceData: any) => {
  try {
    const response = await fetch(`/config/v1/network-slice/${name}`, {
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

export const handleDeleteNetworkSlice = async (name: string) => {
  try {
    const response = await fetch(`/config/v1/network-slice/${name}`, {
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