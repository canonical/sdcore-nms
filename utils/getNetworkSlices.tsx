import { NetworkSlice } from "@/components/types";
import { handleGetNetworkSlice, handleGetNetworkSlices } from "@/utils/handleNetworkSlice";

export const getNetworkSlices = async (): Promise<NetworkSlice[]> => {
  try {
    const response = await handleGetNetworkSlices();
    if (!response.ok) {
      throw new Error("Failed to fetch network slices");
    }
    const sliceNames = await response.json();

    const sliceDetailsPromises = sliceNames.map(async (sliceName: string) => {
      const detailResponse = await handleGetNetworkSlice(sliceName);
      if (!detailResponse.ok) {
        throw new Error(`Failed to fetch details for slice: ${sliceName}`);
      }
      return detailResponse.json();
    });

    return await Promise.all(sliceDetailsPromises);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
