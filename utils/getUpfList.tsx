export interface UpfItem {
  hostname: string;
  port: string;
}

const WEBUI_ENDPOINT = process.env.WEBUI_ENDPOINT || 'http://localhost:3000';

export const getUpfList = async (): Promise<UpfItem[]> => {
  try {
    const response = await fetch(`http://${WEBUI_ENDPOINT}/config/v1/inventory/upf`, {
      method: "GET",
      headers: {
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
