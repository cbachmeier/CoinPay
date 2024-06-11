import React, {useCallback, useEffect, useState} from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import {
  getUserEmbeddedWallet,
  useEmbeddedWallet,
  usePrivy,
} from "@privy-io/expo";
import {ethers} from "ethers";

import {Button} from "../components/Button";
import {styles} from "../utils/styles";
import {BASE_SEPOLIA_USDC_ADDRESS} from "../utils/constants";
import {usePublicClient} from "../providers/ViemPublicClient";
import {isAddress} from "viem";
import {normalize} from "viem/ens";
import {useAtom} from "jotai";
import {pageAtom} from "./Wrapper";

export const HomeScreen = () => {
  const {user} = usePrivy();
  const [input, setInput] = useState("0");
  const [balance, setBalance] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [recipient, setRecipient] = useState(
    "0x79ea449C3375ED1A9d7D99F8068209eA748C6D42",
  );
  const [recipientAddress, setRecipientAddress] = useState<
    `0x${string}` | null
  >(null);
  const wallet = useEmbeddedWallet();
  const account = getUserEmbeddedWallet(user);
  const publicClient = usePublicClient();
  const [isValidRecipient, setIsValidRecipient] = useState<boolean>(false);
  const [, setPage] = useAtom(pageAtom);

  const handlePress = (val: string) => {
    setInput((prevInput) => {
      // Prevent adding more than one decimal point
      if (val === "." && prevInput.includes(".")) {
        return prevInput;
      }
      // Prevent more than 2 digits after decimal point
      if (
        val !== "." &&
        prevInput.includes(".") &&
        prevInput.split(".")[1].length >= 2
      ) {
        return prevInput;
      }
      return prevInput === "0" && val !== "." ? val : prevInput + val;
    });
  };

  const handleBackspace = () => {
    setInput((prevInput) =>
      prevInput.length > 1 ? prevInput.slice(0, -1) : "0",
    );
  };

  const renderButton = (val: string) => (
    <TouchableOpacity
      style={styles.keypadButton}
      onPress={() => handlePress(val)}
      key={val}
    >
      <Text style={styles.keypadButtonText}>{val}</Text>
    </TouchableOpacity>
  );

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

      setBalance(parseFloat(formattedBalance).toFixed(2));
    } catch (e) {
      console.error(e);
    }
  }, [account?.address, wallet]);

  useEffect(() => {
    getERC20Balance();
  }, [getERC20Balance]);

  const payUSDC = useCallback(async () => {
    if (
      wallet.status !== "connected" ||
      !account?.address ||
      !parseFloat(balance)
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

      const amountToSend = ethers.utils.parseUnits(input, 6);
      const transactionResponse = await contract.transfer(
        recipientAddress,
        amountToSend,
      );
      await transactionResponse.wait(); // wait for transaction to be mined
      setIsPending(false);
      setInput("0");

      alert(`Sent $${input} to ${recipientAddress} successfully`);
    } catch (e) {
      setIsPending(false);
      console.error(e);
    }
  }, [account?.address, balance, input, recipientAddress, wallet]);

  const handleRecipientChange = useCallback(
    async (text: string) => {
      setRecipient(text);
      if (text) {
        if (isAddress(text)) {
          setRecipientAddress(text);
          setIsValidRecipient(true);
        } else {
          try {
            const ensAddress = await publicClient?.getEnsAddress({
              name: normalize(text),
            });
            if (ensAddress) {
              setRecipientAddress(ensAddress);
              setIsValidRecipient(true);
            } else {
              setIsValidRecipient(false);
            }
          } catch (e) {
            console.error(e);
            setIsValidRecipient(false);
          }
        }
      }
    },
    [publicClient],
  );

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Button onPress={() => setPage("profile")}>Profile</Button>
      <TextInput
        style={styles.recipientInput}
        onChangeText={handleRecipientChange}
        value={recipient}
        placeholder="Enter recipient address"
      />

      <View style={styles.inputContainer}>
        <Text style={styles.inputText}>${input}</Text>
      </View>
      <View style={styles.balanceContainer}>
        <Text style={styles.labelText}>Balance:</Text>
        <Text style={styles.balanceText}>${balance}</Text>
      </View>
      <View style={styles.keypadContainer}>
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map(
          renderButton,
        )}
        <TouchableOpacity style={styles.keypadButton} onPress={handleBackspace}>
          <Text style={styles.keypadButtonText}>&lt;</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.actionButtonContainer}>
        <TouchableOpacity
          disabled={!isValidRecipient}
          style={styles.actionButton}
        >
          <Text style={styles.keypadButtonText}>Request</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={!isValidRecipient}
          style={styles.actionButton}
          onPress={payUSDC}
        >
          {isPending ? (
            <ActivityIndicator size="small" color="rgba(0,0,0,0.3)" />
          ) : (
            <Text style={styles.keypadButtonText}>Pay</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
