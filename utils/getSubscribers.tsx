export const getSubscribers = async () => {
  try {
    const response = await fetch(`/api/subscriber`, {
      method: "GET",
    });
    if (!response.ok)
      throw new Error(
        `Failed to fetch subscribers. Status: ${response.status}`,
      );
    const subscribers = await response.json();
    return subscribers;
  } catch (error) {
    console.error(error);
  }
};
