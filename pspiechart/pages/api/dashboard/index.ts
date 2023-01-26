import { NextApiRequest, NextApiResponse } from "next";
import { getDashboards } from "../../../lib/dashboard-store";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(getDashboards());
}
