import { NftMarketContract } from "@_types/nftMarketContract";
import { ethers } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import { Session, withIronSession } from "next-iron-session";
import contract from "../../public/contracts/NftMarket.json";
import * as util from "ethereumjs-util";

const NETWORKS = {
  "5777": "Ganache Local Network",
};
type NETWORK = typeof NETWORKS;

const abi = contract.abi;
const targetNetwork = process.env.NEXT_PUBLIC_NETWORK_ID as keyof NETWORK;
export const contractAddress = contract.networks[targetNetwork].address;

export function withSession(handler: any) {
  return withIronSession(handler, {
    password: process.env.SESSION_PASSWORD as string,
    cookieName: "session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      httpOnly: true,
    },
  });
}

export const addressCheckMiddleware = async (
  req: NextApiRequest & { session: Session },
  res: NextApiResponse
) => {
  return new Promise(async (resolve, reject) => {
    const { session } = req;
    const message = session.get("message-session");
    const provider = new ethers.providers.JsonRpcProvider(
      "http://localhost:7545"
    );
    const contract = new ethers.Contract(
      contractAddress,
      abi,
      provider
    ) as unknown as NftMarketContract;

    let nonce: string | Buffer =
      "\x19Ethereum Signed Message:\n" +
      JSON.stringify(message).length +
      JSON.stringify(message);

    nonce = util.keccak(Buffer.from(nonce, "utf8"));
    const { v, r, s } = util.fromRpcSig(req.body.signature);
    const publicKey = util.ecrecover(util.toBuffer(nonce), v, r, s);
    const addressBuffer = util.pubToAddress(publicKey);
    const address = util.bufferToHex(addressBuffer);

    address === req.body.address
      ? resolve("Correct address")
      : reject("Incorrect address");
  });
};
