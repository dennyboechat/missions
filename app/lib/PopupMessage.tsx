"use client";

// Multivariate Dependencies
import { createContext, useContext, useState } from "react";

// Types
import { PopupMessageContextType } from "./types/PopupMessageContextType";

const PopupMessageContext = createContext<PopupMessageContextType>({
  message: undefined,
  setMessage: () => {},
});

export const PopupMessageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
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
