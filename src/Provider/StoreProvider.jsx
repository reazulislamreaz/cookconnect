"use client";

import { makeStore } from "../redux/store";
import { useRef } from "react";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";

export default function StoreProvider({ children }) {
  const storeRef = useRef();
  const persistorRef = useRef();

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  // persistStore was previously called on every render, creating a new
  // persistor each time; it only ever needs to run once per store.
  if (!persistorRef.current && typeof window !== "undefined") {
    persistorRef.current = persistStore(storeRef.current);
  }

  // PersistGate deliberately removed.
  //
  // It renders its `loading` element instead of the children until rehydration
  // finishes, and rehydration never happens during server rendering. The result
  // was that every page served an empty shell and only filled in after the
  // client bundle hydrated — no server-rendered content for search engines and a
  // blank first paint on mobile, which is the opposite of what this project
  // needs (the client expects most traffic on phones).
  //
  // Rehydration still runs via persistStore above; we simply no longer block
  // painting on it. Any component that must wait for persisted state should
  // handle that locally rather than gating the whole tree.
  return <Provider store={storeRef.current}>{children}</Provider>;
}
