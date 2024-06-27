// Components
import { Grid, Box, Text } from "@radix-ui/themes";
import { Sidebar, Menu } from "react-pro-sidebar";

// Types
import { SideMenuLayoutProps } from "../types/SideMenuLayoutProps";

// Styles
import styles from "../styles/SideMenuLayout.module.css";

// Hooks
import { useEffect, useState } from "react";
import { useMounted } from "@/app/lib/useMounted";

export const SideMenuLayout = ({
  menuItems,
  header,
  children,
}: SideMenuLayoutProps) => {
  const mounted = useMounted();
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

  if (!mounted) return null;

  return (
    <Grid columns="auto 1fr" gapX="20px">
      <Sidebar
        width="200px"
        collapsed={collapsed}
        className={styles.sidebar}
        backgroundColor="#fff"
      >
        <Box width="200px" height="70px" className={styles.header}>
          <Text className={styles.header_text}>{header}</Text>
        </Box>
        <Menu>{menuItems}</Menu>
      </Sidebar>
      {children}
    </Grid>
  );
};
