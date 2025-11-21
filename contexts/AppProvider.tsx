"use client";

import useLocalStorage from "@/hooks/use-local-storage";
import AOS from "aos";
import "aos/dist/aos.css";
import { createContext, ReactNode, useContext, useEffect } from "react";
import { CartItem, UserSubscriptionInfo } from "@/types";
import axios from "axios";
import useSWR from "swr";
import { Plan } from "@/types";

interface AppContextProps {
  currentPlan: Plan | undefined;
  mutateCurrentPlan: () => Promise<Plan | undefined>;
  userSubscriptionInfo: UserSubscriptionInfo | undefined;
  mutateUserSubscriptionInfo: () => Promise<UserSubscriptionInfo | undefined>;
}

type AppProviderProps = {
  children: ReactNode;
};

const AppContext = createContext<AppContextProps | undefined>(undefined);

async function fetcher(): Promise<Plan> {
  const response = await axios.get("/api/plans/current");

  return response.data;
}

async function userSubscriptionInfoFetcher(): Promise<UserSubscriptionInfo> {
  const response = await axios.get("/api/users/current/subscription-info");

  return response.data;
}

export default function AppProvider({ children }: AppProviderProps) {
  const {
    data: currentPlan,
    error,
    isLoading,
    mutate: mutateCurrentPlan,
  } = useSWR<Plan>("current-plan", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  const {
    data: userSubscriptionInfo,
    error: userSubscriptionInfoError,
    isLoading: userSubscriptionInfoIsLoading,
    mutate: mutateUserSubscriptionInfo,
  } = useSWR<UserSubscriptionInfo>("user-subscription-info", userSubscriptionInfoFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

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
    <AppContext.Provider
      value={{
        currentPlan,
        mutateCurrentPlan,
        userSubscriptionInfo,
        mutateUserSubscriptionInfo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useAppProvider = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppProvider must be used within an AppProvider");
  }
  return context;
};
