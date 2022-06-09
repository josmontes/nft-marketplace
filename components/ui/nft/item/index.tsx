/* eslint-disable @next/next/no-img-element */
import { Fragment, FunctionComponent } from "react";
import { NftMeta } from "@types/nft";

type NftItemProps = {
  nft: NftMeta;
};

const NftItem: FunctionComponent<NftItemProps> = ({ nft }) => {
  return (
    <div className="flex flex-col rounded-lg shadow-lg overflow-hidden">
      <div className="flex-shrink-0">
        <img
          className={`h-full w-full object-cover`}
          src={nft.image}
          alt={nft.name}
        />
      </div>
      <div className="flex-1 bg-white p-6 flex flex-col justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-indigo-600">Creatures NFT</p>
          <div className="block mt-2">
            <p className="text-xl font-semibold text-gray-900">{nft.name}</p>
            <p className="mt-3 mb-3 text-base text-gray-500">
              {nft.description}
            </p>
          </div>
        </div>
        <div className="overflow-hidden mb-4">
          <dl className="-mx-4 -mt-4 flex flex-wrap">
            <div className="flex flex-col px-4 pt-4">
              <dt className="order-2 text-sm font-medium text-gray-500">
                Price
              </dt>
              <dd className="order-1 text-xl font-extrabold text-indigo-600">
                <div className="flex justify-center items-center">
                  <img className="h-6" src="/images/small-eth.webp" alt="Eth" />
                  100 ETH
                </div>
              </dd>
            </div>
            {nft.attributes.map((att, i) => (
              <div key={i} className="flex flex-col px-4 pt-4">
                <dt className="order-2 text-sm font-medium text-gray-500">
                  {att.trait_type}
                </dt>
                <dd className="order-1 text-xl font-extrabold text-indigo-600">
                  {att.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <button
            type="button"
            className="disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none disabled:cursor-not-allowed mr-2 inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Buy
          </button>
          <button
            type="button"
            className="disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none disabled:cursor-not-allowed inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default NftItem;