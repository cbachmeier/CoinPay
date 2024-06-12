import {View, Text, ScrollView} from "react-native";
import {getUserEmbeddedWallet, usePrivy} from "@privy-io/expo";

import {Button} from "../components/Button";
import {useAtom} from "jotai";
import {pageAtom} from "./Wrapper";
import {useEffect, useState} from "react";
import {useAlchemy} from "../providers/AlchemyProvider";
import {AssetTransfersWithMetadataResult} from "alchemy-sdk";
import {styles} from "../utils/styles";
import {shortenAddress} from "../utils";

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
      const sentLogs = await alchemy.core.getAssetTransfers({
        fromAddress: account?.address,
        contractAddresses: ["0x036cbd53842c5426634e7929541ec2318f3dcf7e"],
        category: ["erc20"],
        withMetadata: true,
      });
      const receivedLogs = await alchemy.core.getAssetTransfers({
        toAddress: account?.address,
        contractAddresses: ["0x036cbd53842c5426634e7929541ec2318f3dcf7e"],
        category: ["erc20"],
        withMetadata: true,
      });
      const combinedLogs = [...sentLogs.transfers, ...receivedLogs.transfers];
      combinedLogs.sort(
        (a, b) =>
          new Date(b.metadata.blockTimestamp).getTime() -
          new Date(a.metadata.blockTimestamp).getTime(),
      );
      setTransactions(combinedLogs);
      console.log(combinedLogs);
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
      <View style={styles.topHalf}></View>
      <View style={styles.bottomHalf}>
        <ScrollView>
          {transactions.map((transaction, index) => {
            const isSend = transaction.from === account?.address.toLowerCase();
            return (
              <View key={index} style={styles.transaction}>
                <View style={styles.transactionRow}>
                  <Text style={styles.address}>
                    {shortenAddress(isSend ? transaction.to : transaction.from)}
                  </Text>
                  <Text style={isSend ? styles.valueSend : styles.valueReceive}>
                    {(isSend ? "-" : "+") +
                      ` $${transaction.value?.toFixed(2)}`}
                  </Text>
                </View>
                <View style={styles.transactionRow}>
                  <Text style={styles.description}>For something...</Text>
                </View>
                {index !== transactions.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};
