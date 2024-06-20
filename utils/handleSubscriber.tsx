export const handleGetSubscriber = async (imsi: string) => {
    try {
      const response = await fetch(`/api/subscriber/imsi-${imsi}`, {
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

export const handleGetSubscribers = async () => {
  try {

    const response = await fetch(`/api/subscriber`, {
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

export const handlePostSubscriber = async (imsi: string, subscriberData: any) => {
  try {
    const response = await fetch(`/api/subscriber/imsi-${imsi}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscriberData),
      });

    return response
  } catch (error) {
      console.error(error);
      throw error;
  }
};

export const handleDeleteSubscriber = async (imsi: string) => {
  try {
    const response = await fetch(`/api/subscriber/imsi-${imsi}`, {
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