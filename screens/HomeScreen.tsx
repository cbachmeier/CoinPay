import React, {useCallback, useState} from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import {usePrivy} from "@privy-io/expo";

import {Button} from "../components/Button";
import {styles} from "../utils/styles";
import {isAddress} from "viem";
import {useAtom} from "jotai";
import {pageAtom} from "./Wrapper";
import {useUSDCBalance} from "../hooks/useUSDCBalance";
import {usePayWithComment} from "../hooks/usePayWithComment";
import {Account} from "../utils/types";
import {useENS} from "../hooks/useENS";

export const HomeScreen = () => {
  const {user} = usePrivy();
  const [amount, setAmount] = useState("0");
  const [search, setSearch] = useState("");
  const [recipient, setRecipient] = useState<Account | null>(null);
  const [isValidRecipient, setIsValidRecipient] = useState<boolean>(false);
  const [, setPage] = useAtom(pageAtom);
  const {balance} = useUSDCBalance();
  const {payWithComment, isPending} = usePayWithComment();
  const {getAccountForAddress, getAccountForUsername} = useENS();

  const handlePress = (val: string) => {
    setAmount((prevInput) => {
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
    setAmount((prevInput) =>
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

  const handleRecipientChange = useCallback(
    async (text: string) => {
      setSearch(text);
      if (text) {
        if (isAddress(text)) {
          const account = await getAccountForAddress(text);
          if (account) {
            setRecipient(account);
            setIsValidRecipient(true);
          }
        } else {
          try {
            const account = await getAccountForUsername(text);
            if (account) {
              setRecipient(account);
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
    [getAccountForAddress, getAccountForUsername],
  );

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Button onPress={() => setPage("profile")}>Profile</Button>
      <TextInput
        style={[
          styles.recipientInput,
          isValidRecipient ? {borderColor: "green"} : {borderColor: "red"},
        ]}
        onChangeText={handleRecipientChange}
        value={search}
        placeholder="Enter recipient"
      />

      <View style={styles.inputContainer}>
        <Text style={styles.inputText}>${amount}</Text>
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
          onPress={() =>
            payWithComment({
              recipient,
              amount,
              comment: "the quick brown fox jumps over the lazy dog 🐶",
            })
          }
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
