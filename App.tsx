import "fast-text-encoding";
import "react-native-get-random-values";
import "@ethersproject/shims";
import React from "react";
import {SafeAreaView, View, Text} from "react-native";
import {PrivyProvider} from "@privy-io/expo";
import {base, baseSepolia} from "viem/chains";

import {Wrapper} from "./Wrapper";

export default function App() {
  if (!process.env.EXPO_PUBLIC_PRIVY_APP_ID) {
    return (
      <SafeAreaView>
        <View
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text>Set your app id in app.json</Text>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <PrivyProvider
      appId={process.env.EXPO_PUBLIC_PRIVY_APP_ID}
      supportedChains={[baseSepolia, base]}
    >
      <SafeAreaView style={{flex: 1, margin: 10}}>
        <Wrapper />
      </SafeAreaView>
    </PrivyProvider>
  );
}
