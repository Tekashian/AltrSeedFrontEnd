// src/app/create-campaign/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useWriteContract, usePublicClient } from 'wagmi';
import { parseUnits } from 'viem';
import { CROWDFUND_ABI } from '../../blockchain/crowdfundAbi';
import { crowdfundContractConfig } from '../../blockchain/contracts';

const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';

export default function CreateCampaignPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  // Stan formularza
  const [campaignType, setCampaignType] = useState<'startup' | 'charity'>('charity');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [acceptedToken, setAcceptedToken] = useState(USDC_ADDRESS);
  const [endTime, setEndTime] = useState('');           // format "YYYY-MM-DDThh:mm"
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(''); // Data URL dla podglądu
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Podgląd obrazka: tworzymy URL tylko gdy plik został wybrany
  useEffect(() => {
    if (!imageFile) {
      setImagePreview('');
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1) WALIDACJA: czy wszystkie pola wypełnione?
    if (!title.trim() || !description.trim() || !endTime.trim() || !targetAmount.trim()) {
      setError('Wypełnij wszystkie wymagane pola.');
      return;
    }

    // 2) PARSOWANIE KWOTY do BigInt (USDC ma 6 miejsc po przecinku)
    let amountBI: bigint;
    try {
      amountBI = parseUnits(targetAmount, 6);
      if (amountBI <= BigInt(0)) throw new Error();
    } catch {
      setError('Podaj prawidłową kwotę (np. 500.00).');
      return;
    }

    // 3) PARSOWANIE DATY zakończenia:
    //    Dodajemy 5 minut bufora, żeby endTime nie wypadł natychmiast w przeszłość
    let ts: bigint;
    try {
      const ms = new Date(endTime).getTime();            // Pobierz w milisekundach
      const bufferedMs = ms + 5 * 60 * 1000;             // Dodaj 5 minut (300 000 ms)
      ts = BigInt(Math.floor(bufferedMs / 1000));        // Zamień na sekundy
      if (ts <= BigInt(Math.floor(Date.now() / 1000))) throw new Error();
    } catch {
      setError('Data zakończenia musi być w przyszłości (dodaj co najmniej 5 minut marginesu).');
      return;
    }

    // 4) Czy portfel podłączony?
    if (!address) {
      setError('Podłącz portfel, aby utworzyć kampanię.');
      return;
    }

    setSubmitting(true);
    setTxHash(null);

    try {
      // -----------------------------------------
      // A) Upload obrazka (opcjonalnie)
      // -----------------------------------------
      let rawImageCID: any = '';
      if (imageFile) {
        const form = new FormData();
        form.append('file', imageFile);
        const res = await fetch('/api/upload', { method: 'POST', body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Błąd uploadu pliku');
        rawImageCID = data.cid;
        console.log('🔍 rawImageCID from /api/upload:', rawImageCID);
      }

      // -----------------------------------------
      // B) Wydobycie CID jako string
      // -----------------------------------------
      const cidString =
        typeof rawImageCID === 'object' && rawImageCID['/']
          ? rawImageCID['/']
          : String(rawImageCID);
      console.log('🔍 resolved cidString:', cidString);

      // -----------------------------------------
      // C) Przygotowanie i upload metadanych JSON
      // -----------------------------------------
      const metadata = {
        title: title.trim(),
        description: description.trim(),
        // jeżeli jest obrazek, to umieśćmy link do IPFS
        image: cidString ? `https://ipfs.io/ipfs/${cidString}` : '',
      };
      console.log('🔍 metadata object:', metadata);

      const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
      const file = new File([blob], 'metadata.json', { type: 'application/json' });
      const fm = new FormData();
      fm.append('file', file);
      const mr = await fetch('/api/upload', { method: 'POST', body: fm });
      const md = await mr.json();
      if (!mr.ok) throw new Error(md.error || 'Błąd uploadu metadanych');
      const metadataCID =
        typeof md.cid === 'object' && md.cid['/'] ? md.cid['/'] : String(md.cid);
      console.log('🔍 metadataCID from /api/upload:', metadataCID);

      // -----------------------------------------
      // D) Wywołanie createCampaign(...) na kontrakcie z prawidłowym metadataCID
      // -----------------------------------------
      const args = [
        campaignType === 'startup' ? 0 : 1,
        acceptedToken,
        amountBI,
        metadataCID,
        ts,
      ] as const;
      console.log('🔍 createCampaign args:', args);

      // Wyślij transakcję i pobierz hash
      const hash = await writeContractAsync({
        address: crowdfundContractConfig.address,
        abi: CROWDFUND_ABI,
        functionName: 'createCampaign',
        args,
      });
      console.log('🔍 transaction hash:', hash);
      setTxHash(hash);

      // Czekaj na potwierdzenie na blockchainie
      await publicClient.waitForTransactionReceipt({ hash });

      // 8) Przekierowanie po potwierdzeniu
      router.push('/');
    } catch (err: any) {
      console.error('❌ handleSubmit error:', err);
      setError(err.message || 'Błąd w trakcie tworzenia kampanii.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#E0F0FF] py-12 px-4">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Formularz */}
        <div className="w-full lg:w-1/2">
          <h1 className="text-3xl font-bold text-[#1F4E79] mb-6 text-center">
            Utwórz zbiórkę
          </h1>
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg p-6 shadow-xl border border-gray-200 space-y-6"
          >
            {/* Typ zbiórki */}
            <div>
              <label className="block font-medium text-black mb-1">
                Typ zbiórki
              </label>
              <select
                className="w-full border border-gray-300 rounded p-2 text-black"
                value={campaignType}
                onChange={(e) => setCampaignType(e.target.value as 'startup' | 'charity')}
              >
                <option value="startup">Startup</option>
                <option value="charity">Charytatywna</option>
              </select>
            </div>

            {/* Tytuł */}
            <div>
              <label className="block font-medium text-black mb-1">
                Tytuł zbiórki
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded p-2 text-black"
                placeholder="Krótki tytuł kampanii"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Opis */}
            <div>
              <label className="block font-medium text-black mb-1">
                Opis
              </label>
              <textarea
                className="w-full border border-gray-300 rounded p-2 h-32 text-black"
                placeholder="Tutaj wpisz opis..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Kwota */}
            <div>
              <label className="block font-medium text-black mb-1">
                Kwota (USDC)
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full border border-gray-300 rounded p-2 text-black"
                placeholder="np. 500.00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
              />
            </div>

            {/* Token */}
            <div>
              <label className="block font-medium text-black mb-1">
                Akceptowany token
              </label>
              <select
                className="w-full border border-gray-300 rounded p-2 text-black"
                value={acceptedToken}
                onChange={(e) => setAcceptedToken(e.target.value)}
              >
                <option value={USDC_ADDRESS}>USDC (Sepolia)</option>
              </select>
            </div>

            {/* Data zakończenia */}
            <div>
              <label className="block font-medium text-black mb-1">
                Data zakończenia
              </label>
              <input
                type="datetime-local"
                className="w-full border border-gray-300 rounded p-2 text-black"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>

            {/* Upload obrazka */}
            <div>
              <label className="block font-medium text-black mb-1">
                Zdjęcie (opcjonalne)
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full text-black"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
            </div>

            {error && <div className="text-red-600">{error}</div>}

            {txHash && (
              <p className="text-sm text-[#1F4E79]">
                TX:{' '}
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {txHash.slice(0, 10)}…
                </a>
              </p>
            )}

            {/* Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border rounded text-black"
              >
                Anuluj
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`px-6 py-3 rounded text-white ${
                  submitting ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {submitting ? 'Tworzę…' : 'Utwórz zbiórkę'}
              </button>
            </div>
          </form>
        </div>

        {/* Podgląd karty */}
        <div className="w-full lg:w-1/2 bg-white rounded-lg p-6 shadow-xl border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Podgląd karty
          </h2>
          <div className="border rounded-lg overflow-hidden">
            <div className="w-full h-48 bg-gray-100">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Podgląd"
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Brak zdjęcia
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-xl font-bold text-[#1F4E79] mb-2">
                {title || 'Tytuł kampanii'}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {description || 'Opis pojawi się tutaj.'}
              </p>
              <div className="text-sm text-gray-700 mb-1">
                <strong>Typ:</strong>{' '}
                {campaignType === 'startup' ? 'Startup' : 'Charytatywna'}
              </div>
              <div className="text-sm text-gray-700 mb-1">
                <strong>Kwota:</strong> {targetAmount || '0.00'} USDC
              </div>
              <div className="text-sm text-gray-700">
                <strong>Zakończenie:</strong>{' '}
                {endTime ? new Date(endTime).toLocaleString('pl-PL') : '—'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
