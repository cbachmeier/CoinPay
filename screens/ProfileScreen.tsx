import {View} from "react-native";
import {usePrivy} from "@privy-io/expo";

import {Button} from "../components/Button";
import {styles} from "../utils/styles";
import {useAtom} from "jotai";
import {pageAtom} from "./Wrapper";

export const ProfileScreen = () => {
  const {logout, user} = usePrivy();
  const [, setPage] = useAtom(pageAtom);

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Button onPress={() => setPage("home")}>Back</Button>
      <Button onPress={logout}>Logout</Button>
    </View>
  );
};
