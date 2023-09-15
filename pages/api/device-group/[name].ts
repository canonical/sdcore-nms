import { NextApiRequest, NextApiResponse } from "next";


const WEBUI_ENDPOINT = process.env.WEBUI_ENDPOINT;


export type DeviceGroupRequestBody = {
    UEIPPool: string;
    DNSPrimary: string;
    MTU: number;
};


export default async function handleDeviceGroup(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "POST":
      return handlePOST(req, res);
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}


async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.query
  
  const { UEIPPool, DNSPrimary, MTU } = req.body as DeviceGroupRequestBody;
  const url = `${WEBUI_ENDPOINT}/config/v1/device-group/${name}`;

  const deviceGroupData = {
    "site-info": "demo",
    "ip-domain-name": "pool1",
    "ip-domain-expanded": {
        "dnn": "internet",
        "ue-ip-pool": UEIPPool,
        "dns-primary": DNSPrimary,
        "mtu": MTU,
        "ue-dnn-qos": {

        }

    }
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(deviceGroupData),
    });

    if (!response.ok) {
      throw new Error(`Error creating device group. Error code: ${response.status}`);
    }

    res.status(200).json({ message: "Device Group created successfully" });
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({
      error: "An error occurred while creating the device group",
    });
  }
}
