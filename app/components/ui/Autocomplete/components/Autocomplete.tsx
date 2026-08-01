"use client";

// Components
import { TextField } from "@radix-ui/themes";

// Types
import { AutocompleteProps } from "../types/AutocompleteProps";
import { AutocompleteItem } from "../types/AutocompleteItem";

// Hooks
import { useState, useEffect, useRef, useMemo } from "react";

// Styles
import styles from "../styles/Autocomplete.module.css";

// The country list is 247 entries; rendering all of them on an empty query is
// pointless and slow to scroll.
const MAX_RESULTS = 50;

/**
 * A combobox: type to filter, pick with the mouse or keyboard, or just type a
 * value that is not in the list.
 *
 * Replaces react-search-autocomplete, which is unmaintained, declares a React
 * 18 peer against React 19, and rebuilt its result list whenever its value
 * prop changed -- so the list sprang open on any form that loaded with a value
 * and reopened on the very click that selected an item. Both needed CSS
 * workarounds. Here the list is open only when this component says it is.
 */
export const Autocomplete = ({
  items,
  value,
  onSelect,
  onSearch,
  onBlur,
  placeholder,
  readOnly,
}: AutocompleteProps) => {
  const [text, setText] = useState(value ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Follow the value the parent holds, e.g. when a country resolves from a
  // saved timezone, or the field is cleared.
  useEffect(() => {
    setText(value ?? "");
  }, [value]);

  const matches = useMemo(() => {
    const query = text.trim().toLowerCase();
    const matching = query
      ? items.filter((item) => item.name.toLowerCase().includes(query))
      : items;

    return matching.slice(0, MAX_RESULTS);
  }, [items, text]);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const choose = (item: AutocompleteItem) => {
    setText(item.name);
    setIsOpen(false);
    setHighlightedIndex(-1);

    if (onSelect) {
      onSelect(item);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (readOnly) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((index) => Math.min(index + 1, matches.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (event.key === "Enter" && isOpen && matches[highlightedIndex]) {
      event.preventDefault();
      choose(matches[highlightedIndex]);
      return;
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.container}${readOnly ? ` ${styles.readonly}` : ""}`}
    >
      <TextField.Root
        value={text}
        placeholder={placeholder}
        readOnly={readOnly}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        onChange={(event) => {
          setText(event.target.value);
          setIsOpen(true);
          setHighlightedIndex(-1);

          if (onSearch) {
            onSearch(event.target.value);
          }
        }}
        onFocus={() => {
          if (!readOnly) setIsOpen(true);
        }}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      />
      {isOpen && matches.length > 0 && (
        <ul className={styles.list} role="listbox">
          {matches.map((item, index) => (
            <li
              key={item.id}
              role="option"
              aria-selected={index === highlightedIndex}
              className={`${styles.option}${
                index === highlightedIndex ? ` ${styles.highlighted}` : ""
              }`}
              onMouseEnter={() => setHighlightedIndex(index)}
              // mousedown rather than click: it runs before blur, so the input
              // keeps focus and any onBlur handler sees the chosen value.
              onMouseDown={(event) => {
                event.preventDefault();
                choose(item);
              }}
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
