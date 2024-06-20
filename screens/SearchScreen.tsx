import React, {useCallback, useEffect, useState} from "react";
import {
  View,
  TextInput,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import CustomCheckbox from "../components/Checkbox";
import {useAtom} from "jotai";
import {pageAtom, txAmountAtom, txTypeAtom} from "../utils/atoms";
import {Button} from "../components/Button";
import {useENS} from "../hooks/useENS";
import {isAddress} from "viem";
import {Account} from "../utils/types";
import {usePayWithComment} from "../hooks/usePayWithComment";

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  //   const [search, setSearch] = useState("");
  const [recipient, setRecipient] = useState<Account | null>(null);
  const [comment, setComment] = useState<string | undefined>(undefined);
  // TODO prepopulate tx feed on login (atom)
  const [recentAccounts, setRecentAccounts] = useState([]); // Populate this with your data
  const [, setPage] = useAtom(pageAtom);
  const [txType] = useAtom(txTypeAtom);
  const [amount] = useAtom(txAmountAtom);
  const {getAccountForAddress, getAccountForUsername} = useENS();
  const {payWithComment, status} = usePayWithComment();

  // TODO: add debounce
  const searchForUser = useCallback(
    async (text: string) => {
      setSearchQuery(text);
      if (text && text.length > 2) {
        if (isAddress(text)) {
          const account = await getAccountForAddress(text);
          if (account) {
            setRecipient(account);
          }
        } else {
          try {
            const ens = text.endsWith(".eth") ? text : `${text}.eth`;
            const account = await getAccountForUsername(ens);
            if (account) {
              setRecipient(account);
            } else {
              setRecipient(null);
            }
          } catch (e) {
            console.error(e);
            setRecipient(null);
          }
        }
      } else {
        setRecipient(null);
      }
    },
    [getAccountForAddress, getAccountForUsername],
  );

  const handlePay = useCallback(async () => {
    if (recipient && amount) {
      await payWithComment({
        recipient,
        amount,
        comment,
      });
    }
  }, [amount, comment, payWithComment, recipient]);

  useEffect(() => {
    if (status === "success") {
      setPage("home");
    }
  }, [setPage, status]);

  return (
    <View style={styles.container}>
      <Button onPress={() => setPage("home")}>Back</Button>
      <TextInput
        placeholder="Search by name, phone, or username"
        value={searchQuery}
        onChangeText={searchForUser}
        style={styles.searchInput}
      />
      <TextInput
        placeholder="Add a comment"
        value={comment}
        onChangeText={setComment}
        maxLength={80}
        style={styles.commentInput}
      />
      {/* TODO: Add recent transactions/accounts */}
      <FlatList
        data={recentAccounts}
        keyExtractor={(item) => item.id}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.accountItem}
            onPress={() => setRecipient(item.id)}
          >
            <CustomCheckbox
              isChecked={recipient === item.id}
              onPress={() => setRecipient(item.id)}
            />
            <Image
              source={{uri: item.profilePhoto}}
              style={styles.profilePhoto}
            />
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
      <Button
        onPress={() => {
          if (txType === "pay") {
            handlePay();
          } else {
            alert("Requesting is not yet implemented");
          }
        }}
        style={recipient ? styles.actionButton : styles.disabledButton}
        disabled={!recipient}
      >
        {status === "pending" ? (
          <ActivityIndicator size="small" color="#fff" /> // Show spinner when status is pending
        ) : (
          <Text style={styles.buttonText}>
            {txType === "request" ? "Request" : "Pay"}
          </Text>
        )}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  searchInput: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    padding: 10,
  },
  commentInput: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    padding: 10,
  },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  actionButton: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#007BFF",
    color: "#fff",
    fontSize: 24,
  },
  disabledButton: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
    color: "#fff",
    fontSize: 24,
    backgroundColor: "rgba(0, 123, 255, 0.5)",
  },
  buttonText: {
    color: "#fff",
    fontSize: 24,
    fontStyle: "normal",
  },
});

export default SearchScreen;
