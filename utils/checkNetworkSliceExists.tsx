export const checkNetworkSliceExists = async () => {
  try {
    const response = await fetch(`/api/network-slice`);

    if (response.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};
