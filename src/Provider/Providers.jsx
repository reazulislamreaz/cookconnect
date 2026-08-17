"use client";

import StoreProvider from "./StoreProvider";





const Providers = ({ children }) => {
  return (
    // <UserProvider>
      <StoreProvider>{children}</StoreProvider>
    // </UserProvider>
  );
};

export default Providers;
