"use client";

// Components
import { Grid, Box, Text } from "@radix-ui/themes";
import { Sidebar, Menu } from "react-pro-sidebar";

// Types
import { SideMenuLayoutProps } from "../types/SideMenuLayoutProps";

// Styles
import styles from "../styles/SideMenuLayout.module.css";

// Hooks
import { useEffect, useState } from "react";

// The same breakpoint as the rail rules in globals.css and the blocks hidden in
// SideMenuLayout.module.css. It has to exist in both languages: CSS decides how
// the narrow menu looks, and react-pro-sidebar only takes a boolean.
const COLLAPSE_BELOW = "(max-width: 768px)";

// What the context block reserves, in pixels. A name on its own needs one line
// and its padding; a name with a date of birth and a sex under it needs three.
// The block is measured rather than grown to fit because the menu below has to
// start in the same place on the first paint as it does once the record has
// loaded -- see the height it is applied to.
const HEADER_HEIGHT = 88;
const HEADER_WITH_SUB_HEADER_HEIGHT = 150;
// The same three lines with a QR code under them. Measured as its own figure,
// not added to the one above: those two carry enough slack for a name that wraps
// to a second line, and adding one to the other banked the slack twice over,
// which is what left the code floating in the middle of a tall panel.
const HEADER_WITH_EXTRA_HEIGHT = 216;

export const SideMenuLayout = ({
  menuItems,
  header,
  subHeader,
  subHeaderFooter,
  headerExtra,
  isBoldHeader,
  footer,
  children,
}: SideMenuLayoutProps) => {
  // Starts false on the server and on the first client render, so the two
  // agree; the effect below narrows it once the window width is known. This
  // used to be gated behind a mounted flag that returned null instead, which
  // blanked the whole layout on every navigation -- that blank was the
  // "refresh", and clicking again while the menu reflowed landed on whichever
  // item had moved under the cursor.
  //
  // The false first render is no longer visible: the rail's width and padding
  // come from the matching media query in globals.css, so the narrow layout is
  // painted before this runs. What this state is for is telling
  // react-pro-sidebar, which cannot read a media query.
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(COLLAPSE_BELOW);
    const apply = () => setCollapsed(query.matches);

    apply();
    // Crossings only. The resize listener this replaced re-ran on every pixel
    // of a drag, and on mobile on every scroll that nudges the viewport, each
    // time setting the same boolean it already held.
    query.addEventListener("change", apply);

    return () => query.removeEventListener("change", apply);
  }, []);

  return (
    <Grid columns="auto minmax(0, 1fr)">
      <Sidebar
        width="var(--sidebar-width)"
        collapsedWidth="var(--sidebar-width-collapsed)"
        collapsed={collapsed}
        className={styles.sidebar}
        backgroundColor="var(--surface-raised)"
      >
        {/* Present but empty is not the same as absent: "" still reserves the
            block, so the menu does not shift when the name arrives. A panel
            that puts its context at the bottom passes no header at all. */}
        {header !== undefined && (
          <Box
            width="var(--sidebar-width)"
            // Presence, not content: a panel that will show a date of birth
            // reserves the taller block from the start, so the menu does not
            // step down and back up as the record loads.
            height={`${
              headerExtra
                ? HEADER_WITH_EXTRA_HEIGHT
                : subHeader !== undefined
                  ? HEADER_WITH_SUB_HEADER_HEIGHT
                  : HEADER_HEIGHT
            }px`}
            className={styles.header}
          >
            <Text
              weight={isBoldHeader ? "bold" : "medium"}
              className={styles.header_text}
            >
              {header}
            </Text>
            {subHeader && (
              <Text className={styles.header_sub_text}>{subHeader}</Text>
            )}
            {subHeaderFooter && (
              <Text className={styles.header_sub_text_footer}>
                {subHeaderFooter}
              </Text>
            )}
            {headerExtra}
          </Box>
        )}
        <Menu>{menuItems}</Menu>
        {footer !== undefined && (
          <Box width="var(--sidebar-width)" className={styles.footer}>
            <Text weight="medium" className={styles.footer_text}>
              {footer}
            </Text>
          </Box>
        )}
      </Sidebar>
      {children}
    </Grid>
  );
};
