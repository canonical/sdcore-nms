import { NextApiRequest, NextApiResponse } from "next";
import {
  WEBUI_ENDPOINT,
  STATIC_SUSBCRIBER_DATA,
  STATIC_DEVICE_GROUP_DATA,
  STATIC_NETWORK_SLICE_DATA,
} from "@/config/sdcoreConfig";

export default async function createSubscriber(req: NextApiRequest, res: NextApiResponse) {
  const { imsi, opc, key, sequenceNumber, currentSubscribers } = req.body;

  try {
    const response = await fetch(`${WEBUI_ENDPOINT}/api/subscriber/imsi-${imsi}`, {
      method: "POST",
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
    });

    if (!response.ok) {
      throw new Error(`Failed to create subscriber. Error code : ${response.status}`);
    }

    const responseDeviceGroup = await fetch(
      `${WEBUI_ENDPOINT}/config/v1/device-group/${STATIC_NETWORK_SLICE_DATA["site-device-group"][0]}`,
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

    if (!responseDeviceGroup.ok) {
      throw new Error(`Failed to add subscriber to device group. Error code : ${responseDeviceGroup.status}`);
    }

    res.status(200).send("Subscriber created successfully");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while creating the subscriber" });
  }
}
