export type PopupMessageType = "regular" | "error";

export interface PopupMessageContextType {
  message?: string;
  setMessage?: (message?: string) => void;
  messageType?: PopupMessageType;
  setMessageType?: (type?: PopupMessageType) => void;
}
