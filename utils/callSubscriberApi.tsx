function isValidSubscriberName(name: string): boolean {
  return /^[a-zA-Z0-9-_]+$/.test(name);
}

export const apiGetAllSubscribers = async (token: string) => {
  try {
    return await fetch(`/api/subscriber`, {
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

export const apiGetSubscriber = async (imsi: string, token: string) => {
  if (!isValidSubscriberName(imsi)) {
    throw new Error(`Error getting subscriber: Invalid name provided ${imsi}.`);
  }
  try {
    return await fetch(`/api/subscriber/imsi-${imsi}`, {
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

export const apiPostSubscriber = async (imsi: string, subscriberData: any, token: string) => {
  if (!isValidSubscriberName(imsi)) {
    throw new Error(`Error updating subscriber: Invalid name provided ${imsi}.`);
  }
  try {
    return await fetch(`/api/subscriber/imsi-${imsi}`, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscriberData),
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const apiDeleteSubscriber = async (imsi: string, token: string) => {
  if (!isValidSubscriberName(imsi)) {
    throw new Error(`Error deleting subscriber: Invalid name provided ${imsi}.`);
  }
  try {
    return await fetch(`/api/subscriber/imsi-${imsi}`, {
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