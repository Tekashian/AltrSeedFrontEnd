// src/app/my-account/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import {
  useAppKitAccount,
  useAppKitNetworkCore,
  useAppKitProvider,
  type Provider
} from '@reown/appkit/react'
import { BrowserProvider, Contract, formatEther } from 'ethers'
import {
  crowdfundContractConfig,
  usdcContractConfig
} from '../../blockchain/contracts'
import { useReadContract } from 'wagmi'
import { Campaign } from '../../hooks/useCrowdfund'
import CampaignCard from '../../components/CampaignCard'

export default function MyAccountPage() {
  const { address, isConnected } = useAppKitAccount()
  const { chainId }            = useAppKitNetworkCore()
  const { walletProvider }     = useAppKitProvider<Provider>('eip155')

  // stan sald
  const [ethBalance, setEthBalance]   = useState<string>('0')
  const [usdcBalance, setUsdcBalance] = useState<string>('0')

  // historia dotacji i tworzenia już nie potrzebna, bo CampaignCard zajmuje się szczegółami
  // ale zostawimy dla pokazu eventów:
  const [donations, setDonations] = useState<any[]>([])
  const [creations, setCreations] = useState<any[]>([])

  // --- pobranie wszystkich kampanii z blockchainu ---
  const {
    data: allCampaignsRaw,
    isLoading: campaignsLoading,
    refetch: refetchCampaigns
  } = useReadContract({
    address: crowdfundContractConfig.address,
    abi: crowdfundContractConfig.abi,
    functionName: 'getAllCampaigns',
    chainId: chainId
  })

  // zamapuj na typ Campaign[] i dodaj campaignId = index
  const allCampaigns: Campaign[] | undefined = allCampaignsRaw?.map(
    (c: any, i: number) => ({
      ...c,
      campaignId: i
    })
  )

  // Twoje kampanie
  const myCampaigns = React.useMemo(() => {
    if (!allCampaigns || !address) return []
    return allCampaigns.filter(c =>
      c.creator.toLowerCase() === address.toLowerCase()
    )
  }, [allCampaigns, address])

  useEffect(() => {
    if (!isConnected || !address || !walletProvider) return

    const init = async () => {
      const provider = new BrowserProvider(walletProvider, chainId)

      // ETH
      const rawEth = await provider.getBalance(address)
      setEthBalance(formatEther(rawEth))

      // USDC
      const usdc = new Contract(
        usdcContractConfig.address,
        usdcContractConfig.abi,
        provider
      )
      const rawUsdc  = await usdc.balanceOf(address)
      const decimals = await usdc.decimals()
      setUsdcBalance((Number(rawUsdc) / 10 ** Number(decimals)).toFixed(2))

      // DonationReceived events (dla pokazu)
      const cf = new Contract(
        crowdfundContractConfig.address,
        crowdfundContractConfig.abi,
        provider
      )
      const donFilter = cf.filters.DonationReceived(null, address)
      const donLogs   = await cf.queryFilter(donFilter)
      setDonations(donLogs)

      // CampaignCreated events (dla pokazu)
      const crFilter = cf.filters.CampaignCreated(null, address)
      const crLogs   = await cf.queryFilter(crFilter)
      setCreations(crLogs)
    }

    init().catch(console.error)
  }, [isConnected, address, chainId, walletProvider])

  return (
    <main className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">My Account</h1>

      {/* SALDA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">ETH Balance</h2>
          <p className="text-xl">{ethBalance} ETH</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">USDC Balance</h2>
          <p className="text-xl">{usdcBalance} USDC</p>
        </div>
      </div>

      {/* MOJE KAMPANIE */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Moje Kampanie</h2>
        {campaignsLoading ? (
          <p>Ładowanie kampanii…</p>
        ) : myCampaigns.length === 0 ? (
          <p>Nie utworzyłeś jeszcze żadnej kampanii.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {myCampaigns.map(c => (
              <CampaignCard
                key={c.campaignId}
                campaign={c}
                onDetailsClick={(id) => {
                  // np. router.push(`/campaigns/${id}`)
                  console.log('szczegóły kampanii', id)
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* HISTORIA DOTACJI */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Historia dotacji</h2>
        {donations.length === 0 ? (
          <p>Brak dotacji.</p>
        ) : (
          donations.map((log, i) => {
            const args = log.args!
            return (
              <div
                key={i}
                className="bg-white p-4 rounded shadow mb-3"
              >
                <p>
                  <strong>Campaign #</strong> {args.campaignId.toString()}
                </p>
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
        )}
      </section>

      {/* HISTORIA TWORZENIA */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Historia tworzenia kampanii</h2>
        {creations.length === 0 ? (
          <p>Brak utworzonych kampanii.</p>
        ) : (
          creations.map((log, i) => {
            const args = log.args!
            return (
              <div
                key={i}
                className="bg-white p-4 rounded shadow mb-3"
              >
                <p>
                  <strong>#</strong> {args.campaignId.toString()} | typ:{' '}
                  {args.campaignType}
                </p>
                <p>
                  <strong>Target:</strong>{' '}
                  {(Number(args.targetAmount) / 10 ** 18).toFixed(3)}
                </p>
                <p>
                  <strong>Created:</strong>{' '}
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
