import { handleGetNetworkSlices } from "@/utils/handleNetworkSlice";

export const checkBackendAvailable = async () => {
  try {
    const response = await handleGetNetworkSlices();

    return response.status === 200;
  } catch (error) {
    return false;
  }
};
