export const checkNetworkSliceExists = async () => {
  try {
    const response = await fetch(`/api/network-slice`, {
      method: "GET",
    });

    if (response.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};
