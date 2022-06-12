import { HookFactory } from "@_types/hooks";
import { Nft } from "@_types/nft";
import { ethers } from "ethers";
import { useCallback } from "react";
import useSWR from "swr";

type UseListedNftsResponse = {
  buyNft: (tokenId: number, value: number) => Promise<void>;
};

type ListedNftsHookFactory = HookFactory<Nft[], UseListedNftsResponse>;

export type UseListedNftsHook = ReturnType<ListedNftsHookFactory>;

export const hookFactory: ListedNftsHookFactory =
  ({ contract }) =>
  () => {
    const { data, ...swr } = useSWR(
      contract ? "web3/useListedNfts" : null,
      async () => {
        const nfts = [] as Nft[];
        const coreNfts = await contract!.getAllTokensOnSale();
        for (let item of coreNfts) {
          const tokenURI = await contract!.tokenURI(item.tokenId);
          const metaRes = await fetch(tokenURI);
          const meta = await metaRes.json();
          nfts.push({
            price: parseFloat(ethers.utils.formatEther(item.price)),
            tokenId: item.tokenId.toNumber(),
            creator: item.creator,
            isListed: item.isListed,
            meta,
          });
        }
        return nfts;
      }
    );

    const _contract = contract;
    const buyNft = useCallback(
      async (tokenId: number, value: number) => {
        try {
          const result = await _contract!.buyToken(tokenId, {
            value: ethers.utils.parseEther(value.toString()),
          });
          await result?.wait();
          alert("Successfully bought NFT");
        } catch (e) {
          console.error(e);
        }
      },
      [_contract]
    );

    return {
      ...swr,
      buyNft,
      data: data ?? [],
    };
  };
