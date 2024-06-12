import {normalize} from "viem/ens";
import {usePublicClient} from "../providers/ViemPublicClient";
import {Account} from "../utils/types";
import {isAddress} from "viem";
import blockies from "ethereum-blockies";
import {shortenAddress} from "../utils";

export const useENS = () => {
  const publicClient = usePublicClient();
  const getAccountForAddress = async (address: string) => {
    if (!isAddress(address)) {
      return null;
    }
    const username = await publicClient?.getEnsName({
      address,
    });
    const avatar =
      username &&
      (await publicClient?.getEnsAvatar({
        name: normalize(username),
      }));
    // TODO: investigate broken blockies ReferenceError: Property 'document' doesn't exist
    // const icon = blockies.create({seed: address}).toDataURL();
    const account: Account = {
      address,
      avatar: avatar || undefined,
      username: username || shortenAddress(address),
    };
    return account;
  };

  const getAccountForUsername = async (username: string) => {
    const ensAddress = await publicClient?.getEnsAddress({
      name: normalize(username),
    });
    console.log({ensAddress});
    if (!ensAddress) {
      return null;
    }
    const avatar = await publicClient?.getEnsAvatar({
      name: normalize(username),
    });
    // const icon = blockies.create({seed: ensAddress}).toDataURL();
    const account: Account = {
      address: ensAddress,
      avatar: avatar || undefined,
      username,
    };
    return account;
  };
  return {getAccountForAddress, getAccountForUsername};
};
