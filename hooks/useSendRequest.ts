import {useCallback, useState} from "react";
import {
  getUserEmbeddedWallet,
  useEmbeddedWallet,
  usePrivy,
} from "@privy-io/expo";
import {Account, Request} from "../utils/types";
import {v4 as uuidv4} from "uuid";

export const useSendRequest = () => {
  const {user} = usePrivy();
  const [status, setStatus] = useState<
    "pending" | "success" | "error" | undefined
  >(undefined);
  const wallet = useEmbeddedWallet();
  const account = getUserEmbeddedWallet(user);

  const sendRequest = useCallback(
    async ({
      recipient,
      amount,
      comment,
    }: {
      recipient: Account | null;
      amount: string;
      comment?: string;
    }) => {
      if (
        wallet.status !== "connected" ||
        !account?.address ||
        !recipient ||
        !process.env.EXPO_PUBLIC_REQUESTS_SENT_ENDPOINT ||
        !process.env.EXPO_PUBLIC_REQUESTS_RECEIVED_ENDPOINT
      ) {
        console.log("Wallet not connected or balance is 0");
        return;
      }
      try {
        const id = uuidv4();
        fetch(process.env.EXPO_PUBLIC_REQUESTS_SENT_ENDPOINT, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            origin: account?.address,
            recipient: recipient.address,
            amount,
            avatar: recipient.avatar,
            username: recipient.username,
            comment,
            status: "pending",
            timestamp: Date.now().toString(),
            id,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Success sending requests sent:", data);
          })
          .catch((error) => {
            console.error("Error:", error);
          });
        fetch(process.env.EXPO_PUBLIC_REQUESTS_RECEIVED_ENDPOINT, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            origin: account?.address,
            recipient: recipient.address,
            amount,
            avatar: recipient.avatar,
            username: recipient.username,
            comment,
            status: "pending",
            timestamp: Date.now().toString(),
            id,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Success sending requests received:", data);
          })
          .catch((error) => {
            console.error("Error:", error);
          });

        setStatus("success");

        alert(`Requested $${amount} from ${recipient.address} successfully`);
      } catch (e) {
        setStatus("error");
        console.error(e);
      }
    },
    [wallet, account?.address],
  );

  const denyRequest = useCallback((req: Request) => {
    try {
      fetch(
        `${process.env.EXPO_PUBLIC_REQUESTS_SENT_ENDPOINT}/${req.origin}/${req.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            origin: req.origin,
            id: req.id,
            status: "declined",
          }),
        },
      )
        .then((response) => response.json())
        .then((data) => {
          console.log("Success denying requests sent:", data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
      fetch(
        `${process.env.EXPO_PUBLIC_REQUESTS_RECEIVED_ENDPOINT}/${req.recipient}/${req.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipient: req.recipient,
            id: req.id,
            status: "declined",
          }),
        },
      )
        .then((response) => response.json())
        .then((data) => {
          console.log("Success denying requests received:", data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });

      setStatus("success");
    } catch (e) {
      setStatus("error");
      console.error(e);
    }
  }, []);

  const payRequest = useCallback((req: Request) => {
    try {
      fetch(
        `${process.env.EXPO_PUBLIC_REQUESTS_SENT_ENDPOINT}/${req.origin}/${req.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            origin: req.origin,
            id: req.id,
            status: "paid",
          }),
        },
      )
        .then((response) => response.json())
        .then((data) => {
          console.log("Success paying requests sent:", data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
      fetch(
        `${process.env.EXPO_PUBLIC_REQUESTS_RECEIVED_ENDPOINT}/${req.recipient}/${req.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipient: req.recipient,
            id: req.id,
            status: "paid",
          }),
        },
      )
        .then((response) => response.json())
        .then((data) => {
          console.log("Success paying requests received:", data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });

      setStatus("success");
    } catch (e) {
      setStatus("error");
      console.error(e);
    }
  }, []);

  return {sendRequest, status, denyRequest, payRequest};
};
