import { MetaMaskInpageProvider } from "@metamask/providers";
import { Contract, providers } from "ethers";

declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider;
  }
}

export type Web3Params = {
  ethereum: MetaMaskInpageProvider | null;
  provider: providers.Web3Provider | null;
  contract: Contract | null;
};

export type Web3State = {
  isLoading: boolean; // is the web3 provider loading
} & Web3Params;

export const createDefaultState = (): Web3State => {
  return {
    isLoading: true,
    ethereum: null,
    provider: null,
    contract: null,
  };
};
