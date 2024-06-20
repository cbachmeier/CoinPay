import {createPublicClient, http} from "viem";
import {mainnet} from "viem/chains";
import {PropsWithChildren, createContext, useContext} from "react";

const transport = http(
  `https://eth-mainnet.g.alchemy.com/v2/${process.env.EXPO_PUBLIC_ALCHEMY_KEY}`,
);

const publicClient = createPublicClient({
  chain: mainnet,
  transport,
});

const Context = createContext({
  publicClient,
});

const ViewPublicProvider = ({children}: PropsWithChildren) => {
  return <Context.Provider value={{publicClient}}>{children}</Context.Provider>;
};

export default ViewPublicProvider;

export const usePublicClient = () => {
  const {publicClient} = useContext(Context);

  return publicClient;
};
