import { NextApiRequest, NextApiResponse } from "next";


const WEBUI_ENDPOINT = process.env.WEBUI_ENDPOINT;


export default async function handleDeviceGroup(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      return handleGET(req, res);
    case "POST":
      return handlePOST(req, res);
    case "DELETE":
      return handleDELETE(req, res);
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}


async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.query
  
  const url = `${WEBUI_ENDPOINT}/config/v1/device-group/${name}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
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

async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.query
  
  const url = `${WEBUI_ENDPOINT}/config/v1/device-group/${name}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error getting device group. Error code: ${response.status}`);
    }

    res.status(200).json({ message: "Device Group retrieved successfully" });
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({
      error: "An error occurred while retrieving the device group",
    });
  }
}

async function handleDELETE(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.query
  
  const url = `${WEBUI_ENDPOINT}/config/v1/device-group/${name}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error deleting device group. Error code: ${response.status}`);
    }

    res.status(200).json({ message: "Device Group deleted successfully" });
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({
      error: "An error occurred while deleting the device group",
    });
  }
}
