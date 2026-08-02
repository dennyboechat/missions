// Multivariate Dependencies
import { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Serif } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { AppUserProvider } from "./lib/AppUserContext";
import { ProjectProvider } from "./lib/ProjectContext";
import { PopupMessageProvider } from "./lib/PopupMessage";

// Components
import { HeaderPanel } from "./components/header/headerPanel";
import { PopupMessage } from "./components/ui/PopupMessage";

// Styles
import { Theme } from "@radix-ui/themes";
// globals.css pulls in the design tokens and the Radix bridge, both of which
// override Radix's own scales at equal specificity. It has to stay last.
import "@radix-ui/themes/styles.css";
import "./styles/globals.css";

export const metadata: Metadata = {
  title: "Missions",
  description: "Developed by and for missionaries",
};

/* IBM Plex, self-hosted through next/font: Serif for display lines because the
   wordmark is a serif, Sans for the UI because its 1/l/I and 0/O cannot be
   confused when a dose is read off a laptop in bad light, Mono for every
   measurement so columns of numbers line up. A clinic on a dropped connection
   should never be waiting on a font CDN. */
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  // The variable cut carries the whole 100-700 axis, which is what makes the
  // system's 450 body weight available at all.
  weight: "variable",
  variable: "--font-plex-sans",
  display: "swap",
});

const plexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-serif",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${plexSans.variable} ${plexSerif.variable} ${plexMono.variable}`}
      >
        <head>
          <link rel="icon" type="image/png" href="/image/logo_fav.png" />
        </head>
        <body>
          {/* The accent scale is re-pointed at the sky ramp in
              styles/radix-bridge.css; cyan is named here so the theme reads
              honestly in devtools. Scaling stays at 100% because the system
              specifies its sizes in pixels. */}
          <Theme
            accentColor="cyan"
            grayColor="slate"
            radius="medium"
            scaling="100%"
          >
            <AppUserProvider>
              <ProjectProvider>
                <PopupMessageProvider>
                  <HeaderPanel />
                  {children}
                  <PopupMessage />
                </PopupMessageProvider>
              </ProjectProvider>
            </AppUserProvider>
          </Theme>
        </body>
      </html>
    </ClerkProvider>
  );
}
