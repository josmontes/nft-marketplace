import { MetaMaskInpageProvider } from "@metamask/providers";
import { Contract, providers } from "ethers";
import { SWRResponse } from "swr";

export type Web3Dependencies = {
  ethereum: MetaMaskInpageProvider;
  provider: providers.Web3Provider;
  contract: Contract;
  isLoading: boolean;
};

export type HookFactory<D = any, R = any, P = any> = {
  (d: Partial<Web3Dependencies>): (params?: P) => SWRResponse<D> & R;
};
// Separate alternative
// export type AccountHookFactory<D = any, P = any> = {
//   (d: Partial<Web3Dependencies>): AccountHook<D, P>;
// };
// export type AccountHook<D = any, P = any> = (params: P) => AccountResponse<D>;
// export type AccountResponse<D = any> = SWRResponse<D>;
