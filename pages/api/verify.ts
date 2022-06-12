

import {v4 as uuidv4} from "uuid";
import {Session} from "next-iron-session";
import { NextApiRequest, NextApiResponse } from "next";
import { withSession, contractAddress } from "./utils";

export default (withSession(async (req: NextApiRequest & {session: Session}, res: NextApiResponse, ) => {
  if (req.method !== "GET") res.status(405).json({error: "Method not allowed"});
  try {
    const message = {
      contractAddress, id: uuidv4(), 
    }
    req.session.set("message-session", message);
    await req.session.save();
    res.status(200).json(message);
  } catch (e) {
    res.status(422).send({message: "Cannot generate message"});
  }
}))