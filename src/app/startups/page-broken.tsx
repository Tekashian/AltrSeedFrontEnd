// src/app/startups/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useGetAllCampaigns, type Campaign } from '../../hooks/useCrowdfund'
import CampaignCard from '../../components/CampaignCard'
import Footer from '../../components/Footer'

export default function StartupsPage() {
  const { campaigns, isLoading, error, refetchCampaigns } = useGetAllCampaigns()
  const [filter, setFilter] = useState<'all' | 'active' | 'successful' | 'failed'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'progress' | 'amount'>('newest')

  // Jeśli jeszcze nie pobraliśmy, wywołaj refetch
  useEffect(() => {
    if (!campaigns) {
      refetchCampaigns()
    }
  }, [campaigns, refetchCampaigns])

  // Filtrujemy kampanie typu Startup (0)
  const startupCampaigns: Campaign[] = Array.isArray(campaigns)
    ? campaigns.filter(c => c.campaignType === 0)
    : []

  // Aplikujemy filtry
  const filteredCampaigns = startupCampaigns.filter(campaign => {
    switch (filter) {
      case 'active':
        return campaign.status === 0
      case 'successful':
        return campaign.status === 1
      case 'failed':
        return campaign.status === 5
      default:
        return true
    }
  })

  // Sortowanie
  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return Number(a.creationTimestamp) - Number(b.creationTimestamp)
      case 'progress':
        const progA = Number(a.raisedAmount) / Number(a.targetAmount)
        const progB = Number(b.raisedAmount) / Number(b.targetAmount)
        return progB - progA
      case 'amount':
        return Number(b.targetAmount) - Number(a.targetAmount)
      default: // newest
        return Number(b.creationTimestamp) - Number(a.creationTimestamp)
    }
  })

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0: return 'Aktywna'
      case 1: return 'Sfinansowana'
      case 2: return 'Zamykana'
      case 5: return 'Nieudana'
      default: return 'Nieznany'
    }
  }

  const stats = {
    total: startupCampaigns.length,
    active: startupCampaigns.filter(c => c.status === 0).length,
    successful: startupCampaigns.filter(c => c.status === 1).length,
    failed: startupCampaigns.filter(c => c.status === 5).length,
    totalRaised: startupCampaigns.reduce((sum, c) => sum + Number(c.raisedAmount), 0) / 1e6,
  }

  return (
    <>
      <main className="min-h-screen py-8 px-4 bg-[#E0F0FF]">
        <div className="container mx-auto max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#1F4E79] mb-4">
              Kampanie Startupowe
            </h1>
            <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
              Inwestuj w przyszłość i wspieraj innowacyjne projekty. Każda wpłata to inwestycja 
              w przedsiębiorczość zabezpieczona przez blockchain.
            </p>
            
            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-[#1F4E79]">{stats.total}</div>
                <div className="text-sm text-gray-600">Wszystkich startupów</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                <div className="text-sm text-gray-600">Aktywnych</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-blue-600">{stats.successful}</div>
                <div className="text-sm text-gray-600">Sfinansowanych</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                <div className="text-sm text-gray-600">Nieudanych</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-[#00ADEF]">{stats.totalRaised.toFixed(0)}</div>
                <div className="text-sm text-gray-600">USDC zainwestowane</div>
              </div>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4">
                <label className="font-semibold text-[#1F4E79]">Filtruj według stanu:</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="border border-gray-300 rounded px-3 py-1 text-black"
                >
                  <option value="all">Wszystkie</option>
                  <option value="active">Aktywne</option>
                  <option value="successful">Sfinansowane</option>
                  <option value="failed">Nieudane</option>
                </select>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4">
                <label className="font-semibold text-[#1F4E79]">Sortuj według:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-300 rounded px-3 py-1 text-black"
                >
                  <option value="newest">Najnowsze</option>
                  <option value="oldest">Najstarsze</option>
                  <option value="progress">Postęp finansowania</option>
                  <option value="amount">Kwota celu</option>
                </select>
              </div>

              <button
                onClick={() => refetchCampaigns()}
                className="px-4 py-2 bg-[#68CC89] text-white rounded-lg hover:bg-[#5BBE7A] transition"
                disabled={isLoading}
              >
                {isLoading ? 'Ładowanie...' : 'Odśwież'}
              </button>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              Pokazano {sortedCampaigns.length} z {startupCampaigns.length} startupów
            </div>
          </div>

          {/* Content */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F4E79] mx-auto mb-4"></div>
              <p className="text-lg text-[#1F4E79]">Ładowanie startupów...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-lg text-red-600">
                Błąd: {(error as Error).message}
              </p>
              <button
                onClick={() => refetchCampaigns()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Spróbuj ponownie
              </button>
            </div>
          )}

          {!isLoading && !error && sortedCampaigns.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-lg text-yellow-800">
                {filter === 'all' 
                  ? 'Brak kampanii startupowych.'
                  : `Brak startupów o statusie "${filter === 'active' ? 'aktywne' : filter === 'successful' ? 'sfinansowane' : 'nieudane'}".`
                }
              </p>
            </div>
          )}

          {!isLoading && !error && sortedCampaigns.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedCampaigns.map(c => (
                <div key={c.campaignId} className="relative">
                  <CampaignCard campaign={c} />
                  <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-medium">
                    {getStatusLabel(c.status)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-16 bg-gradient-to-r from-[#1F4E79] to-[#00ADEF] rounded-lg p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Masz innowacyjny pomysł na startup?</h2>
            <p className="mb-6 text-lg opacity-90">
              Stwórz kampanię crowdfundingową i pozyskaj środki na rozwój swojego projektu
            </p>
            <a
              href="/create-campaign"
              className="inline-block px-8 py-3 bg-white text-[#1F4E79] font-semibold rounded-lg hover:bg-gray-100 transition"
            >
              Rozpocznij finansowanie
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
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
