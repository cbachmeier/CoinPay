import {Network, Alchemy} from "alchemy-sdk";
import {PropsWithChildren, createContext, useContext} from "react";

const settings = {
  apiKey: process.env.EXPO_PUBLIC_ALCHEMY_KEY,
  network: Network.BASE_SEPOLIA,
};

const alchemy = new Alchemy(settings);

const AlchemyContext = createContext(alchemy);

const AlchemyProvider = ({children}: PropsWithChildren) => {
  return (
    <AlchemyContext.Provider value={alchemy}>
      {children}
    </AlchemyContext.Provider>
  );
};

export default AlchemyProvider;

export const useAlchemy = () => useContext(AlchemyContext);
