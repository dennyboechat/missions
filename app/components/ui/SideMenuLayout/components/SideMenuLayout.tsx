"use client";

// Components
import { Grid, Container } from "@radix-ui/themes";
import { Sidebar, Menu } from "react-pro-sidebar";

// Types
import { SideMenuLayoutProps } from "../types/SideMenuLayoutProps";

export const SideMenuLayout = ({
  menuItems,
  children,
}: SideMenuLayoutProps) => (
  <Grid columns="auto 1fr">
    <Sidebar>
      <Menu>{menuItems}</Menu>
    </Sidebar>
    {children}
  </Grid>
);
