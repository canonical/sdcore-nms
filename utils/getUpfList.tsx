import { HTTPStatus } from "@/utils/utils";

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
    const upfList = await response.json();
    if (!response.ok) {
      throw new Error(`${response.status}: ${HTTPStatus(response.status)}. ${upfList.error}`)
    }
    return upfList;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
