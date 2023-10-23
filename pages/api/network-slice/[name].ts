import { NextApiRequest, NextApiResponse } from "next";


const WEBUI_ENDPOINT = process.env.WEBUI_ENDPOINT;


export default async function handleNetworkSlice(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      return handleGET(req, res);
    case "POST":
      return handlePOST(req, res);
    case "DELETE":
      return handleDELETE(req, res);
    default:
      res.setHeader("Allow", ["GET", "POST","PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function isValidName(name: string): boolean {
  return /^[a-zA-Z0-9-_]+$/.test(name);
}

/**
 * @openapi
 * /api/network-slice/{sliceID}:
 *   get:
 *     description: Returns the list of network slices
 *     parameters:
 *       - name: sliceID
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: List of network slices
 */
async function handleGET(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.query

  if (typeof name !== 'string') {
    res.status(400).json({ error: "Invalid name provided." });
    return;
  }

  if (!isValidName(name)) {
    res.status(400).json({ error: "Invalid name provided." });
    return;
  }

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
    res.status(200).json(data);

  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({
      error: "An error occurred while getting the network slice",
    });
  }
}


/**
 * @openapi
 * /api/network-slice/{sliceID}:
 *   post:
 *     description: Create a new network slice
 *     parameters:
 *       - name: slice ID
 *         in: path
 *         required: true
 *         type: string
 */
async function handlePOST(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.query

  if (typeof name !== 'string') {
    res.status(400).json({ error: "Invalid name provided." });
    return;
  }

  if (!isValidName(name)) {
    res.status(400).json({ error: "Invalid name provided." });
    return;
  }
  
  const url = `${WEBUI_ENDPOINT}/config/v1/network-slice/${name}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
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

    if (typeof name !== 'string') {
      res.status(400).json({ error: "Invalid name provided." });
      return;
    }
  
    if (!isValidName(name)) {
      res.status(400).json({ error: "Invalid name provided." });
      return;
    }
  
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
  