import {useCallback, useState} from "react";
import {
  getUserEmbeddedWallet,
  useEmbeddedWallet,
  usePrivy,
} from "@privy-io/expo";
import {useUSDCBalance} from "./useUSDCBalance";
import {ethers} from "ethers";
import {BASE_SEPOLIA_USDC_ADDRESS} from "../utils/constants";
import {Account} from "../utils/types";

export const usePayWithComment = () => {
  const {user} = usePrivy();
  const [isPending, setIsPending] = useState(false);
  const wallet = useEmbeddedWallet();
  const account = getUserEmbeddedWallet(user);
  const {balance} = useUSDCBalance();

  const payWithComment = useCallback(
    async ({
      recipient,
      amount,
      comment,
    }: {
      recipient: Account | null;
      amount: string;
      comment?: string;
    }) => {
      if (
        wallet.status !== "connected" ||
        !account?.address ||
        !parseFloat(balance) ||
        !recipient
      ) {
        console.log("Wallet not connected or balance is 0");
        return;
      }
      try {
        setIsPending(true);
        const provider = new ethers.providers.Web3Provider(wallet.provider);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          BASE_SEPOLIA_USDC_ADDRESS,
          ["function transfer(address to, uint256 value) public returns(bool)"],
          signer,
        );

        const amountToSend = ethers.utils.parseUnits(amount, 6);
        const transactionResponse = await contract.transfer(
          recipient.address,
          amountToSend,
        );
        await transactionResponse.wait(); // wait for transaction to be mined
        const payHash = transactionResponse.hash;

        // Prepare comment data
        const data = {
          payHash,
          avatar: recipient.avatar || null,
          username: recipient.username || null,
          comment: comment || null,
        };

        // Encode data
        const encodedData = ethers.utils.defaultAbiCoder.encode(
          ["string", "string", "string", "string"],
          [data.payHash, data.avatar, data.username, data.comment],
        );

        // Create a new transaction with no value
        const transaction = {
          to: recipient.address, // the address to send to
          value: ethers.utils.parseEther("0"), // the amount of ether to send
          data: encodedData, // optional data field
        };

        // Send the transaction
        const commentTransaction = await signer.sendTransaction(transaction);

        // Wait for the transaction to be mined
        await commentTransaction.wait();

        setIsPending(false);

        alert(`Sent $${amount} to ${recipient.address} successfully`);
      } catch (e) {
        setIsPending(false);
        console.error(e);
      }
    },
    [wallet, account?.address, balance],
  );
  return {payWithComment, isPending};
};
