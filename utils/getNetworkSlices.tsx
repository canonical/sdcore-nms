import { NetworkSlice } from "@/components/types";
import { apiGetNetworkSlice, apiGetAllNetworkSlices } from "@/utils/callNetworkSliceApi";

export const getNetworkSlices = async (token: string): Promise<NetworkSlice[]> => {
  try {
    const response = await apiGetAllNetworkSlices(token);
    if (!response.ok) {
      throw new Error("Failed to fetch network slices");
    }
    const sliceNames = await response.json();

    const sliceDetailsPromises = sliceNames.map(async (sliceName: string) => {
      const detailResponse = await apiGetNetworkSlice(sliceName, token);
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

export const getNetworkSliceNames = async (token: string): Promise<string[]> => {
    const response = await apiGetAllNetworkSlices(token);
    const respData = await response.json();
    if (!response.ok) {
        throw new Error(`${response.status}: ${respData.error}`)
    }
    return respData
}
