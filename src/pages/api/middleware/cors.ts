// pages/api/middleware/cors.ts

import {NextApiResponse, NextApiHandler} from "next";

const cors =
  <T extends NextApiHandler>(handler: T) =>
  (req: any, res: NextApiResponse) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }
    return handler(req, res);
  };

export default cors;
