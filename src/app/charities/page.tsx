'use client';

import React, { useEffect } from 'react';
import { useGetAllCampaigns, type Campaign } from '../../hooks/useCrowdfund';
import CampaignCard from '../../components/CampaignCard';

export default function CharitiesPage() {
  const { campaigns, isLoading, error, refetchCampaigns } = useGetAllCampaigns();

  // Gdy jeszcze nie mamy danych, odświeżamy
  useEffect(() => {
    if (!campaigns) refetchCampaigns();
  }, [campaigns, refetchCampaigns]);

  // Filtrujemy tylko charytatywne
  const charityCampaigns: Campaign[] = Array.isArray(campaigns)
    ? campaigns.filter(c => c.campaignType === 1)
    : [];

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Charities</h1>

      {isLoading && <p className="text-lg text-slate-500">Ładowanie kampanii…</p>}
      {error && <p className="text-lg text-red-500">Błąd: {(error as Error).message}</p>}

      {!isLoading && !error && charityCampaigns.length === 0 && (
        <p className="text-lg text-slate-500">Brak zbiórek typu „Charity”.</p>
      )}

      {!isLoading && !error && charityCampaigns.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {charityCampaigns.map(c => (
            <CampaignCard
              key={c.campaignId}
              campaign={c}
            />
          ))}
        </div>
      )}
    </main>
  );
}
