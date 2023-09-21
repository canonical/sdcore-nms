export const deleteSubscriber = async (name: string) => {
  try {
    const response = await fetch(`/api/subscriber/${name}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete subscriber");
    }
    return true;
  } catch (error) {
    console.error(error);
  }
};
