import { NextApiRequest, NextApiResponse } from "next";
import { WEBUI_ENDPOINT, NETWORK_SLICE_NAME } from "@/config/sdcoreConfig";



export default async function getNetworkSlice(req: NextApiRequest, res: NextApiResponse) {

  const url = `${WEBUI_ENDPOINT}/config/v1/network-slice/${NETWORK_SLICE_NAME}`;
  const headers = {
    "Content-Type": "application/json",
  };


  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Error retrieving network slice. Error code: ${response.status}`);
    }

    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ error: 'An error occurred while retrieving the network slice' });
  }
}
