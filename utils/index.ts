import {isAddress} from "viem";

export function shortenAddress(address?: string | null, digits = 4) {
  if (!address) return "";
  if (!isAddress(address)) return address;
  return `${address.slice(0, digits + 2)}....${address.slice(-digits)}`;
}
