// src/components/CampaignCard.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { type Campaign } from '../hooks/useCrowdfund'

interface CampaignCardProps {
  campaign: Campaign
}

const USDC_TOKEN_ADDRESS_SEPOLIA = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
const IPFS_GATEWAY_PREFIX = 'https://ipfs.io/ipfs/'
// placeholder dla testowych kampanii lub braku obrazu
const PLACEHOLDER_IMAGE = '/images/BanerAltrSeed.jpg'

interface CampaignMetadata {
  title: string
  description: string
  image?: string
}

const getCampaignStatusText = (status: number): string => {
  switch (status) {
    case 0: return 'Aktywna'
    case 1: return 'Zakończona'
    case 2: return 'Nieudana'
    case 3: return 'Zamykanie'
    case 4: return 'Zamknięta'
    default: return `Status (${status})`
  }
}

const formatAmount = (
  amount: bigint | undefined | null,
  decimals: number = 6
): string => {
  if (typeof amount !== 'bigint') return '0.00'
  const divisor = BigInt(10) ** BigInt(decimals)
  const integerPart = amount / divisor
  const fractionalPart = amount % divisor
  const frac = fractionalPart
    .toString()
    .padStart(decimals, '0')
    .slice(0, 2)
  return `${integerPart}.${frac}`
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  const router = useRouter()
  const { address } = useAccount()
  const [metadata, setMetadata] = useState<CampaignMetadata | null>(null)
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  // Stałe
  const cid = campaign.dataCID.trim() || ''
  const idx = campaign.campaignId ?? 0

  // Pobierz metadane z IPFS
  useEffect(() => {
    setIsLoadingMetadata(true)
    setMetadata(null)
    if (!cid) {
      setIsLoadingMetadata(false)
      return
    }
    fetch(`${IPFS_GATEWAY_PREFIX}${cid}`)
      .then(res => {
        if (!res.ok) throw new Error(`IPFS error ${res.status}`)
        return res.json()
      })
      .then((data: any) => {
        if (typeof data.title === 'string' && typeof data.description === 'string') {
          setMetadata({
            title: data.title,
            description: data.description,
            image: data.image
          })
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingMetadata(false))
  }, [cid])

  const progress =
    campaign.targetAmount > BigInt(0)
      ? Number((campaign.raisedAmount * BigInt(10000)) / campaign.targetAmount) / 100
      : 0

  const displayToken =
    campaign.acceptedToken.toLowerCase() === USDC_TOKEN_ADDRESS_SEPOLIA.toLowerCase()
      ? 'USDC'
      : campaign.acceptedToken.slice(0, 6) + '…'

  const title = isLoadingMetadata
    ? 'Ładowanie…'
    : metadata?.title || `Kampania #${idx + 1}`

  const fullDescription = isLoadingMetadata
    ? 'Ładowanie…'
    : metadata?.description || `CID: ${cid}`

  const description = fullDescription.length > 100
    ? fullDescription.slice(0, 100)
    : fullDescription

  const statusText = getCampaignStatusText(campaign.status)

  // Czy to testowy CID?
  const isTestCid = cid.startsWith('Test')
  // Przygotuj końcowy URL do obrazka
  let finalImageUrl: string
  if (!metadata?.image || isTestCid) {
    finalImageUrl = PLACEHOLDER_IMAGE
  } else if (metadata.image.startsWith('ipfs://')) {
    finalImageUrl = `${IPFS_GATEWAY_PREFIX}${metadata.image.replace('ipfs://', '')}`
  } else if (metadata.image.startsWith('http')) {
    finalImageUrl = metadata.image
  } else {
    finalImageUrl = `${IPFS_GATEWAY_PREFIX}${metadata.image}`
  }

  return (
    <div
      className="group bg-white rounded-xl shadow-lg hover:shadow-[0_0_35px_5px_rgba(0,255,255,0.3)] transition-all duration-300 ease-in-out transform hover:scale-105 overflow-visible cursor-pointer relative"
      onClick={() => router.push(`/campaigns/${idx + 1}`)}
      style={{ minHeight: '500px' }}
    >
      {/* Małe menu w prawym górnym rogu */}
      <div className="absolute top-2 right-2">
        <button
          className="p-1 rounded-full hover:bg-gray-200"
          onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
        >
          <span className="block w-1 h-1 bg-gray-800 rounded-full mb-0.5"></span>
          <span className="block w-1 h-1 bg-gray-800 rounded-full mb-0.5"></span>
          <span className="block w-1 h-1 bg-gray-800 rounded-full"></span>
        </button>
        {menuOpen && (
          <div className="mt-1 bg-white border border-gray-300 rounded shadow-md text-sm text-gray-800">
            <button
              className="block w-full text-left px-3 py-1 hover:bg-gray-100"
              onClick={e => { e.stopPropagation(); alert('Zgłoś kampanię') }}
            >
              Zgłoś kampanię
            </button>
            <button
              className="block w-full text-left px-3 py-1 hover:bg-gray-100"
              onClick={e => { e.stopPropagation(); alert('Inna opcja') }}
            >
              Inna opcja
            </button>
          </div>
        )}

      </div>

      {/* Baner + status */}
      <div className="relative w-full h-[306px] md:h-[338px] overflow-hidden">
        <Image
          src={finalImageUrl}
          alt={title}
          fill
          className="object-cover"
          priority
          onClick={e => e.stopPropagation()}
        />
        <span className="absolute top-2 left-2 bg-white bg-opacity-70 text-xs font-semibold text-gray-800 px-2 py-1 rounded">
          {statusText}
        </span>
      </div>

      {/* Treść */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{title}</h3>
        <p className="text-sm text-gray-700 mb-4">{description}{metadata?.description && metadata.description.length > 100 ? '…' : ''}</p>
        <div className="flex items-center justify-between text-sm text-gray-800 mb-2">
          <span className="font-semibold">Zebrano:</span> <span>{formatAmount(campaign.raisedAmount)} {displayToken}</span>
          <span className="font-semibold">Cel:</span> <span>{formatAmount(campaign.targetAmount)} {displayToken}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div className="h-2 rounded-full bg-green-500 transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
        <p className="text-xs text-gray-600">{progress.toFixed(2)}% zebranych</p>
      </div>
    </div>
  )
}

export default CampaignCard
