import { NextApiRequest, NextApiResponse } from "next";
import {
  getDashboard,
  updateDashboard,
  deleteDashboard,
} from "@/lib/dashboard-store";

export default function handle(req: NextApiRequest, res: NextApiResponse) {
  // throw if req.query.id is not a number
  const id = parseInt(req.query.id as string);

  if (isNaN(id)) {
    res.status(400).end();
    return;
  }

  if (req.method === "GET") {
    res.status(200).json(getDashboard(parseInt(req.query.id as string)));
  } else if (req.method === "POST") {
    res.status(200).json(updateDashboard(JSON.parse(req.body)));
  } else if (req.method === "DELETE") {
    res.status(200).json(deleteDashboard(parseInt(req.query.id as string)));
  }
}
