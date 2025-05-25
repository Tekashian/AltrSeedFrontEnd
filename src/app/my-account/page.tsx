// src/app/my-account/page.tsx
'use client'

import React, { useEffect, useState, useMemo } from 'react'
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
import CampaignCard from '../../components/CampaignCard'

export default function MyAccountPage() {
  const { address, isConnected } = useAppKitAccount()
  const { chainId }              = useAppKitNetworkCore()
  const { walletProvider }       = useAppKitProvider<Provider>('eip155')

  // ETH / USDC balances
  const [ethBalance, setEthBalance]   = useState<string>('0')
  const [usdcBalance, setUsdcBalance] = useState<string>('0')

  // on-chain event logs
  const [donations, setDonations] = useState<any[]>([])
  const [creations, setCreations] = useState<any[]>([])

  // selected tab for campaigns: 'active', 'completed', or 'closing'
  const [selectedTab, setSelectedTab] = useState<'active' | 'completed' | 'closing'>('active')

  // selected tab for history: 'donations' or 'creations'
  const [selectedHistoryTab, setSelectedHistoryTab] = useState<'donations' | 'creations'>('donations')

  // fetch all campaigns
  const {
    data: allCampaignsRaw,
    isLoading: campaignsLoading,
    refetch: refetchCampaigns
  } = useReadContract({
    address: crowdfundContractConfig.address,
    abi: crowdfundContractConfig.abi,
    functionName: 'getAllCampaigns',
    chainId
  })

  // turn into Campaign[] and zero-based IDs
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

  // split into active (status=0), completed (status=1), and closing (status=3)
  // sort each by closeness to goal descending, then oldest first
  const activeCampaigns = useMemo(
    () =>
      myCampaigns
        .filter(c => c.status === 0)
        .sort((a, b) => {
          const progA = Number(a.raisedAmount) / Number(a.targetAmount)
          const progB = Number(b.raisedAmount) / Number(b.targetAmount)
          if (progB !== progA) return progB - progA
          return Number(a.creationTimestamp) - Number(b.creationTimestamp)
        }),
    [myCampaigns]
  )
  const completedCampaigns = useMemo(
    () =>
      myCampaigns
        .filter(c => c.status === 1)
        .sort((a, b) => {
          const progA = Number(a.raisedAmount) / Number(a.targetAmount)
          const progB = Number(b.raisedAmount) / Number(b.targetAmount)
          if (progB !== progA) return progB - progA
          return Number(a.creationTimestamp) - Number(b.creationTimestamp)
        }),
    [myCampaigns]
  )
  const closingCampaigns = useMemo(
    () =>
      myCampaigns
        .filter(c => c.status === 3)
        .sort((a, b) => {
          const progA = Number(a.raisedAmount) / Number(a.targetAmount)
          const progB = Number(b.raisedAmount) / Number(b.targetAmount)
          if (progB !== progA) return progB - progA
          return Number(a.creationTimestamp) - Number(b.creationTimestamp)
        }),
    [myCampaigns]
  )

  // on mount / when wallet changes, fetch balances & logs
  useEffect(() => {
    if (!isConnected || !address || !walletProvider) return

    const init = async () => {
      const provider = new BrowserProvider(walletProvider, chainId)

      // 1) ETH balance
      const rawEth = await provider.getBalance(address)
      setEthBalance(formatEther(rawEth))

      // 2) USDC balance
      const usdc = new Contract(
        usdcContractConfig.address,
        usdcContractConfig.abi,
        provider
      )
      const rawUsdc  = await usdc.balanceOf(address)
      const decimals = await usdc.decimals()
      setUsdcBalance((Number(rawUsdc) / 10 ** Number(decimals)).toFixed(2))

      // 3) DonationReceived events
      const cf = new Contract(
        crowdfundContractConfig.address,
        crowdfundContractConfig.abi,
        provider
      )
      const donFilter = cf.filters.DonationReceived(null, address)
      const donLogs = await cf.queryFilter(donFilter)
      setDonations(
        donLogs.sort(
          (x, y) => Number(y.args!.timestamp) - Number(x.args!.timestamp)
        )
      )

      // 4) CampaignCreated events
      const crFilter = cf.filters.CampaignCreated(null, address)
      const crLogs = await cf.queryFilter(crFilter)
      setCreations(
        crLogs.sort(
          (x, y) =>
            Number(y.args!.creationTimestamp) - Number(x.args!.creationTimestamp)
        )
      )
    }

    init().catch(console.error)
  }, [isConnected, address, chainId, walletProvider])

  // unified withdraw handler
  const handleWithdraw = async (id: number, status: number) => {
    if (!walletProvider) return
    const provider = new BrowserProvider(walletProvider, chainId)
    const signer   = await provider.getSigner()
    const cf       = new Contract(
      crowdfundContractConfig.address,
      crowdfundContractConfig.abi,
      signer
    )

    const onChainId = id + 1
    let tx
    if (status === 1) {
      tx = await cf.withdrawFunds(onChainId)
    } else if (status === 3) {
      tx = await cf.finalizeClosureAndWithdraw(onChainId)
    } else {
      alert('Ta kampania nie jest gotowa do wypłaty.')
      return
    }

    await tx.wait()
    alert(`Środki wypłacone z kampanii #${onChainId}`)
    refetchCampaigns()
  }

  // initiate closure
  const handleInitiateClosure = async (id: number) => {
    if (!walletProvider) return
    const provider = new BrowserProvider(walletProvider, chainId)
    const signer   = await provider.getSigner()
    const cf       = new Contract(
      crowdfundContractConfig.address,
      crowdfundContractConfig.abi,
      signer
    )

    const onChainId = id + 1
    const tx = await cf.initiateClosure(onChainId)
    await tx.wait()
    alert(`Zainicjowano zamknięcie kampanii #${onChainId}`)
    refetchCampaigns()
  }

  // claim refund
  const handleClaimRefund = async (id: number) => {
    if (!walletProvider) return
    const provider = new BrowserProvider(walletProvider, chainId)
    const signer   = await provider.getSigner()
    const cf       = new Contract(
      crowdfundContractConfig.address,
      crowdfundContractConfig.abi,
      signer
    )

    const onChainId = id + 1
    const tx = await cf.claimRefund(onChainId)
    await tx.wait()
    alert(`Zwrot z kampanii #${onChainId} odebrany`)
  }

  return (
    <main
      className="container mx-auto p-6 space-y-8"
      style={{ backgroundColor: '#E0F0FF' }}
    >
      <h1 className="text-3xl font-bold" style={{ color: '#1F4E79' }}>
        My Account
      </h1>

      {/* BALANCES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 rounded shadow" style={{ backgroundColor: '#FFFFFF' }}>
          <h2 className="font-semibold" style={{ color: '#1F4E79' }}>
            ETH Balance
          </h2>
          <p className="text-xl" style={{ color: '#00ADEF' }}>
            {ethBalance} ETH
          </p>
        </div>
        <div className="p-4 rounded shadow" style={{ backgroundColor: '#FFFFFF' }}>
          <h2 className="font-semibold" style={{ color: '#1F4E79' }}>
            USDC Balance
          </h2>
          <p className="text-xl" style={{ color: '#00ADEF' }}>
            {usdcBalance} USDC
          </p>
        </div>
      </div>

      {/* CAMPAIGNS TABS */}
      <div className="flex space-x-4 border-b border-gray-300">
        <button
          onClick={() => setSelectedTab('active')}
          className={`pb-2 text-lg font-medium ${
            selectedTab === 'active'
              ? 'text-[#1F4E79] border-b-2 border-[#1F4E79]'
              : 'text-gray-500'
          }`}
        >
          Aktywne
        </button>
        <button
          onClick={() => setSelectedTab('completed')}
          className={`pb-2 text-lg font-medium ${
            selectedTab === 'completed'
              ? 'text-[#1F4E79] border-b-2 border-[#1F4E79]'
              : 'text-gray-500'
          }`}
        >
          Zakończone
        </button>
        <button
          onClick={() => setSelectedTab('closing')}
          className={`pb-2 text-lg font-medium ${
            selectedTab === 'closing'
              ? 'text-[#1F4E79] border-b-2 border-[#1F4E79]'
              : 'text-gray-500'
          }`}
        >
          Zamykane
        </button>
      </div>

      {/* MY CAMPAIGNS */}
      <section className="space-y-4">
        {campaignsLoading ? (
          <p>Ładowanie kampanii…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(selectedTab === 'active'
              ? activeCampaigns
              : selectedTab === 'completed'
              ? completedCampaigns
              : closingCampaigns
            ).map(c => (
              <div key={c.campaignId} className="space-y-2">
                <CampaignCard campaign={c} />

                <div className="flex flex-wrap gap-2">
                  {(c.status === 1 || c.status === 3) && (
                    <button
                      onClick={() => handleWithdraw(c.campaignId!, c.status)}
                      className="px-3 py-1 rounded"
                      style={{ backgroundColor: '#68CC89', color: '#FFFFFF' }}
                    >
                      Withdraw
                    </button>
                  )}
                  {c.status === 0 && BigInt(c.raisedAmount) >= BigInt(c.targetAmount) && (
                    <button
                      onClick={() => handleInitiateClosure(c.campaignId!)}
                      className="px-3 py-1 rounded"
                      style={{ backgroundColor: '#00ADEF', color: '#FFFFFF' }}
                    >
                      Initiate Closure
                    </button>
                  )}
                  {c.status === 5 && (
                    <button
                      onClick={() => handleClaimRefund(c.campaignId!)}
                      className="px-3 py-1 rounded"
                      style={{ backgroundColor: '#FF6B6B', color: '#FFFFFF' }}
                    >
                      Claim Refund
                    </button>
                  )}
                </div>
              </div>
            ))}
            {((selectedTab === 'active' && activeCampaigns.length === 0) ||
              (selectedTab === 'completed' && completedCampaigns.length === 0) ||
              (selectedTab === 'closing' && closingCampaigns.length === 0)) && (
              <p className="text-gray-500">
                {selectedTab === 'active'
                  ? 'Brak aktywnych kampanii.'
                  : selectedTab === 'completed'
                  ? 'Brak zakończonych kampanii.'
                  : 'Brak zamykanych kampanii.'}
              </p>
            )}
          </div>
        )}
      </section>

      {/* HISTORY TABS */}
      <div className="flex space-x-4 border-b border-gray-300">
        <button
          onClick={() => setSelectedHistoryTab('donations')}
          className={`pb-2 text-lg font-medium ${
            selectedHistoryTab === 'donations'
              ? 'text-[#1F4E79] border-b-2 border-[#1F4E79]'
              : 'text-gray-500'
          }`}
        >
          Historia Dotacji
        </button>
        <button
          onClick={() => setSelectedHistoryTab('creations')}
          className={`pb-2 text-lg font-medium ${
            selectedHistoryTab === 'creations'
              ? 'text-[#1F4E79] border-b-2 border-[#1F4E79]'
              : 'text-gray-500'
          }`}
        >
          Historia Tworzenia
        </button>
      </div>

      {/* HISTORY CONTENT */}
      <section className="space-y-4">
        {selectedHistoryTab === 'donations' ? (
          donations.length === 0 ? (
            <p>Brak dotacji.</p>
          ) : (
            donations.map((log, i) => {
              const args = log.args!
              return (
                <div
                  key={i}
                  className="p-4 rounded shadow mb-3"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
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
            const targetUsdc = (Number(args.targetAmount) / 10 ** 6).toFixed(2)
            return (
              <div
                key={i}
                className="p-4 rounded shadow mb-3"
                style={{ backgroundColor: '#FFFFFF' }}
              >
                <p>
                  <strong>Kampania #</strong> {args.campaignId.toString()}
                  {' | Typ: '} {args.campaignType}
                </p>
                <p>
                  <strong>Cel:</strong>{' '}
                  {targetUsdc} USDC
                </p>
                <p>
                  <strong>Utworzono:</strong>{' '}
                  {new Date(
                    Number(args.creationTimestamp) * 1000
                  ).toLocaleString()}
                </p>
              </div>
            )
          })
        )}
      </section>
    </main>
  )
}
