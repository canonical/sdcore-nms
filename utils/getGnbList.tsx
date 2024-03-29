export interface GnbItem {
  name: string;
  tac: number;
}

export const getGnbList = async (): Promise<GnbItem[]> => {
  try {
    const response = await fetch("/api/gnb", {
      method: "GET",
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
