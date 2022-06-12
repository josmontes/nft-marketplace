import { v4 as uuidv4 } from "uuid";
import { Session } from "next-iron-session";
import { NextApiRequest, NextApiResponse } from "next";
import { withSession, contractAddress, addressCheckMiddleware } from "./utils";
import { NftMeta } from "@_types/nft";

export default withSession(
  async (req: NextApiRequest & { session: Session }, res: NextApiResponse) => {
    if (req.method === "GET") {
      try {
        const message = {
          contractAddress,
          id: uuidv4(),
        };
        req.session.set("message-session", message);
        await req.session.save();
        return res.status(200).json(message);
      } catch (e) {
        return res.status(422).send({ message: "Cannot generate message" });
      }
    } else if (req.method === "POST") {
      try {
        const { body } = req;
        const nft = body.nft as NftMeta;

        if (!nft.name || !nft.description || !nft.attributes)
          return res.status(422).send({ message: "Missing required fields" });

        await addressCheckMiddleware(req, res);

        return res.status(200).send({ message: "OK" });
      } catch (e) {
        return res.status(422).send({ message: "Cannot verify message" });
      }
    } else return res.status(405).json({ error: "Method not allowed" });
  }
);
