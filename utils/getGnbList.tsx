import { HTTPStatus } from "@/utils/utils";

export interface GnbItem {
  name: string;
  tac: number;
}

export const getGnbList = async (token: string): Promise<GnbItem[]> => {
  try {
    const response = await fetch("/config/v1/inventory/gnb", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
    });
    const gnbList = await response.json();
    if (!response.ok) {
      throw new Error(`${response.status}: ${HTTPStatus(response.status)}. ${gnbList.error}`)
    }

    return gnbList.map((gnb: GnbItem) => ({
      ...gnb,
      tac: Number(gnb.tac),
    }));
  } catch (error) {
    console.error(error);
    throw error;
  }
};
