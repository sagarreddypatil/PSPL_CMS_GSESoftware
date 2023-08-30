import { Request, Response } from "hyper-express";

type myCORSOpts = {
  origin: string;
  optionsRoute?: boolean;
};

export default function myCORS(options: myCORSOpts) {
  return (req: Request, res: Response) => {
    res.header("vary", "Origin");
    res.header("Access-Control-Allow-Headers", "content-type");
    res.header("Access-Control-Allow-Methods", "OPTIONS, POST, GET");
    res.header("Access-Control-Allow-Origin", options.origin);
    res.header("Access-Control-Allow-Credentials", "true");

    if (options.optionsRoute === true) {
      res.send("");
    }
  };
}
