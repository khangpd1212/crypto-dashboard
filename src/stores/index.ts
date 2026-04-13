// store.ts
import { createContext, useContext } from "react";
import { marketStore } from "./marketStore";
import { settingsStore } from "./settingsStore";
import { tokenStore } from "./tokenStore";

export const rootStore = {
  marketStore,
  settingsStore,
  tokenStore,
};

export type TRootStore = typeof rootStore;
const RootStoreContext = createContext<null | TRootStore>(null);

export const Provider = RootStoreContext.Provider;

export function useStore() {
  const store = useContext(RootStoreContext);
  if (store === null) {
    throw new Error("Store cannot be null, please add a context provider");
  }
  return store;
}
