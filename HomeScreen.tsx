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
      style={localStyles.button}
      onPress={() => handlePress(val)}
    >
      <Text style={localStyles.buttonText}>{val}</Text>
    </TouchableOpacity>
  );

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Button onPress={logout}>Logout</Button>

      <View style={localStyles.inputContainer}>
        <Text style={localStyles.inputText}>${input}</Text>
      </View>
      <View style={localStyles.buttonContainer}>
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map(
          renderButton,
        )}
        <TouchableOpacity style={localStyles.button} onPress={handleBackspace}>
          <Text style={localStyles.buttonText}>&lt;</Text>
        </TouchableOpacity>
      </View>
      <View style={localStyles.actionButtonContainer}>
        <TouchableOpacity style={localStyles.actionButton}>
          <Text style={localStyles.buttonText}>Request</Text>
        </TouchableOpacity>
        <TouchableOpacity style={localStyles.actionButton}>
          <Text style={localStyles.buttonText}>Pay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  inputContainer: {
    flex: 1,
    justifyContent: "center",
    alignSelf: "stretch",
    paddingHorizontal: 20,
  },
  inputText: {
    fontSize: 48,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "80%",
  },
  button: {
    width: "30%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 24,
  },
  actionButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 20,
  },
  actionButton: {
    width: "45%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#007BFF",
  },
});
