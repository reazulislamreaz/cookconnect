"use client";

import LoadingPage from "../app/loading";
import { makeStore } from "../redux/store";
import { useRef } from "react";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";

export default function StoreProvider({ children }) {
  const storeRef = useRef();

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  const persistedStore = persistStore(storeRef.current);

  return (
    <Provider store={storeRef.current}>
      <PersistGate loading={<LoadingPage />} persistor={persistedStore}>
        {children}
      </PersistGate>
    </Provider>
  );
}
