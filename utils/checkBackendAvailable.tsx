import { apiGetNetworkSlices } from "@/utils/networkSliceApiCalls";

export const checkBackendAvailable = async () => {
  try {
    const response = await apiGetNetworkSlices();
    return response.status === 200;
  } catch (error) {
    return false;
  }
};
