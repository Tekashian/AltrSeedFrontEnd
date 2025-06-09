// src/app/campaigns/[id]/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAccount } from 'wagmi'
import { useReadContract } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { crowdfundContractConfig } from '../../../blockchain/contracts'
import { formatUnits } from 'ethers'
import { BrowserProvider, Contract } from 'ethers'
import Image from 'next/image'
import DonateButton from '../../../components/DonateButton'
import Footer from '../../../components/Footer'

interface CampaignDetails {
  creator: string
  acceptedToken: string
  targetAmount: bigint
  raisedAmount: bigint
  dataCID: string
  endTime: bigint
  status: number
  creationTimestamp: bigint
  reclaimDeadline: bigint
  campaignType: number
}

interface CampaignMetadata {
  title: string
  description: string
  image?: string
  location?: string
  disease?: string
  cause?: string
}

interface DonationLog {
  donor: string
  amount: number
  timestamp: number
  txHash: string
}

interface Update {
  content: string
  timestamp: number
}

const USDC_TOKEN_ADDRESS_SEPOLIA =
  '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
const IPFS_GATEWAY_PREFIX = 'https://ipfs.io/ipfs/'
const PLACEHOLDER_IMAGE = '/images/BanerAltrSeed.jpg'

const formatUSDC = (amount: bigint): string => {
  const asString = formatUnits(amount, 6)
  const asNumber = Number(asString)
  return asNumber.toFixed(2)
}

export default function CampaignDetailPage() {
  const params = useParams()
  const idParam = params.id
  const idNum = Number(idParam)

  const {
    data,
    isLoading,
    error
  } = useReadContract({
    address: crowdfundContractConfig.address,
    abi: crowdfundContractConfig.abi,
    functionName: 'getCampaignDetails',
    args: [idNum],
    chainId: sepolia.id,
  })

  const { address: connectedAddress } = useAccount()
  const [metadata, setMetadata] = useState<CampaignMetadata | null>(null)
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true)
  const [donationInput, setDonationInput] = useState('')
  const [donations, setDonations] = useState<DonationLog[]>([])
  const [showSmsSection, setShowSmsSection] = useState(false)
  const [showTaxSection, setShowTaxSection] = useState(false)
  const [uniqueDonorsCount, setUniqueDonorsCount] = useState(0)
  const [updates, setUpdates] = useState<Update[]>([])
  const [newUpdateText, setNewUpdateText] = useState<string>('')
  const [isOwner, setIsOwner] = useState(false)

  // Fetch metadata from IPFS
  useEffect(() => {
    if (!data) return

    const details = data as CampaignDetails
    const cid = details.dataCID.trim()
    if (!cid) {
      setIsLoadingMetadata(false)
      return
    }

    fetch(`${IPFS_GATEWAY_PREFIX}${cid}`)
      .then((res) => {
        if (!res.ok) throw new Error(`IPFS error ${res.status}`)
        return res.json()
      })
      .then((meta: any) => {
        setMetadata({
          title: meta.title,
          description: meta.description,
          image: meta.image,
          location: meta.location,
          disease: meta.disease,
          cause: meta.cause
        })
      })
      .catch(() => {
        // leave null on error
      })
      .finally(() => setIsLoadingMetadata(false))
  }, [data])

  // Check ownership
  useEffect(() => {
    if (!data || !connectedAddress) {
      setIsOwner(false)
      return
    }
    const campaign = data as CampaignDetails
    setIsOwner(campaign.creator.toLowerCase() === connectedAddress.toLowerCase())
  }, [data, connectedAddress])

  // Fetch donation logs
  useEffect(() => {
    if (!data) return
    if (typeof window === 'undefined') return

    const fetchDonationLogs = async () => {
      try {
        const ethersProvider = new BrowserProvider(
          (window as any).ethereum,
          sepolia.id
        )
        const cfContract = new Contract(
          crowdfundContractConfig.address,
          crowdfundContractConfig.abi,
          ethersProvider
        )
        const rawLogs = await cfContract.queryFilter(
          cfContract.filters.DonationReceived(idNum, null)
        )
        const parsed: DonationLog[] = rawLogs.map((log: any) => {
          const { donor, amountToCampaign, timestamp } = log.args!
          return {
            donor: donor.toLowerCase(),
            amount: Number(amountToCampaign) / 10 ** 6,
            timestamp: Number(timestamp) * 1000,
            txHash: log.transactionHash
          }
        })
        parsed.sort((a, b) => b.timestamp - a.timestamp)
        setDonations(parsed)
        setUniqueDonorsCount(new Set(parsed.map(d => d.donor)).size)
      } catch (err) {
        console.error('Error fetching donation logs:', err)
      }
    }

    fetchDonationLogs()
  }, [data])

  const handleAddUpdate = () => {
    const trimmed = newUpdateText.trim()
    if (!trimmed) return
    setUpdates(prev => [{ content: trimmed, timestamp: Date.now() }, ...prev])
    setNewUpdateText('')
  }

  if (isLoading || isLoadingMetadata) {
    return <p>Ładowanie szczegółów kampanii…</p>
  }
  if (error) {
    return <p className="text-red-500">Błąd: {error.message}</p>
  }
  if (!data) {
    return <p>Nie znaleziono kampanii #{idNum}</p>
  }

  const campaign = data as CampaignDetails
  const title = metadata?.title || `Kampania #${idNum}`

  const cid = campaign.dataCID.trim()
  const isTestCid = cid.startsWith('Test')
  let imageUrl: string
  if (!metadata?.image || isTestCid) {
    imageUrl = PLACEHOLDER_IMAGE
  } else if (metadata.image.startsWith('ipfs://')) {
    imageUrl = `${IPFS_GATEWAY_PREFIX}${metadata.image.slice(7)}`
  } else if (metadata.image.startsWith('http')) {
    imageUrl = metadata.image
  } else {
    imageUrl = `${IPFS_GATEWAY_PREFIX}${metadata.image}`
  }

  const description = metadata?.description || ''
  const location = metadata?.location
  const disease = metadata?.disease
  const cause = metadata?.cause

  const raised = Number(formatUnits(campaign.raisedAmount, 6))
  const target = Number(formatUnits(campaign.targetAmount, 6))
  const missing = (target - raised).toFixed(2)
  const progressPercent =
    campaign.targetAmount > 0n
      ? Number((campaign.raisedAmount * 10000n) / campaign.targetAmount) / 100
      : 0
  const displayToken =
    campaign.acceptedToken.toLowerCase() ===
    USDC_TOKEN_ADDRESS_SEPOLIA.toLowerCase()
      ? 'USDC'
      : campaign.acceptedToken.slice(0, 6) + '…'

  return (
    <>
      <div className="relative w-full h-[600px] -mt-56">
        <div className="absolute inset-0 -z-10">
          <Image
            src={imageUrl}
            alt="Tło rozmyte kampanii"
            fill
            className="object-cover object-top w-full h-full blur-lg scale-110"
            priority
          />
          <div className="absolute inset-0 bg-black opacity-20" />
        </div>
      </div>

      <main className="container mx-auto p-6 -mt-[350px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* LEWA KOLUMNA - mobile/tablet */}
          <div className="space-y-6">

            {/* Obraz kampanii */}
            <div className="w-full relative rounded-md overflow-hidden shadow-sm h-[600px]">
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover object-center w-full h-full"
                priority
              />
            </div>

            {/* Panel wpłaty - mobile only */}
            <div className="lg:hidden bg-white rounded-md shadow-sm overflow-hidden">
              <div className="px-6 py-4">
                <h1 className="text-2xl font-semibold text-[#1F4E79]">
                  {title}
                </h1>
              </div>
              <div className="px-6 pb-4">
                <p className="text-lg font-medium text-green-600">
                  {raised.toLocaleString('pl-PL')} {displayToken}{' '}
                  <span className="text-base font-normal text-gray-500">
                    ({progressPercent.toFixed(2)}%)
                  </span>
                </p>
                <div className="mt-2 w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-green-600 transition-width"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Brakuje {missing} {displayToken}
                </p>
              </div>
              <div className="px-6 mb-4">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Kwota w USDC"
                  value={donationInput}
                  onChange={e => setDonationInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-100 rounded-md text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1F4E79]"
                />
              </div>
              <div className="px-6 py-4">
                <DonateButton
                  campaignId={idNum}
                  donationAmount={donationInput}
                  className="w-full py-2 text-base font-medium text-white bg-[#68CC89] hover:bg-[#5FBF7A] rounded-md"
                >
                  Wesprzyj
                </DonateButton>
                <p className="mt-2 text-center text-xs text-gray-500">
                  Wsparło {uniqueDonorsCount.toLocaleString('pl-PL')} osób
                </p>
              </div>
              <div className="px-6 py-3 flex justify-between border-t border-gray-100">
                <button className="flex flex-col items-center text-blue-500 hover:text-blue-700">
                  <span className="text-xl mb-1">🐷</span>
                  <span className="text-xs">Skarbonka</span>
                </button>
                <button className="flex flex-col items-center text-blue-500 hover:text-blue-700">
                  <span className="text-xl mb-1">📣</span>
                  <span className="text-xs">Promuj</span>
                </button>
                <button className="flex flex-col items-center text-blue-500 hover:text-blue-700">
                  <span className="text-xl mb-1">📤</span>
                  <span className="text-xs">Udostępnij</span>
                </button>
              </div>
              <div className="border-t border-gray-100">
                <button
                  onClick={() => setShowSmsSection(prev => !prev)}
                  className="w-full px-6 py-2 flex justify-between items-center text-sm text-gray-700 hover:bg-gray-50"
                >
                  <span>SMS</span>
                  <span>{showSmsSection ? '−' : '+'}</span>
                </button>
                {showSmsSection && (
                  <div className="px-6 py-2 text-xs text-gray-500">
                    Wyślij SMS "WPOMOC" na 7545 (5 zł + VAT).
                  </div>
                )}
              </div>
              <div className="border-t border-gray-100">
                <button
                  onClick={() => setShowTaxSection(prev => !prev)}
                  className="w-full px-6 py-2 flex justify-between items-center text-sm text-gray-700 hover:bg-gray-50"
                >
                  <span>1,5 % podatku</span>
                  <span>{showTaxSection ? '−' : '+'}</span>
                </button>
                {showTaxSection && (
                  <div className="px-6 py-2 text-xs text-gray-500 space-y-1">
                    <p>KRS 0000396361</p>
                    <p>Cel: 0768440 Adam</p>
                  </div>
                )}
              </div>
            </div>

            {/* Aktualności */}
            <div className="bg-white rounded-md shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-2xl font-semibold text-[#1F4E79]">
                  Aktualności
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Najnowsze informacje
                </p>
              </div>
              <div className="px-6 py-4 max-h-[300px] overflow-auto space-y-4">
                {updates.length === 0 && (
                  <p className="text-xs text-gray-400">
                    Brak aktualności.
                  </p>
                )}
                {updates.map((u, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 rounded-md p-3 border border-gray-100"
                  >
                    <p className="text-xs text-gray-700">{u.content}</p>
                    <p className="mt-1 text-[10px] text-gray-400">
                      {new Date(u.timestamp).toLocaleString('pl-PL')}
                    </p>
                  </div>
                ))}
              </div>
              {isOwner && (
                <div className="border-t border-gray-100 px-6 py-4 space-y-2">
                  <textarea
                    rows={3}
                    placeholder="Nowa aktualność..."
                    value={newUpdateText}
                    onChange={e => setNewUpdateText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1F4E79]"
                  />
                  <button
                    onClick={handleAddUpdate}
                    className="w-full py-2 text-base font-medium text-white bg-[#68CC89] hover:bg-[#5FBF7A] rounded-md"
                  >
                    Dodaj
                  </button>
                </div>
              )}
            </div>

            {/* Opis zbiórki */}
            <div className="bg-white rounded-md shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-2xl font-semibold text-[#1F4E79]">
                  Opis zbiórki
                </h2>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-gray-700">{description}</p>
                {location && (
                  <p className="mt-2 text-xs text-gray-500">
                    Lokalizacja: {location}
                  </p>
                )}
                {disease && (
                  <p className="mt-1 text-xs text-gray-500">
                    Choroba: {disease}
                  </p>
                )}
                {cause && (
                  <p className="mt-1 text-xs text-gray-500">
                    Cel: {cause}
                  </p>
                )}
              </div>
            </div>

            {/* Historia wpłat */}
            <div className="bg-white rounded-md shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-[#1F4E79]">
                  Historia wpłat
                </h2>
              </div>
              {donations.length === 0 && (
                <p className="px-6 py-4 text-xs text-gray-400">Brak wpłat.</p>
              )}
              {donations.length > 0 && (
                <ul className="divide-y divide-gray-100 max-h-[720px] overflow-auto">
                  {donations.map((d, idx) => (
                    <li key={idx} className="flex justify-between px-6 py-3">
                      <div>
                        <p className="text-sm text-gray-700">
                          {d.donor.slice(0, 6)}…{d.donor.slice(-4)}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(d.timestamp).toLocaleString('pl-PL')}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <p className="text-sm font-medium text-green-600">
                          {d.amount.toFixed(2)} {displayToken}
                        </p>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${d.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-blue-500 hover:underline"
                        >
                          Etherscan
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>

          {/* PRAWA KOLUMNA - desktop only */}
          <div className="hidden lg:flex lg:flex-col lg:space-y-6 lg:sticky lg:top-[175px]">

            {/* Desktop donate panel */}
            <div className="bg-white rounded-md shadow-sm overflow-hidden">
              <div className="px-6 py-4">
                <h1 className="text-2xl font-semibold text-[#1F4E79]">
                  {title}
                </h1>
              </div>
              <div className="px-6 pb-4">
                <p className="text-lg font-medium text-green-600">
                  {raised.toLocaleString('pl-PL')} {displayToken}{' '}
                  <span className="text-base font-normal text-gray-500">
                    ({progressPercent.toFixed(2)}%)
                  </span>
                </p>
                <div className="mt-2 w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-green-600 transition-width"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Brakuje {missing} {displayToken}
                </p>
              </div>
              <div className="px-6 mb-4">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Kwota w USDC"
                  value={donationInput}
                  onChange={e => setDonationInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1F4E79]"
                />
              </div>
              <div className="px-6 py-4">
                <DonateButton
                  campaignId={idNum}
                  donationAmount={donationInput}
                  className="w-full py-2 text-base font-medium text-white bg-[#68CC89] hover:bg-[#5FBF7A] rounded-md"
                >
                  Wesprzyj
                </DonateButton>
                <p className="mt-2 text-center text-xs text-gray-500">
                  Wsparło {uniqueDonorsCount.toLocaleString('pl-PL')} osób
                </p>
              </div>
              <div className="px-6 py-3 flex justify-between border-t border-gray-100">
                <button className="flex flex-col items-center text-blue-500 hover:text-blue-700">
                  <span className="text-xl mb-1">🐷</span>
                  <span className="text-xs">Skarbonka</span>
                </button>
                <button className="flex flex-col items-center text-blue-500 hover:text-blue-700">
                  <span className="text-xl mb-1">📣</span>
                  <span className="text-xs">Promuj</span>
                </button>
                <button className="flex flex-col items-center text-blue-500 hover:text-blue-700">
                  <span className="text-xl mb-1">📤</span>
                  <span className="text-xs">Udostępnij</span>
                </button>
              </div>
              <div className="border-t border-gray-100">
                <button
                  onClick={() => setShowSmsSection(prev => !prev)}
                  className="w-full px-6 py-2 flex justify-between items-center text-sm text-gray-700 hover:bg-gray-50"
                >
                  <span>SMS</span>
                  <span>{showSmsSection ? '−' : '+'}</span>
                </button>
                {showSmsSection && (
                  <div className="px-6 py-2 text-xs text-gray-500">
                    Wyślij SMS "WPOMOC" na 7545 (5 zł + VAT).
                  </div>
                )}
              </div>
              <div className="border-t border-gray-100">
                <button
                  onClick={() => setShowTaxSection(prev => !prev)}
                  className="w-full px-6 py-2 flex justify-between items-center text-sm text-gray-700 hover:bg-gray-50"
                >
                  <span>1,5 % podatku</span>
                  <span>{showTaxSection ? '−' : '+'}</span>
                </button>
                {showTaxSection && (
                  <div className="px-6 py-2 text-xs text-gray-500 space-y-1">
                    <p>KRS 0000396361</p>
                    <p>Cel: 0768440 Adam</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </>
  )
}
