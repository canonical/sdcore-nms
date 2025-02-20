import { UpfItem } from "@/components/types";
import { WebconsoleApiError } from "@/utils/errors";


export const getUpfList = async (token: string): Promise<UpfItem[]> => {
  try {
    const response = await fetch("/config/v1/inventory/upf", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
    });
    const upfList = await response.json();
    if (!response.ok) {
      throw new WebconsoleApiError(response.status, upfList.error);
    }
    return upfList;
  } catch (error) {
    console.error(`Error retrieving UPF list ${error}`);
    throw error;
  }
};
