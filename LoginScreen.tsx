import Constants from "expo-constants";
import {StatusBar} from "expo-status-bar";
import React, {useEffect, useState} from "react";
import {Text, TextInput, View} from "react-native";

import {usePrivy, useLoginWithEmail, useOAuthFlow, useLoginWithSMS} from "@privy-io/expo";

import {Button} from "./Button";
import {styles} from "./styles";

export const LoginScreen = () => {
  const [phoneNum, setPhoneNum] = useState("");
  const [code, setCode] = useState("");

  const {user} = usePrivy();
  const emailFlow = useLoginWithEmail();
  const smsFlow = useLoginWithSMS()
  const oauth = useOAuthFlow();

  // Side effects which react to login state changes
  useEffect(() => {
    // Report error
    if (smsFlow.state.status === "error") {
      console.error(smsFlow.state.error);
    } else if (oauth.state.status === "error") {
      console.error(oauth.state.error);
    }
  }, [emailFlow.state.status, oauth.state.status]);

  if (user) {
    return (
      <View style={styles.container}>
        <Text>Looks like you are already logged in</Text>;
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Login</Text>
      <Text style={{color: "rgba(0,0,0,0.4)", marginVertical: 10}}>
        (OTP state:{" "}
        <Text style={{color: "blue"}}>{smsFlow.state.status}</Text>)
      </Text>
      <StatusBar style="auto" />
      {smsFlow.state.status !== "awaiting-code-input" ? <><TextInput
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
        Send Code
      </Button></> : <><TextInput
        value={code}
        onChangeText={setCode}
        placeholder="Code"
        style={styles.input}
        inputMode="numeric"
      />
      <Button
        // loading={smsFlow.state.status === "submitting-code"}
        disabled={smsFlow.state.status !== "awaiting-code-input"}
        onPress={() => smsFlow.loginWithCode({code})}
      >
        Login
      </Button></>}
      

      
    </View>
  );
};
