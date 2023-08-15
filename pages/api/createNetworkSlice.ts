import { NextApiRequest, NextApiResponse } from "next";
import {
    WEBUI_ENDPOINT,
    NETWORK_SLICE_NAME,
    STATIC_NETWORK_SLICE_DATA,
  } from "@/config/sdcoreConfig";

export type NetworkSliceData = {
    "slice-id": {
      sst: string;
      sd: string;
    };
    "site-device-group": string[];
    "site-info": {
      "site-name": string;
      "plmn": {
        "mcc": string;
        "mnc": string;
      };
      "gNodeBs": {
        "name": string;
        "tac": number;
      }[];
      "upf": {
        "upf-name": string;
        "upf-port": string;
      };
    };
  };
  

export default async function createNetworkSlice(req: NextApiRequest, res: NextApiResponse) {
  const { mcc, mnc } = req.body;

  const url = `${WEBUI_ENDPOINT}/config/v1/network-slice/${NETWORK_SLICE_NAME}`;
  const headers = {
    "Content-Type": "application/json",
  };

  const networkSliceData: NetworkSliceData = {
      ...STATIC_NETWORK_SLICE_DATA,
      "site-info": {
        ...STATIC_NETWORK_SLICE_DATA["site-info"],
        plmn: { mcc: mcc, mnc: mnc },
      },
    };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(networkSliceData),
    });

    if (!response.ok) {
      throw new Error(`Error creating network. Error code: ${response.status}`);
    }

    res.status(200).json({ message: "Network created successfully" });
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ error: 'An error occurred while creating the network' });
  }
}
