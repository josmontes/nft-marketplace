import { MetaMaskInpageProvider } from "@metamask/providers";
import { Contract, providers } from "ethers";
import { SWRResponse } from "swr";

export type Web3Dependencies = {
  ethereum: MetaMaskInpageProvider;
  provider: providers.Web3Provider;
  contract: Contract;
};

export type HookFactory<D = any, P = any> = {
  (d: Partial<Web3Dependencies>): (params: P) => SWRResponse<D>;
};
// Separate alternative
// export type AccountHookFactory<D = any, P = any> = {
//   (d: Partial<Web3Dependencies>): AccountHook<D, P>;
// };
// export type AccountHook<D = any, P = any> = (params: P) => AccountResponse<D>;
// export type AccountResponse<D = any> = SWRResponse<D>;

