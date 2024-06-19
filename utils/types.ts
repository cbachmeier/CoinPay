import {AssetTransfersWithMetadataResult} from "alchemy-sdk";

export type Account = {
  address: `0x${string}`;
  avatar?: string;
  username?: string;
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
