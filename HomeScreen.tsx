import React, {useState} from "react";
import {Text, View, StyleSheet, TouchableOpacity} from "react-native";
import {usePrivy} from "@privy-io/expo";

import {Button} from "./Button";
import {styles} from "./styles";

export const HomeScreen = () => {
  const {logout, user} = usePrivy();
  const [input, setInput] = useState("");

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
    >
      <Text style={styles.keypadButtonText}>{val}</Text>
    </TouchableOpacity>
  );

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Button onPress={logout}>Logout</Button>

      <View style={styles.inputContainer}>
        <Text style={styles.inputText}>${input}</Text>
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
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.keypadButtonText}>Request</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.keypadButtonText}>Pay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
