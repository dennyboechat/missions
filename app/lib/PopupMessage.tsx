"use client";

// Multivariate Dependencies
import { createContext, useContext, useState, ReactNode } from "react";

// Types
import { PopupMessageContextType } from "./types/PopupMessageContextType";

const defaultContextValue: PopupMessageContextType = {
  message: undefined,
  setMessage: (message?: string) => {},
};

const PopupMessageContext =
  createContext<PopupMessageContextType>(defaultContextValue);

export const PopupMessageProvider = ({ children }: { children: ReactNode }) => {
  const [message, setMessage] = useState<string | undefined>();

  return (
    <PopupMessageContext.Provider value={{ message, setMessage }}>
      {children}
    </PopupMessageContext.Provider>
  );
};

export const usePopupMessage = () => {
  const context = useContext(PopupMessageContext);
  if (!context) {
    throw new Error("You need to wrap PopupMessageProvider.");
  }
  return context;
};
