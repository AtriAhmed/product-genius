"use client";

import React, { createContext, ReactNode, useContext } from "react";

interface AppContextProps {}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return <AppContext.Provider value={{}}>{children}</AppContext.Provider>;
};

export const useAppProvider = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppProvider must be used within an AppProvider");
  }
  return context;
};
