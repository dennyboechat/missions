"use client";

// Components
import { TabNav } from "@radix-ui/themes";

// Types
import { TabNavigatorProps } from "../types/TabNavigatorProps";

export const TabNavigator = ({ children }: TabNavigatorProps) => (
  <TabNav.Root>{children}</TabNav.Root>
);
