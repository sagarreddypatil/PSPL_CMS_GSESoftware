import { NextApiRequest, NextApiResponse } from "next";
import { getDashboards, createDashboard } from "@/lib/dashboard-store";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "POST") {
    res.status(200).json(createDashboard(JSON.parse(req.body)));
  } else if (req.method === "GET") {
    res.status(200).json(getDashboards());
  }
}
