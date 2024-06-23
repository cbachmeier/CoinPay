import {Text, View, TouchableOpacity} from "react-native";
import {useEmbeddedWallet, usePrivy} from "@privy-io/expo";
import {Button} from "../components/Button";
import {styles} from "../utils/styles";
import {useAtom} from "jotai";
import {useUSDCBalance} from "../hooks/useUSDCBalance";
import {pageAtom, txAmountAtom, txTypeAtom} from "../utils/atoms";
import {useEffect} from "react";

export const HomeScreen = () => {
  const {user} = usePrivy();
  const [amount, setAmount] = useAtom(txAmountAtom);
  const [, setPage] = useAtom(pageAtom);
  const [, setType] = useAtom(txTypeAtom);
  const {balance} = useUSDCBalance();
  const wallet = useEmbeddedWallet();

  useEffect(() => {
    if (wallet.status === "not-created") {
      wallet.create();
    }
  }, [wallet]);

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

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Button onPress={() => setPage("profile")}>Profile</Button>

      <View style={styles.inputContainer}>
        <Text style={styles.inputText}>${amount}</Text>
      </View>
      <View style={styles.balanceContainer}>
        <Text style={styles.labelText}>Balance:</Text>
        <Text style={styles.balanceText}>
          ${parseFloat(balance).toFixed(2)}
        </Text>
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
          disabled={!!!parseFloat(amount)}
          style={styles.actionButton}
          onPress={() => {
            setType("request");
            setPage("search");
          }}
        >
          <Text style={styles.keypadButtonText}>Request</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={!!!parseFloat(amount)}
          style={styles.actionButton}
          onPress={() => {
            setType("pay");
            setPage("search");
          }}
        >
          <Text style={styles.keypadButtonText}>Pay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
