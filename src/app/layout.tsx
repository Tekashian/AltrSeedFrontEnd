import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { headers } from "next/headers";
import ContextProvider from "@/src/context";
import Header from '../components/Header'; // Import the Header component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AltrSeed.io",
  description: "Powered by Reown",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const cookies = headersList.get('cookie');

  return (
    <html lang="en">
      <body className={inter.className}>
        <ContextProvider cookies={cookies}>
          <Header /> {/* Include the Header component */}
          <main className="min-h-screen px-8 py-0 pb-12 flex flex-col items-center">
            {children}
          </main>
        </ContextProvider>
      </body>
    </html>
  );
}