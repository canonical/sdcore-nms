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
    return gnbList;
  } catch (error) {
    console.error(`Error retrieving gNB list ${error}`);
    throw error;
  }
};

interface EditGnbArgs {
  name: string;
  tac: number;
  token: string;
}

export async function editGnb({
  name,
  tac,
  token
}: EditGnbArgs): Promise<void>{

  try {
    const response = await fetch(`/config/v1/inventory/gnb/${name}`, {
      method: "PUT",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        {
          "tac": tac,
        }
      ),
    });
    const respData = await response.json();
    if (!response.ok) {
      throw new WebconsoleApiError(response.status, respData.error);
    }
  } catch (error) {
    console.error(`Error in PUT gNB ${name}: ${error}`);
    throw error;
  }
};
