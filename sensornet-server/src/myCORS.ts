// From https://github.com/neo773/hyper-express-cors
// MIT License, as mentioned in its package.json

import HyperExpress from "hyper-express";

interface CORSOptions {
  origin: string;
  credentials: boolean;
}

const useCORS = (options: CORSOptions) => {
  return async (
    request: HyperExpress.Request,
    response: HyperExpress.Response
  ) => {
    response.header("vary", "Origin");
    response.header("Access-Control-Allow-Headers", "content-type");
    response.header("Access-Control-Allow-Methods", "OPTIONS, POST, GET");
    response.header("Access-Control-Allow-Origin", options.origin);
    response.header(
      "Access-Control-Allow-Credentials",
      options.credentials.toString()
    );

    if (request.method === "OPTIONS") {
      response.status(200);
      response.send("");
      
    }
  };
};

export default useCORS;
