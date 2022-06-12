import {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  createDefaultState,
  createWeb3State,
  loadContract,
  Web3State,
} from "./utils";
import { ethers } from "ethers";
import { MetaMaskInpageProvider } from "@metamask/providers";

const pageReload = () => window.location.reload();

const handleLockedAccount = (ethereum: MetaMaskInpageProvider) => async () => {
  const isLoked = !(await ethereum._metamask.isUnlocked());
  if (isLoked) pageReload();
};

const setGlobalListeners = (ethereum: MetaMaskInpageProvider) => {
  ethereum.on("chainChanged", pageReload);
  ethereum.on("accountsChanged", handleLockedAccount(ethereum));
};

const removeGlobalListeners = (ethereum: MetaMaskInpageProvider) => {
  ethereum?.removeListener("chainChanged", pageReload);
  ethereum?.removeListener("accountsChanged", handleLockedAccount);
};

const Web3Context = createContext<Web3State>(createDefaultState());

const Web3Provider: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const [web3Api, setWeb3Api] = useState<Web3State>(createDefaultState());

  useEffect(() => {
    async function initWeb3() {
      try {
        const provider = new ethers.providers.Web3Provider(
          window.ethereum as any
        );
        const contract = await loadContract("NftMarket", provider);
        setGlobalListeners(window.ethereum);
        setWeb3Api(
          createWeb3State({
            provider,
            contract,
            ethereum: window.ethereum,
            isLoading: false,
          })
        );
      } catch (error: any) {
        console.error("Install wallet");
        setWeb3Api((api) =>
          createWeb3State({ ...(api as any), isLoading: false })
        );
      }
    }
    initWeb3();

    return () => removeGlobalListeners(window.ethereum);
  }, []);

  return (
    <Web3Context.Provider value={web3Api}>{children}</Web3Context.Provider>
  );
};

export function useWeb3() {
  const web3Api = useContext(Web3Context);
  return web3Api;
}

export function useHooks() {
  const { hooks } = useWeb3();
  return hooks;
}

export default Web3Provider;
