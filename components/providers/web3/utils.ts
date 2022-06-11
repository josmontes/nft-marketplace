import { setupHooks, Web3Hooks } from "@hooks/web3/setup";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { Web3Dependencies } from "@_types/hooks";
import { Contract, ethers, providers } from "ethers";

declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider;
  }
}

type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

export type Web3State = {
  isLoading: boolean; // is the web3 provider loading
  hooks: Web3Hooks; // hooks for the web3 provider
} & Nullable<Web3Dependencies>;

export const createDefaultState = (): Web3State => {
  return {
    isLoading: true,
    ethereum: null,
    provider: null,
    contract: null,
    hooks: setupHooks({ isLoading: true } as any),
  };
};

export const createWeb3State = ({
  ethereum,
  provider,
  contract,
  isLoading,
}: Web3Dependencies) => {
  return {
    isLoading,
    ethereum,
    provider,
    contract,
    hooks: setupHooks({ ethereum, provider, contract, isLoading }),
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
