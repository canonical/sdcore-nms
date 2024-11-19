export interface UpfItem {
  hostname: string;
  port: string;
}

export const getUpfList = async (token: string): Promise<UpfItem[]> => {
  try {
    const response = await fetch("/config/v1/inventory/upf", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch UPF list");
    }
    const upfList = await response.json();
    return upfList;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
