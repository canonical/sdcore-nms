export interface GnbItem {
  name: string;
  tac: number;
}

const WEBUI_ENDPOINT = process.env.WEBUI_ENDPOINT || 'http://localhost:3000';

export const getGnbList = async (): Promise<GnbItem[]> => {
  try {
    const response = await fetch(`http://${WEBUI_ENDPOINT}/config/v1/inventory/gnb`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch GNB list");
    }
    const gnbList = await response.json();
    return gnbList.map((gnb: GnbItem) => ({
      ...gnb,
      tac: Number(gnb.tac),
    }));
  } catch (error) {
    console.error(error);
    throw error;
  }
};
