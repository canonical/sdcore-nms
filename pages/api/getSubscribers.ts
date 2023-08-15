import { NextApiRequest, NextApiResponse } from "next";
import {
  WEBUI_ENDPOINT,
} from "@/config/sdcoreConfig";

export default async function getSubscribers(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await fetch(`${WEBUI_ENDPOINT}/api/subscriber`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch subscribers");
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching subscribers" });
  }
}
