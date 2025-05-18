// src/app/page.tsx (lub inna strona)
"use client"; // Komponenty używające hooków muszą być komponentami klienckimi

import React from 'react';
import { CampaignCard } from '../components/CampaingCard'; // Upewnij się, że ścieżka jest poprawna
import { useGetAllCampaigns, type Campaign } from '../hooks/useCrowdfund'; // Upewnij się, że ścieżka jest poprawna

export default function HomePage() {
  const { campaigns, isLoading, error, refetchCampaigns } = useGetAllCampaigns();

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-lg text-gray-600">Ładowanie kampanii z blockchaina...</p>
        {/* Możesz dodać tu animację ładowania (spinner) */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        <p className="text-lg font-semibold">Wystąpił błąd podczas ładowania kampanii:</p>
        <p className="text-sm mt-2 bg-red-100 p-3 rounded-md">{error.message}</p>
        <button
          onClick={() => refetchCampaigns()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-lg text-gray-700">Nie znaleziono żadnych aktywnych kampanii.</p>
        {/* Możesz tu dodać przycisk do tworzenia nowej kampanii, jeśli masz taką funkcjonalność */}
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Kampanie Crowdfundingowe
        </h1>
        <button
          onClick={() => refetchCampaigns()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          title="Odśwież listę kampanii"
        >
          Odśwież
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {campaigns.map((campaign) => (
          // Używamy campaign.campaignId jako klucza, które nadaliśmy w hooku
          <CampaignCard key={campaign.campaignId} campaign={campaign} />
        ))}
      </div>
    </main>
  );
}