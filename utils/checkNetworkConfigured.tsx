export const checkNetworkConfigured = async () => {
    try {
      const response = await fetch(`/api/getNetworkSlice`);
  
      if (response.status === 200) {
        return true;
        
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };
  