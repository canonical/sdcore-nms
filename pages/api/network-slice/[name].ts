import { NextApiRequest, NextApiResponse } from "next";


const WEBUI_ENDPOINT = process.env.WEBUI_ENDPOINT;


export type NetworkSliceRequestBody = {
  mcc: string;
  mnc: string;
  name: string;
  gNodeBs: {
    name: string;
    tac: number;
  }[];
  upf: {
    "upf-name": string;
    "upf-port": string;
  };
  deviceGroups: {}[];
};


export default async function handleNetworkSlice(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      return handleGET(req, res);
    case "POST":
      return handlePOST(req, res);
    case "DELETE":
      return handleDELETE(req, res);
    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.query


  const url = `${WEBUI_ENDPOINT}/config/v1/network-slice/${name}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });


    if (!response.ok) {
      throw new Error(
        `Error getting network slice. Error code: ${response.status}`
      );
    }

    const data = await response.json();
    console.log(data)
    res.status(200).json(data);

  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({
      error: "An error occurred while getting the network slice",
    });
  }
}



async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.query
  
  const { mcc, mnc, gNodeBs, upf, deviceGroups } = req.body as NetworkSliceRequestBody;
  const url = `${WEBUI_ENDPOINT}/config/v1/network-slice/${name}`;

  const networkSliceData = {
    "slice-id": {
      "sst": "1",
      "sd": "010203",
    },
    "site-device-group": deviceGroups,
    "site-info": {
      "site-name": "demo",
      "plmn": { "mcc": mcc, "mnc": mnc },
      "gNodeBs": gNodeBs,
      "upf": upf,
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
      throw new Error(`Error creating network slice. Error code: ${response.status}`);
    }

    res.status(200).json({ message: "Network Slice created successfully" });
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({
      error: "An error occurred while creating the network slice",
    });
  }
}

async function handleDELETE(req: NextApiRequest, res: NextApiResponse) {
    const { name } = req.query

  
    const url = `${WEBUI_ENDPOINT}/config/v1/network-slice/${name}`;
  
    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error(
          `Error deleting network slice. Error code: ${response.status}`
        );
      }
  
      res.status(202).send('Deleted successfully');
    } catch (error) {
      console.error("Error details:", error);
      res.status(500).json({
        error: "An error occurred while deleting the network slice",
      });
    }
  }
  