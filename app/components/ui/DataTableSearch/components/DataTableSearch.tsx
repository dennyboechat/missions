"use client";

// Components
import { TextField, Button } from "@radix-ui/themes";

// Types
import { DataTableSearchProps } from "../types/DataTableSearchProps";

// Hooks
import { useState, useEffect, useRef } from "react";

export const DataTableSearch = ({
  onSearchTextChange,
  isSearchAutoFocus,
}: DataTableSearchProps) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const updateData = setTimeout(() => {
      if (onSearchTextChange) {
        onSearchTextChange(searchText);
      }
    }, 1000);

    return () => clearTimeout(updateData);
  }, [searchText, onSearchTextChange]);

  const onClear = () => {
    setSearchText("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <TextField.Root
      placeholder="Search..."
      autoFocus={isSearchAutoFocus}
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
      ref={searchInputRef}
    >
      <TextField.Slot />
      <TextField.Slot>
        {searchText && (
          <Button variant="ghost" onClick={onClear}>
            {"Clear"}
          </Button>
        )}
      </TextField.Slot>
    </TextField.Root>
  );
};
