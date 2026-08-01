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
  /**
   * The user deliberately finished with the field: Enter, or picking an option.
   * Distinct from onBlur, which also fires when focus merely wanders off, and
   * which therefore must not move the caret anywhere.
   *
   * When given, it takes over from blurring on Enter, so the caller decides
   * where focus goes next.
   */
  onConfirm?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  /**
   * Keeps the options list shut while the caller is showing something of its
   * own under the field. The list is absolutely positioned over that space, so
   * without this it buries whatever is there.
   */
  suppressOptions?: boolean;
}
