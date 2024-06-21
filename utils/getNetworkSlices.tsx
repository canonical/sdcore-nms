import { NetworkSlice } from "@/components/types";
import { apiGetNetworkSlice, apiGetNetworkSlices } from "@/utils/apiNetworkSliceCalls";

export const getNetworkSlices = async (): Promise<NetworkSlice[]> => {
  try {
    const response = await apiGetNetworkSlices();
    if (!response.ok) {
      throw new Error("Failed to fetch network slices");
    }
    const sliceNames = await response.json();

    const sliceDetailsPromises = sliceNames.map(async (sliceName: string) => {
      const detailResponse = await apiGetNetworkSlice(sliceName);
      if (!detailResponse.ok) {
        throw new Error(`Failed to fetch details for network slice: ${sliceName}`);
      }
      return detailResponse.json();
    });

    return await Promise.all(sliceDetailsPromises);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
