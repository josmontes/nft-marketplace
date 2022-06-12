import { MetaMaskInpageProvider } from "@metamask/providers";
import { Contract, providers } from "ethers";
import { SWRResponse } from "swr";
import { NftMarketContract } from "./nftMarketContract";

export type Web3Dependencies = {
  ethereum: MetaMaskInpageProvider;
  provider: providers.Web3Provider;
  contract: NftMarketContract;
  isLoading: boolean;
};

export type HookFactory<D = any, R = any, P = any> = {
  (d: Partial<Web3Dependencies>): (params?: P) => SWRResponse<D> & R;
};
