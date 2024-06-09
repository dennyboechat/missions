// Multivariate Dependencies
import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs'

// Components
import { HeaderPanel } from './components/header/HeaderPanel';

// Styles
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import './styles/globals.css';

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
            <HeaderPanel />
            {children}
          </Theme>
        </body>
      </html>
    </ClerkProvider>
  );
}
