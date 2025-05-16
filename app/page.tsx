"use client";

import { useAccount } from "wagmi";
import React from 'react';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <main className="min-h-screen px-8 py-0 pb-12 flex flex-col items-center">
    
    
    </main>
  );
}