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
import { FileReq, NftMeta } from "@_types/nft";
import axios from "axios";
import FormData from "form-data";

export default withSession(
  async (req: NextApiRequest & { session: Session }, res: NextApiResponse) => {
    if (req.method === "POST") {
      try {
        const { bytes, fileName, contentType } = req.body as FileReq;

        if (!bytes || !fileName || !contentType)
          return res.status(422).send({ message: "Invalid data" });

        await addressCheckMiddleware(req, res);

        const buffer = Buffer.from(Object.values(bytes));

        const formData = new FormData();
        formData.append("file", buffer, {
          filename: fileName + "-" + uuidv4(),
          contentType: contentType,
        });

        const response = await axios.post(
          "https://api.pinata.cloud/pinning/pinFileToIPFS",
          formData,
          {
            maxBodyLength: Infinity,
            headers: {
              "Content-Type": `multipart/form-data; boundary=${formData.getBoundary()}`,
              pinata_api_key: pinataApiKey,
              pinata_secret_api_key: pinataSecret,
            },
          }
        );
        
        return res.status(200).send(response.data);

      } catch (e: any) {
        console.log(e.response.data);
        return res.status(422).send(e.response.data);
      }
    } else return res.status(405).json({ error: "Method not allowed" });
  }
);
