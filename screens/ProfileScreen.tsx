import {View, Text, ScrollView, Image} from "react-native";
import {getUserEmbeddedWallet, usePrivy} from "@privy-io/expo";

import {Button} from "../components/Button";
import {useAtom} from "jotai";
import {useEffect, useState} from "react";
import {useAlchemy} from "../providers/AlchemyProvider";
import {AssetTransfersWithMetadataResult} from "alchemy-sdk";
import {styles} from "../utils/styles";
import {shortenAddress} from "../utils";
import {pageAtom} from "../utils/navigation";
import {Comment, TransactionWithComment} from "../utils/types";

import {StyleSheet} from "react-native";

export const ProfileScreen = () => {
  const {logout, user} = usePrivy();
  const [, setPage] = useAtom(pageAtom);
  const account = getUserEmbeddedWallet(user);
  const [transactions, setTransactions] = useState<TransactionWithComment[]>(
    [],
  );
  const alchemy = useAlchemy();

  useEffect(() => {
    const getLogs = async () => {
      const sentLogs = await alchemy.core.getAssetTransfers({
        fromAddress: account?.address,
        contractAddresses: ["0x036cbd53842c5426634e7929541ec2318f3dcf7e"],
        category: ["erc20"],
        withMetadata: true,
      });
      // retrieve comments and map to send txs
      const comments = await fetch(
        `${process.env.EXPO_PUBLIC_COMMENT_ENDPOINT}/${account?.address}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
        .then((response) => response.json())
        .then((data) => {
          console.log("Successfully retrieved comments:", data);
          return data?.comments;
        })
        .catch((error) => {
          console.error("Error retrieving comments:", error);
        });
      const sentLogsWithComments = sentLogs.transfers.map((tx) => {
        const comment = comments?.find((c) => c.hash === tx.hash);
        return {
          ...tx,
          comment,
        };
      });
      const receivedLogs = await alchemy.core.getAssetTransfers({
        toAddress: account?.address,
        contractAddresses: ["0x036cbd53842c5426634e7929541ec2318f3dcf7e"],
        category: ["erc20"],
        withMetadata: true,
      });
      const combinedLogs = [...sentLogsWithComments, ...receivedLogs.transfers];
      combinedLogs.sort(
        (a, b) =>
          new Date(b.metadata.blockTimestamp).getTime() -
          new Date(a.metadata.blockTimestamp).getTime(),
      );
      setTransactions(combinedLogs);
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
                  <Image
                    source={{uri: transaction.comment?.avatar || undefined}}
                    style={
                      transaction.comment?.avatar
                        ? styles.avatar
                        : styles.avatarPlaceholder
                    }
                  />
                  <Text style={styles.address}>
                    {shortenAddress(
                      isSend
                        ? transaction.comment?.username ?? transaction.to
                        : transaction.from,
                    )}
                  </Text>
                  <Text style={isSend ? styles.valueSend : styles.valueReceive}>
                    {(isSend ? "-" : "+") +
                      ` $${transaction.value?.toFixed(2)}`}
                  </Text>
                </View>
                <View style={styles.transactionRow}>
                  <Text style={styles.description}>
                    {transaction.comment?.comment}
                  </Text>
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
