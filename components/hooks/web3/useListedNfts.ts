import { HookFactory } from "@_types/hooks";
import useSWR from "swr";

type UseListedNftsResponse = {};

type ListedNftsHookFactory = HookFactory<any, UseListedNftsResponse>;

export type UseListedNftsHook = ReturnType<ListedNftsHookFactory>;

export const hookFactory: ListedNftsHookFactory =
  ({ contract }) =>
  () => {
    const { data, isValidating, ...swr } = useSWR(
      contract ? "web3/useListedNfts" : null,
      async () => {
        return [];
      }
    );

    return {
      ...swr,
      data: data ?? [],
      isValidating,
    };
  };
