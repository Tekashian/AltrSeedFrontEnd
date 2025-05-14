// context/index.tsx
'use client'

import { wagmiAdapter, projectId } from "@/config"
import { createAppKit } from "@reown/appkit"
import { mainnet, arbitrum, sepolia } from '@reown/appkit/networks'

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi"

const queryClient = new QueryClient()

if(!projectId){
    throw new Error('Project Id is not defined.')
}

const metadata = {
  name: "altr-seed",
  description: "AltrSeed - EVM",
  url: typeof window !== 'undefined' ? window.location.origin : "https://exampleapp.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"]
}

const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [sepolia],
  defaultNetwork: mainnet,
  metadata,
  features: {
    analytics: true,
    email: true,
    socials: ['google', 'x', 'github', 'discord', 'farcaster'],
    emailShowWallets: true
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#68CC9C',
    '--w3m-color-mix': '#68CC9C', // Ta zmienna również powinna być sprawdzona w dokumentacji Reown, czy jest wspierana
    '--w3m-color-mix-strength': 40, // Podobnie jak wyżej
    '--w3m-border-radius-master': '4px',
    // Zakomentowano potencjalnie nieobsługiwane zmienne:
    // '--w3m-text-inverses': '#FFFFFF', // BŁĄD: Ta zmienna nie jest rozpoznawana przez Twój typ ThemeVariables
    // '--w3m-on-accent-color': '#FFFFFF', // Sprawdź dokumentację Reown AppKit dla poprawnej zmiennej koloru tekstu
    // '--w3m-button-text-color': '#FFFFFF', // Jeśli potrzebujesz zmienić kolor tekstu na przycisku, znajdź właściwą zmienną w dokumentacji Reown
  }
})


function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

export default ContextProvider