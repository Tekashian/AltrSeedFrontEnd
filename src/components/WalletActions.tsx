// src/components/WalletActions.tsx
'use client';

import React, { useState } from 'react';
import {
  useAppKitAccount,
  useAppKitProvider,
  useAppKitNetworkCore,
  type Provider,
} from '@reown/appkit/react';
import {
  BrowserProvider,
  JsonRpcSigner,
  formatEther,
  parseUnits,
} from 'ethers';

export default function WalletActions() {
  // 1) Hooki AppKit
  const { address, isConnected } = useAppKitAccount();
  const { chainId }          = useAppKitNetworkCore();
  const { walletProvider }   = useAppKitProvider<Provider>('eip155');

  // 2) Lokalne stany do wyświetlania rezultatów
  const [balance, setBalance]       = useState<string | null>(null);
  const [signature, setSignature]   = useState<string | null>(null);
  const [txHash, setTxHash]         = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);

  // 3) Pobranie salda
  const handleGetBalance = async () => {
    setError(null);
    if (!address) {
      setError('Brak adresu portfela');
      return;
    }
    try {
      const provider = new BrowserProvider(walletProvider, chainId);
      const bal       = await provider.getBalance(address);
      const eth       = formatEther(bal);
      setBalance(`${eth} ETH`);
    } catch (e: any) {
      setError(`Błąd pobierania salda: ${e.message}`);
    }
  };

  // 4) Podpisanie wiadomości
  const handleSignMsg = async () => {
    setError(null);
    if (!address) {
      setError('Brak adresu portfela');
      return;
    }
    try {
      const provider = new BrowserProvider(walletProvider, chainId);
      const signer   = new JsonRpcSigner(provider, address);
      const sig      = await signer.signMessage('Hello Reown AppKit!');
      setSignature(sig);
    } catch (e: any) {
      setError(`Błąd podpisu wiadomości: ${e.message}`);
    }
  };

  // 5) Wysłanie transakcji
  const TEST_TX = {
    to:    '0xd8da6bf26964af9d7eed9e03e53415d37aa96045' as `0x${string}`, // Vitalik
    value: parseUnits('0.0001', 'gwei'),
  };

  const handleSendTx = async () => {
    setError(null);
    if (!address) {
      setError('Brak adresu portfela');
      return;
    }
    try {
      const provider = new BrowserProvider(walletProvider, chainId);
      const signer   = new JsonRpcSigner(provider, address);
      const tx       = await signer.sendTransaction(TEST_TX);
      setTxHash(tx.hash);
    } catch (e: any) {
      setError(`Błąd wysyłania transakcji: ${e.message}`);
    }
  };

  // 6) Renderowanie
  if (!isConnected) {
    return <p>Połącz portfel, aby zobaczyć przyciski.</p>;
  }

  return (
    <div className="space-y-4 p-4 bg-white rounded shadow">
      <button
        onClick={handleGetBalance}
        className="px-4 py-2 bg-teal-500 text-white rounded"
      >
        Get Balance
      </button>
      {balance && <p>Saldo: {balance}</p>}

      <button
        onClick={handleSignMsg}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Sign Message
      </button>
      {signature && (
        <div>
          <p>Signature:</p>
          <code className="block break-all text-xs">{signature}</code>
        </div>
      )}

      <button
        onClick={handleSendTx}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Send Transaction
      </button>
      {txHash && (
        <div>
          <p>Tx Hash:</p>
          <code className="block break-all text-xs">{txHash}</code>
        </div>
      )}

      {error && <p className="text-red-600">Error: {error}</p>}
    </div>
  );
}
