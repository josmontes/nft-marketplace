import { v4 as uuidv4 } from "uuid";
import { Session } from "next-iron-session";
import { NextApiRequest, NextApiResponse } from "next";
import {
  withSession,
  contractAddress,
  addressCheckMiddleware,
  pinataApiKey,
  pinataSecret,
} from "./utils";
import { NftMeta } from "@_types/nft";
import axios from "axios";

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

        const response = await axios.post(
          "https://api.pinata.cloud/pinning/pinJSONToIPFS",
          {
            pinataMetadata: {
              name: uuidv4(),
            },
            pinataContent: nft,
          },
          {
            headers: {
              pinata_api_key: pinataApiKey,
              pinata_secret_api_key: pinataSecret,
            },
          }
        );

        return res.status(200).send(response.data);
      } catch (e: any) {
        console.log(e.response.data);
        return res.status(422).send(e.message);
      }
    } else return res.status(405).json({ error: "Method not allowed" });
  }
);
