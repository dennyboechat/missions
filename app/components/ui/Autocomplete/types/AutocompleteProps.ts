// Types
import { AutocompleteItem } from "./AutocompleteItem";
import { FocusEvent } from "react";

export interface AutocompleteProps {
  items: AutocompleteItem[];
  onSelect?: (item: AutocompleteItem) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  readOnly?: boolean;
}
