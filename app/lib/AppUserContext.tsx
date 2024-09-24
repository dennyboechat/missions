"use client";

// Multivariate Dependencies
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

// Types
import { AppUser } from "../types/AppUser";
import { AppUserContextType } from "./types/AppUserContextType";

// Databases
import { getAppUser } from "../database/app-user/GetAppUser";

// Hook
import { useUser } from "@clerk/nextjs";

const defaultContextValue: AppUserContextType = {
  appUser: undefined,
  setAppUser: (appUser?: AppUser) => {},
};

const AppUserContext = createContext<AppUserContextType>(defaultContextValue);

export const AppUserProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [appUser, setAppUser] = useState<AppUser | undefined>(undefined);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const { id: userId } = user;
        const loggedUser = await getAppUser({
          field: "user_third_party_id",
          value: userId,
        });

        if (loggedUser) {
          setAppUser(loggedUser);
        } else {
          console.error("User not found");
        }
      } else {
        setAppUser(undefined);
      }
    };

    fetchUserData();
  }, [user]);

  return (
    <AppUserContext.Provider value={{ appUser, setAppUser }}>
      {children}
    </AppUserContext.Provider>
  );
};

export const useAppUser = () => {
  const context = useContext(AppUserContext);
  if (!context) {
    throw new Error("You need to wrap AppUserProvider.");
  }
  return context;
};
