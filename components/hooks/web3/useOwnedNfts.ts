import { HookFactory } from "@_types/hooks";
import { Nft } from "@_types/nft";
import { ethers } from "ethers";
import { useCallback } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";

type UseOwnedNftsResponse = {
  listNft: (tokenId: number, price: number) => Promise<void>;
};

type OwnedNftsHookFactory = HookFactory<Nft[], UseOwnedNftsResponse>;

export type UseOwnedNftsHook = ReturnType<OwnedNftsHookFactory>;

export const hookFactory: OwnedNftsHookFactory =
  ({ contract }) =>
  () => {
    const { data, isValidating, ...swr } = useSWR(
      contract ? "web3/useOwnedNfts" : null,
      async () => {
        const nfts = [] as Nft[];
        const coreNfts = await contract!.getOwnedTokens();
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
    const listNft = useCallback(
      async (tokenId: number, price: number) => {
        try {
          const listingPrice = await _contract!.listingPrice();
          const result = await _contract!.listToken(
            tokenId,
            ethers.utils.parseEther(price.toString()),
            {
              value: listingPrice,
            }
          );
          await toast.promise(result!.wait(), {
            pending: "Listing NFT...",
            success: "NFT listed!",
            error: "NFT list failed!",
          });
        } catch (e) {
          console.error(e);
        }
      },
      [_contract]
    );

    return {
      ...swr,
      listNft,
      data: data ?? [],
      isValidating,
    };
  };
