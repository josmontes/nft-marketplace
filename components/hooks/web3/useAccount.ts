import { HookFactory } from "@_types/hooks";
import { useEffect } from "react";
import useSWR from "swr";

type UseAccountResponse = {
  connect: () => void;
  isLoading: boolean;
  isInstalled: boolean;
};

type AccountHookFactory = HookFactory<string, UseAccountResponse>;

export type UseAccountHook = ReturnType<AccountHookFactory>;

export const hookFactory: AccountHookFactory =
  ({ ethereum, contract, provider, isLoading }) =>
  () => {
    const { data, mutate, isValidating, ...swr } = useSWR(
      provider ? "web3/useAccount" : null,
      async () => {
        const accounts = await provider!.listAccounts();
        const account = accounts[0];

        if (!account) throw "Could not find account";

        return account;
      },
      {
        revalidateOnFocus: false,
      }
    );

    useEffect(() => {
      ethereum?.on("accountsChanged", handleAccountChange);
      return () => {
        ethereum?.removeListener("accountsChanged", handleAccountChange);
      };
    });

    const handleAccountChange = (...args: unknown[]) => {
      console.log("account change", args);
      const accounts = args[0] as string[];
      if (accounts.length === 0) console.error("Connect to MetaMask");
      else if (accounts[0] !== data) {
        mutate(accounts[0]);
      }
    };

    const connect = async () => {
      try {
        ethereum?.request({ method: "eth_requestAccounts" });
      } catch (e) {
        console.error(e);
      }
    };

    return {
      ...swr,
      data,
      isValidating,
      isLoading: isLoading || isValidating,
      isInstalled: ethereum?.isMetaMask || false,
      mutate,
      connect,
    };
  };
