"use client";

// Components
import { Grid, Box } from "@radix-ui/themes";
import { Sidebar, Menu } from "react-pro-sidebar";

// Types
import { SideMenuLayoutProps } from "../types/SideMenuLayoutProps";

// Styles
import styles from "../styles/SideMenuLayout.module.css";

export const SideMenuLayout = ({
  menuItems,
  header,
  children,
}: SideMenuLayoutProps) => (
  <>
    <Box width="200px" height="50px" className={styles.header}>
      {header}
    </Box>
    <Grid columns="auto 1fr">
      <Sidebar width="200px">
        <Menu>{menuItems}</Menu>
      </Sidebar>
      {children}
    </Grid>
  </>
);
