import { NextApiRequest, NextApiResponse } from "next";
import {
    WEBUI_ENDPOINT,
    STATIC_DEVICE_GROUP_DATA,
    STATIC_NETWORK_SLICE_DATA,
  } from "@/config/sdcoreConfig";

export default async function deleteSubscriber(req: NextApiRequest, res: NextApiResponse) {
  const imsi = req.query.imsi as string;

  const getFilteredSubscribers = (imsiList: string[], imsiToRemove: string): string[] => {
    return imsiList.filter((imsi) => imsi !== imsiToRemove);
  };

  try {
    const response = await fetch(`${WEBUI_ENDPOINT}/api/subscriber/imsi-${imsi}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete subscriber");
    }

    const responseRemove = await fetch(
      `${WEBUI_ENDPOINT}/config/v1/device-group/${STATIC_NETWORK_SLICE_DATA["site-device-group"][0]}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imsis: [...getFilteredSubscribers(req.body.currentSubscribers, imsi)],
          ...STATIC_DEVICE_GROUP_DATA,
        }),
      }
    );

    if (!responseRemove.ok) {
      throw new Error(`Failed to add subscriber to device group. Error code : ${responseRemove.status}`);
    }

    res.status(200).send("Subscriber deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while deleting the subscriber" });
  }
}
