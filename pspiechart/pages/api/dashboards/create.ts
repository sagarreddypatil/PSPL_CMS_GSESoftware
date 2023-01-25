import { NextApiRequest, NextApiResponse } from "next";
import { createDashboard } from "../../../lib/dashboard-store";

export default function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    res.status(200).json(createDashboard(req.body));
  } else {
    res.status(405).end();
  }
}
