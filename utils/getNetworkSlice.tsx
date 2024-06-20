import { NetworkSlice } from "@/components/types";
import { handleGetNetworkSlice } from "@/utils/handleNetworkSlice";

export const getNetworkSlice = async (sliceName: string): Promise<NetworkSlice> => {
  try {
    const response = await handleGetNetworkSlice(sliceName);
    if (!response.ok) {
      throw new Error("Failed to fetch network slice");
    }
    const slice = await response.json();
    return slice;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
