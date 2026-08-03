"use client";

// Components
import { TextField } from "@radix-ui/themes";

// Types
import { AutocompleteProps } from "../types/AutocompleteProps";
import { AutocompleteItem } from "../types/AutocompleteItem";

// Hooks
import { useState, useEffect, useRef, useMemo } from "react";

// Types
import { FocusEvent } from "react";

// Utils
import { getNearestMatches } from "../../../../utils/getNearestMatches";

// Styles
import styles from "../styles/Autocomplete.module.css";

// The country list is 247 entries; rendering all of them on an empty query is
// pointless and slow to scroll.
const MAX_RESULTS = 50;

/**
 * Whether a mousedown landed on an element's scrollbar rather than its content.
 *
 * A scrollbar sits inside the element's border box but outside its client box,
 * so an offset past clientWidth or clientHeight is the gutter. Used to tell
 * "reaching for the page's scrollbar" apart from "clicking away from the field":
 * the page scrollbar is outside this component, so without this the list closed
 * as someone went to scroll the page it sits on.
 *
 * Whether a browser reports a scrollbar press as a mousedown at all differs --
 * macOS overlay scrollbars have no gutter to press -- so this only ever has to
 * be right when the event does arrive.
 */
const isScrollbarPress = (event: MouseEvent) => {
  const target = event.target;

  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    event.offsetX > target.clientWidth || event.offsetY > target.clientHeight
  );
};

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
  onConfirm,
  placeholder,
  readOnly,
  suppressOptions,
}: AutocompleteProps) => {
  const [text, setText] = useState(value ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Set while the mouse is held down inside the field or its list. Read by
  // handleBlur, which must not treat a scrollbar press as leaving the field.
  const isPressInsideRef = useRef(false);
  // The listeners below are registered once, so they read the open state from a
  // ref rather than closing over a stale value.
  const isOpenRef = useRef(false);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Follow the value the parent holds, e.g. when a country resolves from a
  // saved timezone, or the field is cleared.
  useEffect(() => {
    setText(value ?? "");
  }, [value]);

  const matches = useMemo(() => {
    const query = text.trim().toLowerCase();

    if (!query) {
      return items.slice(0, MAX_RESULTS);
    }

    const matching = items.filter((item) =>
      item.name.toLowerCase().includes(query)
    );

    // A typo matches no substring at all, and an empty list reads as "there is
    // no such entry" when the entry is sitting one keystroke away.
    const results =
      matching.length > 0 ? matching : getNearestMatches({ query, items });

    return results.slice(0, MAX_RESULTS);
  }, [items, text]);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (isScrollbarPress(event)) {
        return;
      }

      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Pressing anywhere in the field or its list is not leaving the field, even
    // when the browser moves focus off the input for it. See handleBlur.
    const noteInsidePress = (event: MouseEvent) => {
      isPressInsideRef.current = Boolean(
        containerRef.current?.contains(event.target as Node)
      );
    };

    const releasePress = () => {
      if (!isPressInsideRef.current) {
        return;
      }

      isPressInsideRef.current = false;

      // Focus goes back once the scroll is over, so typing and the arrow keys
      // still work. Left on the body, the next keystroke would go nowhere.
      if (isOpenRef.current) {
        inputRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", noteInsidePress, true);
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("mouseup", releasePress);

    return () => {
      document.removeEventListener("mousedown", noteInsidePress, true);
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("mouseup", releasePress);
    };
  }, []);

  /**
   * Leaving the field closes the list.
   *
   * Two things that look like leaving are not. Picking an option cancels its own
   * mousedown, so the input never loses focus and choose() does the closing.
   * Pressing the list's scrollbar is the case this guard exists for: the gutter
   * is not an option, nothing cancels that mousedown, and the browser moves
   * focus off the input -- which used to shut the list on the way to scrolling
   * it, so the list could not be scrolled by its own scrollbar at all.
   *
   * Cancelling the mousedown on the list instead would keep focus, but it also
   * cancels the browser's scrollbar drag, which is the thing being reached for.
   */
  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    if (isPressInsideRef.current) {
      return;
    }

    setIsOpen(false);
    setHighlightedIndex(-1);

    if (onBlur) {
      onBlur(event);
    }
  };

  const choose = (item: AutocompleteItem) => {
    setText(item.name);
    setIsOpen(false);
    setHighlightedIndex(-1);

    if (onSelect) {
      onSelect(item);
    }

    // Picking an option is a deliberate finish, the same as Enter.
    if (onConfirm) {
      onConfirm(item.name);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (readOnly) return;

    // Nothing to walk through or pick while the list is held shut.
    const isListUsable = isOpen && !suppressOptions;

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

    if (event.key === "Enter") {
      event.preventDefault();

      const highlighted = isListUsable ? matches[highlightedIndex] : undefined;

      // choose() confirms on its own, so this only has to cover typed text.
      if (highlighted) {
        choose(highlighted);
      } else if (onConfirm) {
        setIsOpen(false);
        onConfirm(text);
      }

      if (onConfirm) {
        return;
      }

      // Nobody is listening for the confirmation, so fall back to leaving the
      // field: that is what runs a blur-driven commit, and it beats Enter
      // quietly doing nothing. The blur reads the input directly and React has
      // not re-rendered yet, so the chosen name goes to the DOM by hand.
      setIsOpen(false);
      event.currentTarget.value = highlighted?.name ?? text;
      event.currentTarget.blur();
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
        ref={inputRef}
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
        onBlur={handleBlur}
        onKeyDown={onKeyDown}
      />
      {isOpen && !suppressOptions && matches.length > 0 && (
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
