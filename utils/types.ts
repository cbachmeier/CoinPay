import {AssetTransfersWithMetadataResult} from "alchemy-sdk";

export type Account = {
  address: `0x${string}`;
  avatar?: string;
  username?: string;
};

/**
 * Requests should appear in feed with a prompt to pay or decline
 * Once paid or declined, the request should be removed from the recipient feed
 * If paid becomes a tx w/ or w/o a comment
 */

export type Request = {
  origin: string;
  recipient: string;
  amount: string;
  avatar?: string;
  username?: string;
  comment?: string;
  status: "pending" | "paid" | "declined";
  timestamp: string;
  id: string;
};

export type Comment = {
  hash: string;
  avatar?: string;
  username?: string;
  comment?: string;
  address: string;
};

export type TransactionWithComment = AssetTransfersWithMetadataResult & {
  comment?: Comment;
};
