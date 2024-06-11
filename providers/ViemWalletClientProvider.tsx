import {isConnected, useEmbeddedWallet} from "@privy-io/expo";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {Account, WalletClient, createWalletClient, custom} from "viem";
import {sepolia} from "viem/chains";

export type WalletClientType = WalletClient<
  ReturnType<typeof custom>,
  typeof sepolia
> & {account: Account};

const Context = createContext<{client: null | WalletClientType}>({
  client: null,
});

const ViewWalletClientProvider = ({children}: PropsWithChildren) => {
  const w = useEmbeddedWallet();

  const [client, setClient] = useState<null | WalletClientType>(null);

  useEffect(() => {
    const create = async () => {
      if (!isConnected(w)) {
        return null;
      }

      const [account] = await w.provider.request({
        method: "eth_requestAccounts",
      });

      return createWalletClient({
        account,
        transport: custom(w.provider),
        chain: sepolia,
      });
    };

    create().then(setClient);
  }, [w]);

  return <Context.Provider value={{client}}>{children}</Context.Provider>;
};

export default ViewWalletClientProvider;

export const useWalletClient = () => {
  const {client} = useContext(Context);

  return client;
};
