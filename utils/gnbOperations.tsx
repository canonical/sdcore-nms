import { GnbItem } from "@/components/types";
import { WebconsoleApiError } from "@/utils/errors";


export async function getGnbList(token: string): Promise<GnbItem[]> {
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
      throw new WebconsoleApiError(response.status, gnbList.error);
    }
    return gnbList.map((gnb: GnbItem) => ({
      ...gnb,
      tac: Number(gnb.tac),
    }));
  } catch (error) {
    console.error(`Error retrieving gNB list ${error}`);
    throw error;
  }
};
