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

export const SideMenuLayout = ({
  menuItems,
  header,
  subHeader,
  subHeaderFooter,
  isBoldHeader,
  children,
}: SideMenuLayoutProps) => {
  // Starts false on the server and on the first client render, so the two
  // agree; the effect below narrows it once the window width is known. This
  // used to be gated behind a mounted flag that returned null instead, which
  // blanked the whole layout on every navigation -- that blank was the
  // "refresh", and clicking again while the menu reflowed landed on whichever
  // item had moved under the cursor.
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const smallScreenResolution = 768;

      setCollapsed(
        typeof window !== "undefined" &&
          window.innerWidth <= smallScreenResolution
      );
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
    }

    handleResize();

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
      }
    };
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
        <Box
          width="var(--sidebar-width)"
          height={subHeader ? "150px" : "88px"}
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
        </Box>
        <Menu>{menuItems}</Menu>
      </Sidebar>
      {children}
    </Grid>
  );
};
