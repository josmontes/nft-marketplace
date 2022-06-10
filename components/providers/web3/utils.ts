import { MetaMaskInpageProvider } from "@metamask/providers";
import { Contract, ethers, providers } from "ethers";

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

const NETWORK_ID = process.env.NEXT_PUBLIC_NETWORK_ID;

export const loadContract = async (
  name: string, // name of the contract
  provider: providers.Web3Provider // provider to use
): Promise<Contract> => {

  if (!NETWORK_ID) return Promise.reject("Network Id not set");

  const res = await fetch(`/contracts/${name}.json`);
  const Artifact = await res.json();

  if (!Artifact.networks[NETWORK_ID].address)
    return Promise.reject(`Contract [${name}] not deployed`);

  // create the contract
  const contract = new ethers.Contract(
    Artifact.networks[NETWORK_ID].address,
    Artifact.abi,
    provider
  );
  return contract;
};
