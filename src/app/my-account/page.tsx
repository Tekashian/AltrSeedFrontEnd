'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  useAppKitAccount,
  useAppKitNetworkCore,
  useAppKitProvider,
  type Provider
} from '@reown/appkit/react'
import { BrowserProvider, Contract, formatEther } from 'ethers'
import { useReadContract } from 'wagmi'

import { getWeb3StorageClient } from '../../lib/web3storage'

import {
  crowdfundContractConfig,
  usdcContractConfig
} from '../../blockchain/contracts'
import { Campaign } from '../../hooks/useCrowdfund'
import MyCampaignCard from '../../components/MyCampaignCard'
import MyDonationCard from '../../components/MyDonationCard'

import { CROWDFUND_ABI } from '../../blockchain/crowdfundAbi'

export default function MyAccountPage() {
  const router = useRouter()
  const { address, isConnected } = useAppKitAccount()
  const { chainId }              = useAppKitNetworkCore()
  const { walletProvider }       = useAppKitProvider<Provider>('eip155')

  // Stany lokalne: salda
  const [ethBalance,  setEthBalance ] = useState<string>('0')
  const [usdcBalance, setUsdcBalance] = useState<string>('0')

  // Logi zdarzeń z blockchain (darowizny, tworzenie kampanii)
  const [donations, setDonations] = useState<any[]>([])
  const [creations, setCreations] = useState<any[]>([])

  // Mapa stanu „czy darczyńca już odebrał zwrot" (hasReclaimed)
  const [hasReclaimedMap, setHasReclaimedMap] = useState<Record<number, boolean>>({})

  // Wybrana karta („Zakładka") w widoku kampanii
  const [selectedTab, setSelectedTab] = useState<
    'active' | 'completed' | 'closing' | 'failed' | 'donated'
  >('active')

  // Wybrana karta w sekcji historii: „donations" lub „creations"
  const [selectedHistoryTab, setSelectedHistoryTab] = useState<'donations' | 'creations'>('donations')

  // Paginacja: ile elementów historii pokazać
  const [visibleDonationsCount, setVisibleDonationsCount] = useState<number>(5)
  const [visibleCreationsCount, setVisibleCreationsCount] = useState<number>(5)

  // --- Pobranie wszystkich kampanii z kontraktu ---
  const {
    data: allCampaignsRaw,
    isLoading: campaignsLoading,
    refetch: refetchCampaigns
  } = useReadContract({
    address:       crowdfundContractConfig.address,
    abi:           crowdfundContractConfig.abi,
    functionName:  'getAllCampaigns',
    chainId: chainId ? Number(chainId) : undefined
  })

  // Zamieniamy „surówkę" na tablicę obiektów typu Campaign, nadając campaignId = index
  const allCampaigns: Campaign[] | undefined = allCampaignsRaw?.map(
    (c: any, i: number) => ({ ...c, campaignId: i })
  )

  // Filtrujemy „moje kampanie" – tylko te, których creator to mój address
  const myCampaigns = useMemo(() => {
    if (!allCampaigns || !address) return []
    return allCampaigns.filter(
      c => c.creator.toLowerCase() === address.toLowerCase()
    )
  }, [allCampaigns, address])

  // Rozdzielamy „moje kampanie" na tablice wg stanów:
  // 0 = Active, 1 = Completed, 2 = Closing, 5 = Failed
  const activeCampaigns = useMemo(() =>
    myCampaigns
      .filter(c => c.status === 0)
      .sort((a, b) => {
        const progA = Number(a.raisedAmount) / Number(a.targetAmount)
        const progB = Number(b.raisedAmount) / Number(b.targetAmount)
        if (progB !== progA) return progB - progA
        return Number(a.creationTimestamp) - Number(b.creationTimestamp)
      }),
  [myCampaigns])

  const completedCampaigns = useMemo(() =>
    myCampaigns
      .filter(c => c.status === 1)
      .sort((a, b) => {
        const progA = Number(a.raisedAmount) / Number(a.targetAmount)
        const progB = Number(b.raisedAmount) / Number(b.targetAmount)
        if (progB !== progA) return progB - progA
        return Number(a.creationTimestamp) - Number(b.creationTimestamp)
      }),
  [myCampaigns])

  const closingCampaigns = useMemo(() =>
    myCampaigns
      .filter(c => c.status === 2)
      .sort((a, b) => {
        const progA = Number(a.raisedAmount) / Number(a.targetAmount)
        const progB = Number(b.raisedAmount) / Number(b.targetAmount)
        if (progB !== progA) return progB - progA
        return Number(a.creationTimestamp) - Number(b.creationTimestamp)
      }),
  [myCampaigns])

  const failedCampaigns = useMemo(() =>
    myCampaigns
      .filter(c => c.status === 5)
      .sort((a, b) => {
        const progA = Number(a.raisedAmount) / Number(a.targetAmount)
        const progB = Number(b.raisedAmount) / Number(b.targetAmount)
        if (progB !== progA) return progB - progA
        return Number(a.creationTimestamp) - Number(b.creationTimestamp)
      }),
  [myCampaigns])

  // Sumujemy wszystkie dotacje (amountToCampaign) dla każdego campaignId
  const donationTotals = useMemo(() => {
    const totals: Record<number, number> = {}
    donations.forEach(log => {
      const onChainId = Number(log.args!.campaignId)
      const id = onChainId - 1
      const amount = Number(log.args!.amountToCampaign)
      totals[id] = (totals[id] || 0) + amount
    })
    return totals
  }, [donations])

  // Kampanie, które ja wspierałem i jeszcze nie odebrałem refundu
  const donatedCampaigns = useMemo(() => {
    if (!allCampaigns) return []
    return Object.entries(donationTotals)
      .map(([idStr, total]) => {
        const id = Number(idStr)
        const campaign = allCampaigns[id]
        return { ...campaign, donatedAmount: total }
      })
      .filter(c =>
        c.donatedAmount > 0 &&
        c.status !== 2 && // nie pokazujemy tych w Closing
        c.status !== 5 && // nie pokazujemy tych w Failed
        !hasReclaimedMap[c.campaignId || 0]
      )
      .sort((a, b) => b.donatedAmount - a.donatedAmount)
  }, [allCampaigns, donationTotals, hasReclaimedMap])

  // --- Ładowanie sald i logów, gdy użytkownik zmienia portfel/lub mount ---
  useEffect(() => {
    if (!isConnected || !address || !walletProvider) return

    const init = async () => {
      const provider = new BrowserProvider(walletProvider, chainId)

      // 1. ETH balance
      const rawEth = await provider.getBalance(address)
      setEthBalance(formatEther(rawEth))

      // 2. USDC balance
      const usdc = new Contract(
        usdcContractConfig.address,
        usdcContractConfig.abi,
        provider
      )
      const rawUsdc  = await usdc.balanceOf(address)
      const decimals = await usdc.decimals()
      setUsdcBalance((Number(rawUsdc) / 10 ** Number(decimals)).toFixed(2))

      // 3. QueryFilter DonationReceived → wyświetlamy historię dotacji
      const cf = new Contract(
        crowdfundContractConfig.address,
        crowdfundContractConfig.abi,
        provider
      )
      const donLogs = await cf.queryFilter(cf.filters.DonationReceived(null, address))
      setDonations(donLogs.sort((x: any, y: any) => Number(y.args!.timestamp) - Number(x.args!.timestamp)))

      // 4. QueryFilter CampaignCreated → wyświetlamy historię tworzenia kampanii
      const crLogs = await cf.queryFilter(cf.filters.CampaignCreated(null, address))
      setCreations(crLogs.sort((x: any, y: any) => Number(y.args!.creationTimestamp) - Number(x.args!.creationTimestamp)))

      // 5. Sprawdzamy, czy już odebrałem refund (hasReclaimed) dla każdego ID, na które wpłaciłem
      const uniqueIds = Object.keys(donationTotals).map(id => Number(id))
      for (const id of uniqueIds) {
        try {
          const reclaimed: boolean = await cf.hasReclaimed(id + 1, address)
          setHasReclaimedMap(prev => ({ ...prev, [id]: reclaimed }))
        } catch {
          // ignorujemy ewentualne błędy
        }
      }
    }

    init().catch(console.error)
  }, [isConnected, address, chainId, walletProvider, donationTotals])

  // --- AKCJE: Inicjowanie zamknięcia, wypłata, żądanie refundu ---

  // 1) Inicjowanie zamknięcia kampanii (status → Closing)
  const initiateClosure = async (campaignId: number) => {
    if (!walletProvider) return
    try {
      alert('Rozpoczynam zamknięcie kampanii… Proszę potwierdzić transakcję w portfelu.')
      const provider = new BrowserProvider(walletProvider, chainId)
      const signer = await provider.getSigner()
      const cf = new Contract(
        crowdfundContractConfig.address,
        CROWDFUND_ABI,
        signer
      )
      const tx = await cf.initiateClosure(campaignId + 1)
      await tx.wait()
      alert('✅ Kampania została oznaczona jako „Zamykanie". Darczyńcy mają teraz 14 dni na zwroty.')
      refetchCampaigns()
    } catch (err: any) {
      console.error('Błąd initiateClosure:', err)
      alert('❌ Wystąpił błąd podczas zamykania kampanii:\n' + (err.message || err.toString()))
    }
  }

  // 2) Wypłata środków (+ usunięcie IPFS)
  const withdrawFunds = async (campaignId: number, dataCID: string) => {
    if (!walletProvider) return
    try {
      const campaign = allCampaigns![campaignId]
      const provider = new BrowserProvider(walletProvider, chainId)
      const signer = await provider.getSigner()
      const cf = new Contract(
        crowdfundContractConfig.address,
        CROWDFUND_ABI,
        signer
      )

      // A) Kampania Completed → withdrawFunds
      if (campaign.status === 1) {
        alert('Wypłacam środki z zakończonej kampanii… Proszę potwierdzić transakcję.')
        const tx = await cf.withdrawFunds(campaignId + 1)
        await tx.wait()
        alert('✅ Środki z zakończonej kampanii zostały wypłacone.')
      }
      // B) Kampania Closing → finalizeClosureAndWithdraw, ale tylko po upływie reclaimDeadline
      else if (campaign.status === 2) {
        const nowSec = Math.floor(Date.now() / 1000)
        const reclaimDeadline =
          typeof campaign.reclaimDeadline === 'bigint'
            ? Number(campaign.reclaimDeadline)
            : campaign.reclaimDeadline ?? 0

        if (nowSec < reclaimDeadline) {
          alert('⏳ Okres zwrotu jeszcze trwa do:\n' + new Date(reclaimDeadline * 1000).toLocaleString())
          return
        }
        alert('Kończę zamknięcie kampanii i wypłacam pozostałe środki… Proszę potwierdzić transakcję.')
        const tx = await cf.finalizeClosureAndWithdraw(campaignId + 1)
        await tx.wait()
        alert('✅ Środki po okresie zwrotu zostały wypłacone.')
      }
      // C) Kampania Failed → finalizeClosureAndWithdraw, jeśli zostało coś do wypłaty
      else if (campaign.status === 5 && Number(campaign.raisedAmount) > 0) {
        alert('Wypłacam pozostałe środki z nieudanej kampanii… Proszę potwierdzić transakcję.')
        const tx = await cf.finalizeClosureAndWithdraw(campaignId + 1)
        await tx.wait()
        alert('✅ Pozostałe środki z nieudanej kampanii zostały wypłacone.')
      }
      // Inne stany – nic do wypłacenia
      else {
        alert('ℹ️ Brak środków do wypłaty lub kampania nie jest w odpowiednim stanie.')
        return
      }

      // 3) Usunięcie plików z IPFS (web3.storage)
      alert('Usuwam metadane kampanii z web3.storage (IPFS)…')
      const client = getWeb3StorageClient()
      await client.delete(dataCID)
      alert('✅ Metadane zostały usunięte z web3.storage (może upłynąć chwilka, zanim rzeczywiście znikną).')

      refetchCampaigns()
    } catch (err: any) {
      console.error('Błąd withdrawFunds:', err)
      alert('❌ Wystąpił błąd podczas wypłacania środków:\n' + (err.message || err.toString()))
    }
  }

  // 3) Darczyńca żąda refundu (claimRefund)
  const claimRefund = async (campaignId: number) => {
    if (!walletProvider) return
    try {
      alert('Rozpoczynam zwrot wpłaconej kwoty… Proszę potwierdzić transakcję w portfelu.')
      const provider = new BrowserProvider(walletProvider, chainId)
      const signer = await provider.getSigner()
      const cf = new Contract(
        crowdfundContractConfig.address,
        CROWDFUND_ABI,
        signer
      )
      const tx = await cf.claimRefund(campaignId + 1)
      await tx.wait()
      alert('✅ Zwrot środków został pomyślnie wykonany.')
      refetchCampaigns()
      setHasReclaimedMap(prev => ({ ...prev, [campaignId]: true }))
    } catch (err: any) {
      console.error('Błąd claimRefund:', err)
      alert('❌ Wystąpił błąd podczas żądania zwrotu:\n' + (err.message || err.toString()))
    }
  }

  // Funkcja sprawdzająca czy portfel jest połączony
  if (!isConnected) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/20 max-w-md">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🔗</span>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 mb-8">
              Please connect your wallet to access your account dashboard and manage your campaigns.
            </p>
            <w3m-button />
          </div>
        </div>
      </main>
    )
  }

  // --- Sekcja z subtelnym komunikatem o tym, co się dzieje w aktualnie wybranej karcie ---
  const renderTabInfo = () => {
    const infoCards = {
      active: {
        icon: "🚀",
        title: "Active Campaigns",
        description: "Your ongoing campaigns accepting donations. Manage and monitor progress here.",
        color: "blue"
      },
      completed: {
        icon: "✅",
        title: "Completed Campaigns", 
        description: "Successfully funded campaigns ready for withdrawal.",
        color: "green"
      },
      closing: {
        icon: "⏳",
        title: "Closing Campaigns",
        description: "Campaigns in 14-day closure period. Donors can request refunds.",
        color: "yellow"
      },
      failed: {
        icon: "❌",
        title: "Failed Campaigns",
        description: "Campaigns that didn't reach their funding goal. Refunds available.",
        color: "red"
      },
      donated: {
        icon: "💝",
        title: "Your Donations",
        description: "Campaigns you've supported with potential refund options.",
        color: "purple"
      }
    }

    const info = infoCards[selectedTab]
    const colorClasses: Record<string, string> = {
      blue: "from-blue-50 to-blue-100 border-blue-200 text-blue-800",
      green: "from-green-50 to-green-100 border-green-200 text-green-800", 
      yellow: "from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-800",
      red: "from-red-50 to-red-100 border-red-200 text-red-800",
      purple: "from-purple-50 to-purple-100 border-purple-200 text-purple-800"
    }

    return (
      <div className={`mb-8 p-6 bg-gradient-to-r ${colorClasses[info.color]} rounded-2xl border shadow-lg`}>
        <div className="flex items-center">
          <div className="text-3xl mr-4">{info.icon}</div>
          <div>
            <h3 className="text-xl font-bold mb-2">{info.title}</h3>
            <p className="opacity-90">{info.description}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              My Account Dashboard
            </h1>
            <p className="text-xl text-blue-100">
              Manage your campaigns, track donations, and monitor your blockchain activity
            </p>
          </div>

          {/* Wallet Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm font-medium">ETH Balance</p>
                  <p className="text-2xl font-bold text-white">{parseFloat(ethBalance).toFixed(4)} ETH</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm font-medium">USDC Balance</p>
                  <p className="text-2xl font-bold text-white">{usdcBalance} USDC</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">💎</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm font-medium">Total Campaigns</p>
                  <p className="text-2xl font-bold text-white">{myCampaigns.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {[
            { key: 'active', label: 'Active', count: activeCampaigns.length },
            { key: 'completed', label: 'Completed', count: completedCampaigns.length },
            { key: 'closing', label: 'Closing', count: closingCampaigns.length },
            { key: 'failed', label: 'Failed', count: failedCampaigns.length },
            { key: 'donated', label: 'My Donations', count: donatedCampaigns.length }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setSelectedTab(key as any)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                selectedTab === key
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'bg-white/80 text-gray-700 hover:bg-blue-100 hover:text-blue-700 shadow-md hover:shadow-lg'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* Tab Info */}
        {renderTabInfo()}

        {/* Campaign Grid */}
        <section className="mb-16">
          {campaignsLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading campaigns...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(selectedTab === 'donated' ? donatedCampaigns
               : selectedTab === 'active'    ? activeCampaigns
               : selectedTab === 'completed' ? completedCampaigns
               : selectedTab === 'closing'   ? closingCampaigns
               : failedCampaigns
              ).map(c => (
                <div key={c.campaignId} className="transform hover:scale-105 transition-transform duration-200">
                  {selectedTab === 'donated' ? (
                    <MyDonationCard campaign={c as any} />
                  ) : (
                    <MyCampaignCard
                      campaign={c}
                      hasReclaimedMap={hasReclaimedMap}
                      onInitiateClosure={(id) => initiateClosure(id)}
                      onWithdraw={(id, cid) => withdrawFunds(id, cid)}
                      onClaimRefund={(id) => claimRefund(id)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!campaignsLoading && (
            ((selectedTab === 'donated'   && donatedCampaigns.length === 0) ||
             (selectedTab === 'active'    && activeCampaigns.length === 0) ||
             (selectedTab === 'completed' && completedCampaigns.length === 0) ||
             (selectedTab === 'closing'   && closingCampaigns.length === 0) ||
             (selectedTab === 'failed'    && failedCampaigns.length === 0)
            ) && (
              <div className="text-center py-20">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-lg border border-white/20 max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">📭</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">No Campaigns Found</h3>
                  <p className="text-gray-600 mb-8">
                    {selectedTab === 'donated' ? "You haven't donated to any campaigns yet."
                      : selectedTab === 'active' ? "You don't have any active campaigns."
                      : selectedTab === 'completed' ? "No completed campaigns found."
                      : selectedTab === 'closing' ? "No campaigns are currently closing."
                      : "No failed campaigns found."}
                  </p>
                  {selectedTab !== 'donated' && (
                    <button
                      onClick={() => router.push('/create-campaign')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-bold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                    >
                      Create Your First Campaign
                    </button>
                  )}
                </div>
              </div>
            )
          )}
        </section>

        {/* Activity History */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
            Activity History
          </h2>

          {/* History Tabs */}
          <div className="flex space-x-4 mb-8">
            {[
              { key: 'donations', label: 'Donation History', count: donations.length },
              { key: 'creations', label: 'Creation History', count: creations.length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setSelectedHistoryTab(key as any)}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  selectedHistoryTab === key
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          {/* History Content */}
          <div className="space-y-4">
            {selectedHistoryTab === 'donations' ? (
              <>
                {donations.slice(0, visibleDonationsCount).map((log, i) => {
                  const args = log.args!
                  return (
                    <div key={i} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                            <span className="text-xl">💝</span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">Campaign #{args.campaignId.toString()}</p>
                            <p className="text-gray-600">
                              Donated {(Number(args.amountToCampaign) / 10 ** 6).toFixed(2)} USDC
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(Number(args.timestamp) * 1000).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {donations.length > visibleDonationsCount && (
                  <div className="text-center">
                    <button
                      onClick={() => setVisibleDonationsCount(prev => prev + 5)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
                    >
                      Load More
                    </button>
                  </div>
                )}
                {donations.length === 0 && (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-4 block">📭</span>
                    <p className="text-gray-500">No donation history found.</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {creations.slice(0, visibleCreationsCount).map((log, i) => {
                  const args = log.args!
                  const typeValue = Number(args.campaignType)
                  const typeLabel = typeValue === 0 ? 'Startup' : 'Charity'
                  return (
                    <div key={i} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                            <span className="text-xl">🚀</span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">Campaign #{args.campaignId.toString()}</p>
                            <p className="text-gray-600">
                              {typeLabel} • Target: {(Number(args.targetAmount) / 10 ** 6).toFixed(2)} USDC
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(Number(args.creationTimestamp) * 1000).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {creations.length > visibleCreationsCount && (
                  <div className="text-center">
                    <button
                      onClick={() => setVisibleCreationsCount(prev => prev + 5)}
                      className="px-6 py-3 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors"
                    >
                      Load More
                    </button>
                  </div>
                )}
                {creations.length === 0 && (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-4 block">📭</span>
                    <p className="text-gray-500">No campaigns created yet.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}