import {
  usePrivy,
  useEmbeddedWallet,
  getUserEmbeddedWallet,
} from "@privy-io/expo";
import {useCallback, useEffect, useState} from "react";
import {BASE_SEPOLIA_USDC_ADDRESS} from "../utils/constants";
import {ethers} from "ethers";

export const useUSDCBalance = () => {
  const {user} = usePrivy();
  const wallet = useEmbeddedWallet();
  const account = getUserEmbeddedWallet(user);
  const [balance, setBalance] = useState("");
  const getERC20Balance = useCallback(async () => {
    if (wallet.status !== "connected" || !account?.address) {
      return;
    }
    try {
      const provider = new ethers.providers.Web3Provider(wallet.provider);
      const contractAddress = BASE_SEPOLIA_USDC_ADDRESS;
      const contract = new ethers.Contract(
        contractAddress,
        ["function balanceOf(address account) public view returns (uint256)"],
        provider,
      );

      const balance = await contract.balanceOf(account.address);
      const formattedBalance = ethers.utils.formatUnits(balance, 6);

      setBalance(formattedBalance);
    } catch (e) {
      console.error(e);
    }
  }, [account?.address, wallet]);

  useEffect(() => {
    getERC20Balance();
  }, [getERC20Balance]);

  return {balance};
};
