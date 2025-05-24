// src/app/startups/page.tsx
'use client'

import React, { useEffect } from 'react'
import { useGetAllCampaigns, type Campaign } from '../../hooks/useCrowdfund'
import CampaignCard from '../../components/CampaignCard'

export default function StartupsPage() {
  const { campaigns, isLoading, error, refetchCampaigns } = useGetAllCampaigns()

  // Jeśli jeszcze nie pobraliśmy, wywołaj refetch
  useEffect(() => {
    if (!campaigns) {
      refetchCampaigns()
    }
  }, [campaigns, refetchCampaigns])

  // Filtrujemy kampanie typu Startup (0) i sortujemy malejąco po campaignId
  const startupCampaigns: Campaign[] = Array.isArray(campaigns)
    ? campaigns
        .filter(c => c.campaignType === 0)
        .sort((a, b) => (b.campaignId! - a.campaignId!))
    : []

  return (
    <main
      className="min-h-screen py-8 px-4"
      style={{ backgroundColor: '#E0F0FF' }}
    >
      <div className="container mx-auto">
        {/* Nagłówek i przycisk odświeżania */}
        <div className="flex justify-between items-center mb-6">
          <h1
            className="text-3xl font-bold"
            style={{ color: '#1F4E79' }}
          >
            Startups
          </h1>
          <button
            onClick={() => refetchCampaigns()}
            className="px-4 py-2 rounded"
            style={{ backgroundColor: '#68CC89', color: '#FFFFFF' }}
          >
            Odśwież
          </button>
        </div>

        {/* Stany ładowania / błąd */}
        {isLoading && (
          <p className="text-lg" style={{ color: '#1F4E79' }}>
            Ładowanie kampanii…
          </p>
        )}
        {error && (
          <p className="text-lg" style={{ color: '#FF6B6B' }}>
            Błąd: {(error as Error).message}
          </p>
        )}

        {/* Brak kampanii */}
        {!isLoading && !error && startupCampaigns.length === 0 && (
          <p className="text-lg" style={{ color: '#1F4E79' }}>
            Brak zbiórek typu „Startup”.
          </p>
        )}

        {/* Lista kart */}
        {!isLoading && !error && startupCampaigns.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {startupCampaigns.map(c => (
              <CampaignCard
                key={c.campaignId}
                campaign={c}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
