import {View, Text, ScrollView} from "react-native";
import {getUserEmbeddedWallet, usePrivy} from "@privy-io/expo";

import {Button} from "../components/Button";
import {styles} from "../utils/styles";
import {useAtom} from "jotai";
import {pageAtom} from "./Wrapper";
import {useEffect, useState} from "react";
import {useAlchemy} from "../providers/AlchemyProvider";
import {AssetTransfersWithMetadataResult} from "alchemy-sdk";

export const ProfileScreen = () => {
  const {logout, user} = usePrivy();
  const [, setPage] = useAtom(pageAtom);
  const account = getUserEmbeddedWallet(user);
  const [transactions, setTransactions] = useState<
    AssetTransfersWithMetadataResult[]
  >([]);
  const alchemy = useAlchemy();

  useEffect(() => {
    const getLogs = async () => {
      const logs = await alchemy.core.getAssetTransfers({
        fromAddress: account?.address,
        contractAddresses: ["0x036cbd53842c5426634e7929541ec2318f3dcf7e"],
        category: ["erc20"],
      });
      setTransactions(logs.transfers.reverse());
    };

    getLogs();
  }, [account, alchemy.core]);

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Button onPress={() => setPage("home")}>Back</Button>
      <Button onPress={logout}>Logout</Button>
      <Text>{account?.address}</Text>
      <ScrollView>
        {transactions.map((transaction, index) => (
          <Text key={index}>
            Transaction {index + 1}: {transaction.hash}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};
