import {Text, ActivityIndicator, View} from "react-native";
import {atom, useAtom} from "jotai";
import {usePrivy} from "@privy-io/expo";

import {HomeScreen} from "./HomeScreen";
import {LoginScreen} from "./LoginScreen";
import {ProfileScreen} from "./ProfileScreen";

export const pageAtom = atom<"home" | "profile">("home");

export const Wrapper = () => {
  const {user, isReady} = usePrivy();
  const [page] = useAtom(pageAtom);

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" />
        <Text style={{color: "rgba(0,0,0,0.3)", marginTop: 10}}>Preparing</Text>
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (page === "profile") {
    return <ProfileScreen />;
  }

  return <HomeScreen />;
};
