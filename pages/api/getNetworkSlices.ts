import { NextApiRequest, NextApiResponse } from "next";
import { WEBUI_ENDPOINT } from "@/config/sdcoreConfig";



export default async function getNetworkSlices(req: NextApiRequest, res: NextApiResponse) {

  const url = `${WEBUI_ENDPOINT}/config/v1/network-slice/`;
  const headers = {
    "Content-Type": "application/json",
  };


  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Error retrieving network slices. Error code: ${response.status}`);
    }

    res.status(200).json({ message: "Network slices retrieved successfully" });
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ error: 'An error occurred while retrieving network slices' });
  }
}