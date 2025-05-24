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

  // filter to only those this address created, sort by progress descending
  const myCampaigns = useMemo(() => {
    if (!allCampaigns || !address) return []
    return allCampaigns
      .filter(c => c.creator.toLowerCase() === address.toLowerCase())
      .sort((a, b) => {
        const progA = Number(a.raisedAmount) / Number(a.targetAmount)
        const progB = Number(b.raisedAmount) / Number(b.targetAmount)
        return progB - progA
      })
  }, [allCampaigns, address])

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
      // sort newest first
      setDonations(donLogs.sort((x, y) => Number(y.args!.timestamp) - Number(x.args!.timestamp)))

      // 4) CampaignCreated events
      const crFilter = cf.filters.CampaignCreated(null, address)
      const crLogs = await cf.queryFilter(crFilter)
      // sort newest first by creationTimestamp
      setCreations(crLogs.sort((x, y) => Number(y.args!.creationTimestamp) - Number(x.args!.creationTimestamp)))
    }

    init().catch(console.error)
  }, [isConnected, address, chainId, walletProvider])

  // unified withdraw handler: for Completed (1) or Closing (2)
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
    } else if (status === 2) {
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

      {/* MY CAMPAIGNS */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" style={{ color: '#1F4E79' }}>
          Moje Kampanie
        </h2>
        {campaignsLoading ? (
          <p>Ładowanie kampanii…</p>
        ) : myCampaigns.length === 0 ? (
          <p>Nie utworzyłeś jeszcze żadnej kampanii.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {myCampaigns.map(c => (
              <div key={c.campaignId} className="space-y-2">
                <CampaignCard
                  campaign={c}
                  onDetailsClick={id => console.log('szczegóły kampanii', id)}
                />

                <div className="flex flex-wrap gap-2">
                  {/* Withdraw */}
                  {(c.status === 1 || c.status === 2) && (
                    <button
                      onClick={() => handleWithdraw(c.campaignId!, c.status)}
                      className="px-3 py-1 rounded"
                      style={{ backgroundColor: '#68CC89', color: '#FFFFFF' }}
                    >
                      Withdraw
                    </button>
                  )}

                  {/* Initiate Closure */}
                  {BigInt(c.raisedAmount) >= BigInt(c.targetAmount) && c.status === 0 && (
                    <button
                      onClick={() => handleInitiateClosure(c.campaignId!)}
                      className="px-3 py-1 rounded"
                      style={{ backgroundColor: '#00ADEF', color: '#FFFFFF' }}
                    >
                      Initiate Closure
                    </button>
                  )}

                  {/* Claim Refund */}
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
          </div>
        )}
      </section>

      {/* DONATION HISTORY */}
      <section>
        <h2 className="text-2xl font-semibold mb-4" style={{ color: '#1F4E79' }}>
          Historia dotacji
        </h2>
        {donations.length === 0 ? (
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
                <p><strong>Campaign #</strong> {args.campaignId.toString()}</p>
                <p><strong>Kwota:</strong> {(Number(args.amountToCampaign) / 10 ** 6).toFixed(2)} USDC</p>
                <p><strong>Czas:</strong> {new Date(Number(args.timestamp) * 1000).toLocaleString()}</p>
              </div>
            )
          })
        )}
      </section>

      {/* CREATION HISTORY */}
      <section>
        <h2 className="text-2xl font-semibold mb-4" style={{ color: '#1F4E79' }}>
          Historia tworzenia kampanii
        </h2>
        {creations.length === 0 ? (
          <p>Brak utworzonych kampanii.</p>
        ) : (
          creations.map((log, i) => {
            const args = log.args!
            return (
              <div
                key={i}
                className="p-4 rounded shadow mb-3"
                style={{ backgroundColor: '#FFFFFF' }}
              >
                <p><strong>#</strong> {args.campaignId.toString()} | typ: {args.campaignType}</p>
                <p><strong>Target:</strong> {(Number(args.targetAmount) / 10 ** 18).toFixed(3)}</p>
                <p><strong>Created:</strong> {new Date(Number(args.creationTimestamp) * 1000).toLocaleString()}</p>
              </div>
            )
          })
        )}
      </section>
    </main>
  )
}
