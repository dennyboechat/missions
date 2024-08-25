// Components
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import { AutocompleteProps } from "../types/AutocompleteProps";

// Hooks
import { useRef, useEffect } from "react";

export const Autocomplete = ({
  items,
  onSelect,
  onBlur,
  placeholder,
  readOnly,
}: AutocompleteProps) => {
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      const inputElement = inputRef.current.querySelector("input");

      if (inputElement) {
        const handleBlur = (event: FocusEvent) => {
          if (onBlur) {
            onBlur(event as unknown as React.FocusEvent<HTMLInputElement>);
          }
        };

        inputElement.readOnly = readOnly || false;

        inputElement.addEventListener("blur", handleBlur);

        return () => {
          inputElement.removeEventListener("blur", handleBlur);
        };
      }
    }
  }, [onBlur, readOnly]);

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
        onSelect={onSelect}
        placeholder={placeholder}
        className="autocomplete"
        styling={styling}
      />
    </div>
  );
};
