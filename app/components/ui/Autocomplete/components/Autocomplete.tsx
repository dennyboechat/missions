"use client";

// Components
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import { AutocompleteProps } from "../types/AutocompleteProps";
import { AutocompleteItem } from "../types/AutocompleteItem";

// Hooks
import { useRef, useEffect, useState } from "react";

// Keys that end an interaction rather than asking to browse the list again.
const LIST_CLOSING_KEYS = ["Enter", "Tab", "Escape"];

export const Autocomplete = ({
  items,
  value,
  onSelect,
  onSearch,
  onBlur,
  placeholder,
  readOnly,
}: AutocompleteProps) => {
  const inputRef = useRef<HTMLDivElement>(null);

  // Choosing an item changes the value prop, and the library repopulates its
  // result list whenever that prop changes -- so the list springs straight
  // back open on the click that just closed it, and the input still has focus
  // so :focus-within cannot hide it. Keep it shut until the user actually asks
  // for the list again.
  const [isListSuppressed, setIsListSuppressed] = useState(false);

  useEffect(() => {
    const inputElement = inputRef.current?.querySelector("input");

    if (!inputElement) {
      return;
    }

    const handleBlur = (event: FocusEvent) => {
      if (onBlur) {
        onBlur(event as unknown as React.FocusEvent<HTMLInputElement>);
      }
    };

    const showList = () => setIsListSuppressed(false);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!LIST_CLOSING_KEYS.includes(event.key)) {
        showList();
      }
    };

    inputElement.readOnly = readOnly || false;

    inputElement.addEventListener("blur", handleBlur);
    // Typing, clicking back into the field, or arrowing through it are all
    // requests to see the options again.
    inputElement.addEventListener("input", showList);
    inputElement.addEventListener("mousedown", showList);
    inputElement.addEventListener("keydown", handleKeyDown);

    return () => {
      inputElement.removeEventListener("blur", handleBlur);
      inputElement.removeEventListener("input", showList);
      inputElement.removeEventListener("mousedown", showList);
      inputElement.removeEventListener("keydown", handleKeyDown);
    };
  }, [onBlur, readOnly]);

  const handleSelect = (item: AutocompleteItem) => {
    setIsListSuppressed(true);

    if (onSelect) {
      onSelect(item);
    }
  };

  const styling = {
    borderRadius: "3.4px",
    height: "33.18px",
    backgroundColor: readOnly ? "#f5f5f5" : "#fff",
    cursor: readOnly ? "not-allowed" : "text",
  };

  return (
    <div ref={inputRef}>
      <ReactSearchAutocomplete
        items={items}
        showIcon={false}
        showClear={false}
        showNoResults={false}
        onSelect={handleSelect}
        onSearch={(keyword: string) => onSearch?.(keyword)}
        placeholder={placeholder}
        className={`autocomplete${
          isListSuppressed ? " autocomplete_list_closed" : ""
        }${readOnly ? " autocomplete_readonly" : ""}`}
        styling={styling}
        inputSearchString={value}
      />
    </div>
  );
};
