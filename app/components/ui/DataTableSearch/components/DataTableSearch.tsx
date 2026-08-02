"use client";

// Components
import { TextField, IconButton } from "@radix-ui/themes";
import { Icon } from "../../Icon";

// Types
import { DataTableSearchProps } from "../types/DataTableSearchProps";

// Hooks
import { useState, useEffect, useRef } from "react";

// Styles
import styles from "../styles/DataTableSearch.module.css";

export const DataTableSearch = ({
  onSearchTextChange,
  isSearchAutoFocus,
  placeholder = "Search...",
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
      placeholder={placeholder}
      autoFocus={isSearchAutoFocus}
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
      ref={searchInputRef}
      className={styles.search}
    >
      <TextField.Slot>
        <Icon name="search" size={16} />
      </TextField.Slot>
      <TextField.Slot>
        {searchText && (
          <IconButton
            variant="ghost"
            size="1"
            aria-label="Clear search"
            title="Clear search"
            onClick={onClear}
            className={styles.clear_button}
          >
            <Icon name="x" size={15} />
          </IconButton>
        )}
      </TextField.Slot>
    </TextField.Root>
  );
};
