"use client";

import { useSession } from "next-auth/react";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import AOS from "aos";
import "aos/dist/aos.css";

interface AppContextProps {
  isMounted?: boolean;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export default function AppProvider({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: "ease-out-cubic",
      once: true,
      offset: 50,
      // Add any other global AOS settings you want
    });
  }, []);

  return (
    <AppContext.Provider value={{ isMounted }}>{children}</AppContext.Provider>
  );
}

export const useAppProvider = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppProvider must be used within an AppProvider");
  }
  return context;
};
