import {View, Text, ScrollView, Image, ActivityIndicator} from "react-native";
import {getUserEmbeddedWallet, usePrivy} from "@privy-io/expo";
import {Button} from "../components/Button";
import {useAtom} from "jotai";
import {useCallback, useEffect, useState} from "react";
import {useAlchemy} from "../providers/AlchemyProvider";
import {styles} from "../utils/styles";
import {shortenAddress} from "../utils";
import {pageAtom} from "../utils/atoms";
import {Request, TransactionWithComment} from "../utils/types";
import {useSendRequest} from "../hooks/useSendRequest";
import {usePayWithComment} from "../hooks/usePayWithComment";
import {isAddress} from "viem";

function isRequest(
  transaction: TransactionWithComment | Request,
): transaction is Request {
  return "status" in transaction;
}

export const ProfileScreen = () => {
  const {logout, user} = usePrivy();
  const [, setPage] = useAtom(pageAtom);
  const account = getUserEmbeddedWallet(user);
  const [transactions, setTransactions] = useState<
    (TransactionWithComment | Request)[]
  >([]);
  const alchemy = useAlchemy();
  const {payRequest, denyRequest, status: reqUpdateStatus} = useSendRequest();
  const {payWithComment, status: payStatus} = usePayWithComment();
  const [buttonPressed, setButtonPressed] = useState<
    | {
        req: string;
        action: "pay" | "decline";
      }
    | undefined
  >(undefined);

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
          return data?.requests.filter((r: Request) => r.status !== "paid");
        })
        .catch((error) => {
          console.error("Error retrieving comments:", error);
          return [];
        });

      const requestsReceived = await fetch(
        `${process.env.EXPO_PUBLIC_REQUESTS_RECEIVED_ENDPOINT}/${account?.address}`,
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
            `Successfully retrieved requests for ${account?.address}`,
            data,
          );
          return data?.requests.filter((r: Request) => r.status !== "paid");
        })
        .catch((error) => {
          console.error("Error retrieving requests received:", error);
          return [];
        });
      const combinedLogs = [
        ...sentLogsWithComments,
        ...receivedLogs.transfers,
        ...(requestsSent as Request[]),
        ...(requestsReceived as Request[]),
      ];
      combinedLogs.sort((a, b) => {
        const aTimestamp = isRequest(a)
          ? parseFloat(a.timestamp)
          : new Date(a.metadata?.blockTimestamp).getTime();
        const bTimestamp = isRequest(b)
          ? parseFloat(b.timestamp)
          : new Date(b.metadata?.blockTimestamp).getTime();

        return bTimestamp - aTimestamp;
      });
      setTransactions(combinedLogs);
    };

    if (
      !payStatus ||
      payStatus === "success" ||
      !reqUpdateStatus ||
      reqUpdateStatus === "success"
    ) {
      getLogs();
    }
  }, [account, alchemy.core, payStatus, reqUpdateStatus]);

  const handleLogout = useCallback(() => {
    setPage("home");
    logout();
  }, [logout, setPage]);

  const handleDeclineRequest = useCallback(
    (req: Request) => {
      setButtonPressed({req: req.id, action: "decline"});
      denyRequest(req);
    },
    [denyRequest],
  );

  const handlePayRequest = useCallback(
    (req: Request) => {
      setButtonPressed({req: req.id, action: "pay"});
      payRequest(req);
      if (account?.address && isAddress(account?.address)) {
        payWithComment({
          recipient: {
            address: account.address,
            avatar: req.avatar,
            username: req.username,
          },
          amount: req.amount,
          comment: req.comment,
        });
      }
    },
    [account?.address, payRequest, payWithComment],
  );

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
              const isSend = transaction.origin === account?.address;
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
                    <Text
                      style={isSend ? styles.valueReceive : styles.valueSend}
                    >
                      {`${transaction.status === "declined" ? "Declined" : "Requested"}: ` +
                        (isSend ? "+" : "-") +
                        `$${parseFloat(transaction.amount)?.toFixed(2)}`}
                    </Text>
                  </View>
                  <View style={styles.transactionRow}>
                    <Text style={styles.description}>
                      {transaction.comment}
                    </Text>
                    {transaction.recipient === account?.address &&
                      transaction.status === "pending" && (
                        <View
                          style={{
                            width: "50%",
                            flexWrap: "nowrap",
                            flexDirection: "row",
                            justifyContent: "flex-end",
                          }}
                        >
                          <Button
                            style={{
                              backgroundColor: "#90EE90",
                              width: 80,
                            }}
                            onPress={() => handlePayRequest(transaction)}
                            disabled={
                              reqUpdateStatus === "pending" ||
                              payStatus === "pending"
                            }
                          >
                            {(reqUpdateStatus === "pending" ||
                              payStatus === "pending") &&
                            buttonPressed?.action === "pay" &&
                            buttonPressed.req === transaction.id ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              "Pay"
                            )}
                          </Button>
                          <Button
                            style={{
                              backgroundColor: "red",
                              marginLeft: 10,
                              width: 80,
                            }}
                            onPress={() => handleDeclineRequest(transaction)}
                            disabled={reqUpdateStatus === "pending"}
                          >
                            {reqUpdateStatus === "pending" &&
                            buttonPressed?.action === "decline" &&
                            buttonPressed.req === transaction.id ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              "Decline"
                            )}
                          </Button>
                        </View>
                      )}
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
