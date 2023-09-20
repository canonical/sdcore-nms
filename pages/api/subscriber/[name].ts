import { NextApiRequest, NextApiResponse } from "next";


const WEBUI_ENDPOINT = process.env.WEBUI_ENDPOINT;

export default async function handleSubscriber(req: NextApiRequest, res: NextApiResponse) {
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
    
    const url = `${WEBUI_ENDPOINT}/api/subscriber/${name}`;
  
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      });
  
      if (!response.ok) {
        throw new Error(`Error creating subscriber. Error code: ${response.status}`);
      }
  
      res.status(200).json({ message: "Subscriber created successfully" });
    } catch (error) {
      console.error("Error details:", error);
      res.status(500).json({
        error: "An error occurred while creating the subscriber",
      });
    }
  }