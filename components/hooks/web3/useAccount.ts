import { HookFactory } from "@_types/hooks";
import useSWR from "swr";

type AccountHookFactory = HookFactory<string, string>;

export type UseAccountHook = ReturnType<AccountHookFactory>;

export const hookFactory: AccountHookFactory =
  ({ ethereum, contract, provider }) =>
  (params) => {
    const swrRes = useSWR("web3/useAccount", () => {
      return "Test User";
    });

    return swrRes;
  };
