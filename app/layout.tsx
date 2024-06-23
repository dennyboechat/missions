// Multivariate Dependencies
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { ClerkProvider } from "@clerk/nextjs";
import { ProjectProvider } from "./lib/ProjectContext";
import { PopupMessageProvider } from "./lib/PopupMessage";

// Components
import { HeaderPanel } from "./components/header/headerPanel";
import { PopupMessage } from "./components/ui/PopupMessage";

// Styles
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "./styles/globals.css";

export const metadata: Metadata = {
  title: "Missions",
  description: "Developed by and for missionaries",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <Theme>
            <ProjectProvider>
              <PopupMessageProvider>
                <HeaderPanel />
                {children}
                <PopupMessage />
              </PopupMessageProvider>
            </ProjectProvider>
            <Analytics />
          </Theme>
        </body>
      </html>
    </ClerkProvider>
  );
}
