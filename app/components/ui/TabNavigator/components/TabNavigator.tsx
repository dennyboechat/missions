"use client";

// Components
import { Tabs } from "@radix-ui/themes";

// Types
import { TabNavigatorProps } from "../types/TabNavigatorProps";

export const TabNavigator = ({
  activeTab,
  setActiveTab,
  children,
}: TabNavigatorProps) => (
  <Tabs.Root value={activeTab} onValueChange={(value) => setActiveTab(value)}>
    {children}
  </Tabs.Root>
);
