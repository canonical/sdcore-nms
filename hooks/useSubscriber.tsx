import { useCallback } from "react";
import {
  STATIC_SUSBCRIBER_DATA,
  STATIC_DEVICE_GROUP_DATA,
  STATIC_NETWORK_SLICE_DATA,
} from "@/public/sdcoreConfig";

export const useSubscriber = (
  webuiEndpoint: string,
  imsi: string,
  opc: string,
  key: string,
  sequenceNumber: string,
  currentSubscribers: string[]
) => {
  const createSubscriber = useCallback(async () => {
    try {
      const response = await fetch(
        `${webuiEndpoint}/api/subscriber/imsi-${imsi}`,
        {
          method: "POST",
          // mode: "no-cors", FIXME: Remove when webui API is fixed.
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            UeId: imsi,
            plmnId: STATIC_SUSBCRIBER_DATA.plmnID,
            opc: opc,
            key: key,
            sequenceNumber: sequenceNumber,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to create subscriber. Error code : ${response.status}`
        );
      }
    } catch (error) {
      console.error(error);
    }
  }, [webuiEndpoint, imsi, opc, key, sequenceNumber]);

  const addSubscriberToDeviceGroup = useCallback(async () => {
    try {
      const response = await fetch(
        `${webuiEndpoint}/config/v1/device-group/${STATIC_NETWORK_SLICE_DATA["site-device-group"][0]}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imsis: [...currentSubscribers, imsi],
            ...STATIC_DEVICE_GROUP_DATA,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to add subscriber to device group. Error code : ${response.status}`
        );
      }
    } catch (error) {
      console.error(error);
    }
  }, [webuiEndpoint, imsi, currentSubscribers]);

  const handleSubscriber = useCallback(async () => {
    await createSubscriber();
    await addSubscriberToDeviceGroup();
  }, [createSubscriber, addSubscriberToDeviceGroup]);

  return { createSubscriber, addSubscriberToDeviceGroup, handleSubscriber };
};
