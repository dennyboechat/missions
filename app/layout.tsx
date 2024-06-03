import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs'

// Components
import { HeaderPanel } from './components/header/header-panel';

// Styles
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
          <HeaderPanel />
          {children}
        </body>
      </html>
    </ClerkProvider >
  );
}
