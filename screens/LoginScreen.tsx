import {StatusBar} from "expo-status-bar";
import React, {useEffect, useState} from "react";
import {Text, TextInput, View} from "react-native";

import {usePrivy, useLoginWithSMS} from "@privy-io/expo";

import {Button} from "../components/Button";
import {styles} from "../utils/styles";

export const LoginScreen = () => {
  const [phoneNum, setPhoneNum] = useState("");
  const [code, setCode] = useState("");

  const {user} = usePrivy();
  const smsFlow = useLoginWithSMS();

  // Side effects which react to login state changes
  useEffect(() => {
    // Report error
    if (smsFlow.state.status === "error") {
      console.error(smsFlow.state.error);
    }
  }, [smsFlow.state]);

  if (user) {
    return (
      <View style={styles.container}>
        <Text>Looks like you are already logged in</Text>;
      </View>
    );
  }

  const showCodeScreen =
    smsFlow.state.status === "awaiting-code-input" ||
    smsFlow.state.status === "submitting-code";

  return (
    <View style={styles.container}>
      <Text>Login</Text>
      <Text style={{color: "rgba(0,0,0,0.4)", marginVertical: 10}}>
        (OTP state: <Text style={{color: "blue"}}>{smsFlow.state.status}</Text>)
      </Text>
      <StatusBar style="auto" />
      {!showCodeScreen ? (
        <>
          <TextInput
            value={phoneNum}
            onChangeText={setPhoneNum}
            placeholder="Phone number"
            style={styles.input}
            inputMode="tel"
          />
          <Button
            loading={smsFlow.state.status === "sending-code"}
            onPress={() => smsFlow.sendCode({phone: phoneNum})}
          >
            Sign in
          </Button>
        </>
      ) : (
        <>
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="Code"
            style={styles.input}
            inputMode="numeric"
          />
          <Button
            loading={smsFlow.state.status === "submitting-code"}
            disabled={smsFlow.state.status !== "awaiting-code-input"}
            onPress={() => smsFlow.loginWithCode({code})}
          >
            Continue
          </Button>
        </>
      )}
    </View>
  );
};
