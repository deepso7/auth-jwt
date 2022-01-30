import { ethers } from "ethers";
import Web3Modal, { IProviderOptions } from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useCallback, useEffect, useMemo, useState } from "react";

const useWeb3Modal = () => {
  const [provider, setProvider] = useState<
    ethers.providers.Web3Provider | undefined
  >();

  const [autoLoaded, setAutoLoaded] = useState(false);

  const providerOptions: IProviderOptions = {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: "01dd88135c524e4bb0b2428ee529a014", // required
      },
    },
  };

  const web3Modal = useMemo(
    () =>
      new Web3Modal({
        network: "mainnet", // optional
        cacheProvider: true, // optional
        providerOptions, // required
        theme: "dark",
      }),
    []
  );

  // Open wallet selection modal.
  const loadWeb3Modal = useCallback(async () => {
    const newProvider = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(newProvider);

    console.log({ provider, newProvider });

    setProvider(provider);
  }, [web3Modal]);

  const logoutOfWeb3Modal = useCallback(() => {
    web3Modal.clearCachedProvider();
    window.location.reload();
  }, [web3Modal]);

  // If autoLoad is enabled and the the wallet had been loaded before, load it automatically now.
  useEffect(() => {
    if (!autoLoaded && web3Modal.cachedProvider) {
      loadWeb3Modal();
      setAutoLoaded(true);
    }
  }, [autoLoaded, loadWeb3Modal, setAutoLoaded, web3Modal.cachedProvider]);

  return { provider, loadWeb3Modal, logoutOfWeb3Modal };
};

export default useWeb3Modal;
