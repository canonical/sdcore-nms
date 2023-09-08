import { NextApiRequest, NextApiResponse } from "next";
import {
  WEBUI_ENDPOINT,
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


export default async function handleNetworkSlice(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "POST":
      return handlePOST(req, res);
    case "GET":
      return handleGET(req, res);
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  
  const { mcc, mnc, name } = req.body;
  const url = `${WEBUI_ENDPOINT}/config/v1/network-slice/${name}`;

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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(networkSliceData),
    });

    if (!response.ok) {
      throw new Error(`Error creating network. Error code: ${response.status}`);
    }

    res.status(200).json({ message: "Network created successfully" });
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({
      error: "An error occurred while creating the network",
    });
  }
}

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const url = `${WEBUI_ENDPOINT}/config/v1/network-slice/`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Error retrieving network slice. Error code: ${response.status}`
      );
    }

    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({
      error: "An error occurred while retrieving the network slice",
    });
  }
}
