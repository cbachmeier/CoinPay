import {atom} from "jotai";

export const pageAtom = atom<"home" | "profile" | "search">("home");

export const txAmountAtom = atom<string>("0");
export const txTypeAtom = atom<"pay" | "request" | undefined>(undefined);
