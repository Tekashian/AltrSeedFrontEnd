// src/app/layout.tsx

// Upewnij się, że problem z czcionkami Geist jest rozwiązany (zainstalowane lub usunięte importy).
// Jeśli usunąłeś Geist, usuń też poniższe importy i klasy z tagu <html>.
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import "./globals.css";
import ContextProvider from "../context"; // Oczekuje default export z src/context/index.tsx
// Poprawiony import dla Header, aby pasował do 'export default Header'
import Header from '../components/Header';   // Oczekuje default export 'Header' z src/components/Header.tsx
import React from "react";

export const metadata = {
  title: "AltrSeed Crowdfunding",
  description: "Zdecentralizowana platforma crowdfundingowa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Jeśli usunąłeś Geist, usuń też klasy poniżej
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <ContextProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            {/* <Footer /> */}
          </div>
        </ContextProvider>
      </body>
    </html>
  );
}
