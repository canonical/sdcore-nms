import { useCallback } from "react";

export const useSubscriber = (
  imsi: string,
  opc: string,
  key: string,
  sequenceNumber: string,
  currentSubscribers: string[]
) => {
  const handleSubscriber = useCallback(async () => {
    try {
      const response = await fetch("/api/createSubscriber", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imsi,
          opc,
          key,
          sequenceNumber,
          currentSubscribers
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create subscriber. Error code: ${response.status}`);
      }
    } catch (error) {
      console.error(error);
    }
  }, [imsi, opc, key, sequenceNumber, currentSubscribers]);

  return { handleSubscriber };
};
