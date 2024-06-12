export function shortenAddress(address?: string | null, digits = 4) {
  if (!address) return "";
  return `${address.slice(0, digits + 2)}....${address.slice(-digits)}`;
}
