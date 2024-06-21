import { apiGetNetworkSlices } from "@/utils/apiNetworkSliceCalls";

export const checkBackendAvailable = async () => {
  try {
    const response = await apiGetNetworkSlices();
    return response.status === 200;
  } catch (error) {
    return false;
  }
};
