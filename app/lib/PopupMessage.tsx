"use client";

// Multivariate Dependencies
import { createContext, useContext, useState, ReactNode } from "react";

// Types
import {
  PopupMessageContextType,
  PopupMessageType,
} from "./types/PopupMessageContextType";

const defaultContextValue: PopupMessageContextType = {
  message: undefined,
  setMessage: () => {},
  messageType: "regular",
  setMessageType: () => {},
};

const PopupMessageContext =
  createContext<PopupMessageContextType>(defaultContextValue);

export const PopupMessageProvider = ({ children }: { children: ReactNode }) => {
  const [message, setMessage] = useState<string | undefined>();
  const [messageType, setMessageType] = useState<PopupMessageType>();

  return (
    <PopupMessageContext.Provider
      value={{ message, setMessage, messageType, setMessageType }}
    >
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
