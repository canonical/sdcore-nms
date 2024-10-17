import { apiDeleteNetworkSlice } from "@/utils/callNetworkSliceApi";

export const deleteNetworkSlice = async (sliceName: string, token: string) => {
  try {
    const response = await apiDeleteNetworkSlice(sliceName, token);
    if (!response.ok) {
      throw new Error("Failed to delete network slice");
    }
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
