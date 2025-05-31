// src/app/my-account/page.tsx
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

import {
  crowdfundContractConfig,
  usdcContractConfig
} from '../../blockchain/contracts'
import { Campaign } from '../../hooks/useCrowdfund'
import MyCampaignCard from '../../components/MyCampaignCard'
import MyDonationCard from '../../components/MyDonationCard'
import CampaignCard from '../../components/CampaignCard'
import WithdrawButton from '../../components/WithdrawButton'
import RefundButton from '../../components/RefundButton'

export default function MyAccountPage() {
  const router = useRouter()
  const { address, isConnected } = useAppKitAccount()
  const { chainId }              = useAppKitNetworkCore()
  const { walletProvider }       = useAppKitProvider<Provider>('eip155')

  // ETH / USDC balances
  const [ethBalance,   setEthBalance  ] = useState<string>('0')
  const [usdcBalance,  setUsdcBalance ] = useState<string>('0')

  // on-chain event logs
  const [donations, setDonations] = useState<any[]>([])
  const [creations, setCreations] = useState<any[]>([])

  // for tracking which donations have been reclaimed
  const [hasReclaimedMap, setHasReclaimedMap] = useState<Record<number, boolean>>({})

  // selected tab for campaigns: 'active', 'completed', 'closing', 'failed', or 'donated'
  const [selectedTab, setSelectedTab] = useState<'active' | 'completed' | 'closing' | 'failed' | 'donated'>('active')

  // selected tab for history: 'donations' or 'creations'
  const [selectedHistoryTab, setSelectedHistoryTab] = useState<'donations' | 'creations'>('donations')

  // fetch all campaigns
  const {
    data: allCampaignsRaw,
    isLoading: campaignsLoading,
    refetch: refetchCampaigns
  } = useReadContract({
    address:       crowdfundContractConfig.address,
    abi:           crowdfundContractConfig.abi,
    functionName:  'getAllCampaigns',
    chainId
  })

  // convert to Campaign[] with zero-based IDs
  const allCampaigns: Campaign[] | undefined = allCampaignsRaw?.map(
    (c: any, i: number) => ({ ...c, campaignId: i })
  )

  // filter to only those this address created
  const myCampaigns = useMemo(() => {
    if (!allCampaigns || !address) return []
    return allCampaigns.filter(
      c => c.creator.toLowerCase() === address.toLowerCase()
    )
  }, [allCampaigns, address])

  // split into active, completed, closing, failed
  const activeCampaigns = useMemo(() =>
    myCampaigns
      .filter(c => c.status === 0)  // 0 = Active
      .sort((a, b) => {
        const progA = Number(a.raisedAmount) / Number(a.targetAmount)
        const progB = Number(b.raisedAmount) / Number(b.targetAmount)
        if (progB !== progA) return progB - progA
        return Number(a.creationTimestamp) - Number(b.creationTimestamp)
      }),
  [myCampaigns])

  const completedCampaigns = useMemo(() =>
    myCampaigns
      .filter(c => c.status === 1)  // 1 = Completed
      .sort((a, b) => {
        const progA = Number(a.raisedAmount) / Number(a.targetAmount)
        const progB = Number(b.raisedAmount) / Number(b.targetAmount)
        if (progB !== progA) return progB - progA
        return Number(a.creationTimestamp) - Number(b.creationTimestamp)
      }),
  [myCampaigns])

  const closingCampaigns = useMemo(() =>
    myCampaigns
      .filter(c => c.status === 3)  // 3 = Closing
      .sort((a, b) => {
        const progA = Number(a.raisedAmount) / Number(a.targetAmount)
        const progB = Number(b.raisedAmount) / Number(b.targetAmount)
        if (progB !== progA) return progB - progA
        return Number(a.creationTimestamp) - Number(b.creationTimestamp)
      }),
  [myCampaigns])

  const failedCampaigns = useMemo(() =>
    myCampaigns
      .filter(c => c.status === 2)  // 2 = Failed (Nie Udane)
      .sort((a, b) => {
        const progA = Number(a.raisedAmount) / Number(a.targetAmount)
        const progB = Number(b.raisedAmount) / Number(b.targetAmount)
        if (progB !== progA) return progB - progA
        return Number(a.creationTimestamp) - Number(b.creationTimestamp)
      }),
  [myCampaigns])

  // compute total donated amounts
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

  // get campaigns this user has donated to (non-zero, not closing, not failed), sorted desc by amount,
  // and filter out those already reclaimed
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
        c.status !== 3 && // exclude Closing
        c.status !== 2 && // exclude Failed
        !hasReclaimedMap[c.campaignId]
      )
      .sort((a, b) => b.donatedAmount - a.donatedAmount)
  }, [allCampaigns, donationTotals, hasReclaimedMap])

  // load balances and logs on mount / wallet change
  useEffect(() => {
    if (!isConnected || !address || !walletProvider) return

    const init = async () => {
      const provider = new BrowserProvider(walletProvider, chainId)

      // ETH balance
      const rawEth = await provider.getBalance(address)
      setEthBalance(formatEther(rawEth))

      // USDC balance
      const usdc = new Contract(
        usdcContractConfig.address,
        usdcContractConfig.abi,
        provider
      )
      const rawUsdc  = await usdc.balanceOf(address)
      const decimals = await usdc.decimals()
      setUsdcBalance((Number(rawUsdc) / 10 ** Number(decimals)).toFixed(2))

      // DonationReceived events
      const cf = new Contract(
        crowdfundContractConfig.address,
        crowdfundContractConfig.abi,
        provider
      )
      const donLogs = await cf.queryFilter(cf.filters.DonationReceived(null, address))
      setDonations(donLogs.sort((x, y) => Number(y.args!.timestamp) - Number(x.args!.timestamp)))

      // CampaignCreated events
      const crLogs = await cf.queryFilter(cf.filters.CampaignCreated(null, address))
      setCreations(crLogs.sort((x, y) => Number(y.args!.creationTimestamp) - Number(x.args!.creationTimestamp)))

      // fetch hasReclaimed flags for each donated campaign
      const uniqueIds = Object.keys(donationTotals).map(id => Number(id))
      for (const id of uniqueIds) {
        try {
          const reclaimed: boolean = await cf.hasReclaimed(id + 1, address)
          setHasReclaimedMap(prev => ({ ...prev, [id]: reclaimed }))
        } catch {
          // ignore errors
        }
      }
    }

    init().catch(console.error)
  }, [isConnected, address, chainId, walletProvider, donationTotals])

  return (
    <main className="container mx-auto p-6 space-y-8 bg-[#E0F0FF]">
      <h1 className="text-3xl font-bold text-[#1F4E79]">My Account</h1>

      {/* Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-white rounded shadow">
          <h2 className="font-semibold text-[#1F4E79]">ETH Balance</h2>
          <p className="text-xl text-[#00ADEF]">{ethBalance} ETH</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h2 className="font-semibold text-[#1F4E79]">USDC Balance</h2>
          <p className="text-xl text-[#00ADEF]">{usdcBalance} USDC</p>
        </div>
      </div>

      {/* Campaign Tabs */}
      <div className="flex space-x-4 border-b border-gray-300">
        {(['active','completed','closing','failed','donated'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`pb-2 text-lg font-medium ${
              selectedTab === tab 
                ? 'text-[#1F4E79] border-b-2 border-[#1F4E79]' 
                : 'text-gray-500'
            }`}
          >
            {tab === 'active' ? 'Aktywne'
              : tab === 'completed' ? 'Zakończone'
              : tab === 'closing' ? 'Zamykane'
              : tab === 'failed' ? 'Nie Udane'
              : 'Moje dotacje'}
          </button>
        ))}
      </div>

      {/* Campaign List */}
      <section>
        {campaignsLoading ? (
          <p>Ładowanie kampanii…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(selectedTab === 'donated' ? donatedCampaigns
             : selectedTab === 'active'    ? activeCampaigns
             : selectedTab === 'completed' ? completedCampaigns
             : selectedTab === 'closing'   ? closingCampaigns
             : failedCampaigns
            ).map(c => (
              <div key={c.campaignId}>
                {selectedTab === 'donated' ? (
                  <MyDonationCard campaign={c} />
                ) : selectedTab === 'closing' ? (
                  <CampaignCard 
                    campaign={c} 
                    refetchCampaigns={refetchCampaigns} 
                  />
                ) : selectedTab === 'failed' ? (
                  <div
                    className="group bg-white rounded-xl shadow-lg hover:shadow-[0_0_35px_5px_rgba(255,0,0,0.3)]
                               transition-all duration-300 ease-in-out transform hover:scale-105
                               overflow-visible cursor-pointer relative"
                  >
                    {/* Kliknięcie przeniesie do szczegółów kampanii */}
                    <div onClick={() => router.push(`/campaigns/${c.campaignId + 1}`)}>
                      <MyCampaignCard campaign={c} />
                    </div>
                    {/* Przyciski akcji dla kampanii "Nie Udane" */}
                    <div className="p-4 flex flex-col items-center border-t border-gray-100 bg-white">
                      {(() => {
                        const nowSec = Math.floor(Date.now() / 1000)
                        const reclaimDeadline = 
                          typeof c.reclaimDeadline === 'bigint'
                            ? Number(c.reclaimDeadline)
                            : c.reclaimDeadline ?? 0
                        const isCreator = 
                          address?.toLowerCase() === c.creator.toLowerCase()

                        if (isCreator && nowSec >= reclaimDeadline) {
                          return (
                            <WithdrawButton
                              campaignId={c.campaignId + 1}
                              className="px-6 py-3 bg-[#1F4E79] text-white text-lg font-semibold rounded-lg hover:bg-[#163D60] transition"
                            >
                              Wypłać środki
                            </WithdrawButton>
                          )
                        } else if (!isCreator && nowSec < reclaimDeadline) {
                          return (
                            <RefundButton
                              campaignId={c.campaignId + 1}
                              className="px-6 py-3 bg-[#FF5555] text-white text-lg font-semibold rounded-lg hover:bg-[#E04E4E] transition"
                            >
                              Zwróć wpłatę
                            </RefundButton>
                          )
                        } else {
                          // Jeśli creator, a okres nie minął, pokaż informację
                          // Jeśli donor, a okres minął, nic nie da się zrobić
                          return (
                            <p className="text-center text-sm text-gray-600">
                              {isCreator
                                ? `Okres zwrotu kończy się ${new Date(reclaimDeadline * 1000).toLocaleString()}`
                                : 'Okres zwrotu minął'}
                            </p>
                          )
                        }
                      })()}
                    </div>
                  </div>
                ) : (
                  <MyCampaignCard campaign={c} />
                )}
              </div>
            ))}
            {((selectedTab === 'donated'   && donatedCampaigns.length === 0) ||
              (selectedTab === 'active'    && activeCampaigns.length === 0) ||
              (selectedTab === 'completed' && completedCampaigns.length === 0) ||
              (selectedTab === 'closing'   && closingCampaigns.length === 0) ||
              (selectedTab === 'failed'    && failedCampaigns.length === 0)
            ) && (
              <p className="text-gray-500">
                {selectedTab === 'donated'   ? 'Nie wpłaciłeś jeszcze na żadną kampanię.'
                  : selectedTab === 'active'    ? 'Brak aktywnych kampanii.'
                  : selectedTab === 'completed' ? 'Brak zakończonych kampanii.'
                  : selectedTab === 'closing'   ? 'Brak kampanii w trakcie zamykania.'
                  : 'Brak nieudanych kampanii.'}
              </p>
            )}
          </div>
        )}
      </section>

      {/* History Tabs */}
      <div className="flex space-x-4 border-b border-gray-300 mt-8">
        {(['donations','creations'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedHistoryTab(tab)}
            className={`pb-2 text-lg font-medium ${
              selectedHistoryTab === tab 
                ? 'text-[#1F4E79] border-b-2 border-[#1F4E79]' 
                : 'text-gray-500'
            }`}
          >
            {tab === 'donations' ? 'Historia Dotacji' : 'Historia Tworzenia'}
          </button>
        ))}
      </div>

      {/* History Content */}
      <section className="space-y-4 mt-4">
        {selectedHistoryTab === 'donations' ? (
          donations.length === 0 ? (
            <p>Brak dotacji.</p>
          ) : (
            donations.map((log, i) => {
              const args = log.args!
              return (
                <div key={i} className="p-4 bg-white rounded shadow">
                  <p><strong>Kampania #</strong> {args.campaignId.toString()}</p>
                  <p>
                    <strong>Kwota:</strong>{' '}
                    {(Number(args.amountToCampaign) / 10 ** 6).toFixed(2)} USDC
                  </p>
                  <p>
                    <strong>Czas:</strong>{' '}
                    {new Date(Number(args.timestamp) * 1000).toLocaleString()}
                  </p>
                </div>
              )
            })
          )
        ) : creations.length === 0 ? (
          <p>Brak utworzonych kampanii.</p>
        ) : (
          creations.map((log, i) => {
            const args = log.args!
            return (
              <div key={i} className="p-4 bg-white rounded shadow">
                <p>
                  <strong>Kampania #</strong> {args.campaignId.toString()}
                  {' | Typ: '} {args.campaignType}
                </p>
                <p>
                  <strong>Cel:</strong>{' '}
                  {(Number(args.targetAmount) / 10 ** 6).toFixed(2)} USDC
                </p>
                <p>
                  <strong>Utworzono:</strong>{' '}
                  {new Date(Number(args.creationTimestamp) * 1000).toLocaleString()}
                </p>
              </div>
            )
          })
        )}
      </section>
    </main>
  )
}
