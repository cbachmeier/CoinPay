import "fast-text-encoding";
import "react-native-get-random-values";
import "@ethersproject/shims";
import React from "react";
import {SafeAreaView, View, Text} from "react-native";
import {PrivyProvider} from "@privy-io/expo";
import {base, baseSepolia} from "viem/chains";

import {Wrapper} from "./screens/Wrapper";
import ViewWalletClientProvider from "./providers/ViemWalletClientProvider";
import ViewPublicProvider from "./providers/ViemPublicClient";
import AlchemyProvider from "./providers/AlchemyProvider";

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
      <ViewWalletClientProvider>
        <ViewPublicProvider>
          <AlchemyProvider>
            <SafeAreaView style={{flex: 1, margin: 10}}>
              <Wrapper />
            </SafeAreaView>
          </AlchemyProvider>
        </ViewPublicProvider>
      </ViewWalletClientProvider>
    </PrivyProvider>
  );
}
