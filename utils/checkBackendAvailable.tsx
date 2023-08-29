export const checkBackendAvailable = async () => {
    try {
      const response = await fetch(`/api/getSubscribers`);
  
      if (response.status === 200) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };
  