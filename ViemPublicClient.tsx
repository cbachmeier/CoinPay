import {PublicClient, createPublicClient, http} from "viem";
import {mainnet} from "viem/chains";
import {PropsWithChildren, createContext, useContext} from "react";

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const Context = createContext<{publicClient: null | PublicClient}>({
  publicClient: null,
});

const ViewPublicProvider = ({children}: PropsWithChildren) => {
  return (
    <Context.Provider value={{publicClient: publicClient as PublicClient}}>
      {children}
    </Context.Provider>
  );
};

export default ViewPublicProvider;

export const usePublicClient = () => {
  const {publicClient} = useContext(Context);

  return publicClient;
};
