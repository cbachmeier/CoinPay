import {View, Text, ScrollView, Image} from "react-native";
import {getUserEmbeddedWallet, usePrivy} from "@privy-io/expo";
import {Button} from "../components/Button";
import {useAtom} from "jotai";
import {useCallback, useEffect, useState} from "react";
import {useAlchemy} from "../providers/AlchemyProvider";
import {styles} from "../utils/styles";
import {shortenAddress} from "../utils";
import {pageAtom} from "../utils/atoms";
import {Request, TransactionWithComment} from "../utils/types";

export const ProfileScreen = () => {
  const {logout, user} = usePrivy();
  const [, setPage] = useAtom(pageAtom);
  const account = getUserEmbeddedWallet(user);
  const [transactions, setTransactions] = useState<
    (TransactionWithComment | Request)[]
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

      const requestsSent = await fetch(
        `${process.env.EXPO_PUBLIC_REQUESTS_SENT_ENDPOINT}/${account?.address}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
        .then((response) => response.json())
        .then((data) => {
          console.log(
            `Successfully retrieved requests from ${account?.address}`,
            data,
          );
          return data?.requests;
        })
        .catch((error) => {
          console.error("Error retrieving comments:", error);
        });

      const requestsReceived = await fetch(
        `${process.env.EXPO_PUBLIC_REQUESTS_SENT_ENDPOINT}/${account?.address}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
        .then((response) => response.json())
        .then((data) => {
          console.log(
            `Successfully retrieved requests from ${account?.address}`,
            data,
          );
          return data?.requests;
        })
        .catch((error) => {
          console.error("Error retrieving comments:", error);
        });
      const combinedLogs = [
        ...sentLogsWithComments,
        ...receivedLogs.transfers,
        ...(requestsSent as Request[]),
        ...(requestsReceived as Request[]),
      ];
      combinedLogs.sort((a, b) => {
        const aTimestamp =
          (a as TransactionWithComment)?.metadata?.blockTimestamp ??
          (a as Request).timestamp;
        const bTimestamp =
          (b as TransactionWithComment)?.metadata?.blockTimestamp ??
          (b as Request).timestamp;

        return new Date(bTimestamp).getTime() - new Date(aTimestamp).getTime();
      });
      setTransactions(combinedLogs);
    };

    getLogs();
  }, [account, alchemy.core]);

  const handleLogout = useCallback(() => {
    setPage("home");
    logout();
  }, [logout, setPage]);

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Button onPress={() => setPage("home")}>Back</Button>
      <Button onPress={handleLogout}>Logout</Button>
      <Text>{account?.address}</Text>
      <View style={styles.topHalf}></View>
      <View style={styles.bottomHalf}>
        <ScrollView>
          {transactions.map((transaction, index) => {
            const isRequest = "status" in transaction;
            if (isRequest) {
              return (
                <View key={index} style={styles.transaction}>
                  <View style={styles.transactionRow}>
                    <Image
                      source={{uri: transaction.avatar || undefined}}
                      style={
                        transaction.avatar
                          ? styles.avatar
                          : styles.avatarPlaceholder
                      }
                    />
                    <Text style={styles.address}>
                      {shortenAddress(
                        transaction.username ?? transaction.origin,
                      )}
                    </Text>
                    <Text style={styles.valueReceive}>
                      {`Request: $${transaction.amount}`}
                    </Text>
                  </View>
                  <View style={styles.transactionRow}>
                    <Text style={styles.description}>
                      {transaction.comment}
                    </Text>
                  </View>
                  {index !== transactions.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              );
            }
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
