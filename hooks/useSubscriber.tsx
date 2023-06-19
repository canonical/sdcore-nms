import { useCallback } from "react";
import {
  STATIC_SUSBCRIBER_DATA,
  STATIC_DEVICE_GROUP_DATA,
} from "@/sdcoreConfig";

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
          // mode: "no-cors",
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
        `${webuiEndpoint}/config/v1/device-group/cows`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            "imsis": [...currentSubscribers, imsi],
            "site-info": "demo",
            "ip-domain-name": "pool1",
            "ip-domain-expanded": {
              dnn: "internet",
              "ue-ip-pool": "172.250.1.0/16",
              "dns-primary": "8.8.8.8",
              mtu: 1460,
              "ue-dnn-qos": {
                "dnn-mbr-uplink": 20000000,
                "dnn-mbr-downlink": 200000000,
                "traffic-class": {
                  name: "platinum",
                  arp: 6,
                  pdb: 300,
                  pelr: 6,
                  qci: 8,
                },
              },
            },
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
