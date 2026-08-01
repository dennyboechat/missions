// Types
import { AutocompleteItem } from "./AutocompleteItem";
import { FocusEvent } from "react";

export interface AutocompleteProps {
  items: AutocompleteItem[];
  value?: string;
  onSelect?: (item: AutocompleteItem) => void;
  /** Fires on every keystroke, including when the field is emptied. */
  onSearch?: (keyword: string) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  readOnly?: boolean;
}
