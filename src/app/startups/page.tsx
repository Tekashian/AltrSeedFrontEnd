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
    ? campaigns.filter((c: Campaign) => c.campaignType === 0)
    : []

  // Aplikujemy filtry
  const filteredCampaigns = startupCampaigns.filter((campaign: Campaign) => {
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
  const sortedCampaigns = [...filteredCampaigns].sort((a: Campaign, b: Campaign) => {
    switch (sortBy) {
      case 'oldest':
        return Number(a.creationTimestamp) - Number(b.creationTimestamp)
      case 'progress':
        const progressA = Number(a.raisedAmount) / Number(a.targetAmount)
        const progressB = Number(b.raisedAmount) / Number(b.targetAmount)
        return progressB - progressA
      case 'amount':
        return Number(b.targetAmount) - Number(a.targetAmount)
      case 'newest':
      default:
        return Number(b.creationTimestamp) - Number(a.creationTimestamp)
    }
  })

  // Statystyki
  const totalCampaigns = startupCampaigns.length
  const activeCampaigns = startupCampaigns.filter((c: Campaign) => c.status === 0).length
  const successfulCampaigns = startupCampaigns.filter((c: Campaign) => c.status === 1).length
  const totalRaised = startupCampaigns.reduce((sum: number, c: Campaign) => sum + Number(c.raisedAmount), 0)

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 py-20">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
              Startup Campaigns
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 max-w-3xl mx-auto mb-8">
              Support innovative startups and be part of the next big breakthrough in technology and business.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold text-white">{totalCampaigns}</div>
                <div className="text-orange-200 text-sm">Total Startups</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold text-white">{activeCampaigns}</div>
                <div className="text-orange-200 text-sm">Active Now</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold text-white">{successfulCampaigns}</div>
                <div className="text-orange-200 text-sm">Successful</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold text-white">{(totalRaised / 1000000).toFixed(1)}M</div>
                <div className="text-orange-200 text-sm">USDC Raised</div>
              </div>
            </div>
          </div>
          
          {/* Animated Background */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              
              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: 'All Startups', count: totalCampaigns },
                  { key: 'active', label: 'Active', count: activeCampaigns },
                  { key: 'successful', label: 'Successful', count: successfulCampaigns },
                  { key: 'failed', label: 'Failed', count: startupCampaigns.filter((c: Campaign) => c.status === 5).length }
                ].map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key as any)}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${
                      filter === key
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-700'
                    }`}
                  >
                    {label} ({count})
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-3">
                <span className="text-gray-700 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="progress">Most Progress</option>
                  <option value="amount">Highest Target</option>
                </select>
                
                <button
                  onClick={() => refetchCampaigns()}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading startup campaigns...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-300 rounded-2xl p-6 text-red-700 mb-8">
              <div className="flex items-center">
                <span className="text-2xl mr-3">❌</span>
                <div>
                  <p className="font-semibold">Error loading campaigns</p>
                  <p className="text-sm">{(error as Error).message}</p>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !error && sortedCampaigns.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-lg border border-white/20 max-w-md mx-auto">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🚀</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">No Startups Found</h3>
                <p className="text-gray-600 mb-8">
                  {filter === 'all' 
                    ? "No startup campaigns available yet. Be the first to create one!"
                    : `No ${filter} startup campaigns found. Try a different filter.`}
                </p>
                <button
                  onClick={() => setFilter('all')}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-full font-bold hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105"
                >
                  View All Campaigns
                </button>
              </div>
            </div>
          )}

          {!isLoading && !error && sortedCampaigns.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedCampaigns.map((campaign: Campaign) => (
                <div key={campaign.campaignId} className="transform hover:scale-105 transition-transform duration-200">
                  <CampaignCard campaign={campaign} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}