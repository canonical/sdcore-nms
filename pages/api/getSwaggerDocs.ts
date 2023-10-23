import { getApiDocs } from "@/utils/swagger";

export default async function handler(req, res) {
  const spec = await getApiDocs();
  res.status(200).json(spec);
}
