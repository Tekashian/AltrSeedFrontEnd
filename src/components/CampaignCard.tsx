// src/components/CampaignCard.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useAccount } from 'wagmi'
import { type Campaign } from '../hooks/useCrowdfund'
import DonateButton from './DonateButton'
import RefundButton from './RefundButton'

interface CampaignCardProps {
  campaign: Campaign
}

const USDC_TOKEN_ADDRESS_SEPOLIA = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
const IPFS_GATEWAY_PREFIX = 'https://ipfs.io/ipfs/'

interface CampaignMetadata {
  title: string
  description: string
  image?: string
}

const getCampaignStatusText = (status: number): string => {
  switch (status) {
    case 0:
      return 'Aktywna'
    case 1:
      return 'Zakończona'
    case 2:
      return 'Nieudana'
    case 3:
      return 'Zamykanie'
    case 4:
      return 'Zamknięta'
    default:
      return `Status (${status})`
  }
}

const getCampaignTypeText = (campaignType: number): string => {
  switch (campaignType) {
    case 0:
      return 'Startup'
    case 1:
      return 'Charytatywna'
    default:
      return `Typ (${campaignType})`
  }
}

const formatAmount = (amount: bigint | undefined | null, decimals: number = 6): string => {
  if (typeof amount !== 'bigint') return '0.00'
  const divisor = BigInt(10) ** BigInt(decimals)
  const integerPart = amount / divisor
  const fractionalPart = amount % divisor
  const frac = fractionalPart.toString().padStart(decimals, '0').slice(0, 2)
  return `${integerPart}.${frac}`
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  const { address } = useAccount()
  const [metadata, setMetadata] = useState<CampaignMetadata | null>(null)
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true)
  const [metadataError, setMetadataError] = useState<string | null>(null)
  const [donationInput, setDonationInput] = useState('')

  // Wyciągamy CID i ID do stałych,
  // żeby tablica zależności miała zawsze tę samą długość
  const cid = campaign.dataCID.trim() || ''
  const idx = campaign.campaignId ?? 0

  useEffect(() => {
    setIsLoadingMetadata(true)
    setMetadata(null)
    setMetadataError(null)

    if (!cid) {
      setMetadataError('Brak identyfikatora CID.')
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
          setMetadata({ title: data.title, description: data.description })
        } else {
          setMetadataError('Niekompletne metadane z IPFS.')
        }
      })
      .catch(() => {
        setMetadataError('Błąd pobierania metadanych.')
      })
      .finally(() => {
        setIsLoadingMetadata(false)
      })
  }, [cid, idx]) // <-- zawsze dwa elementy

  const progress = campaign.targetAmount > 0n
    ? Number((campaign.raisedAmount * 10000n) / campaign.targetAmount) / 100
    : 0

  const displayToken = campaign.acceptedToken.toLowerCase() === USDC_TOKEN_ADDRESS_SEPOLIA.toLowerCase()
    ? 'USDC'
    : campaign.acceptedToken.slice(0, 6) + '…'

  const title = isLoadingMetadata
    ? 'Ładowanie tytułu…'
    : metadata?.title || `Kampania #${idx}`

  const description = isLoadingMetadata
    ? 'Ładowanie opisu…'
    : metadata?.description || metadataError || ''

  const statusStyles: Record<number, { text: string; border: string; bg: string }> = {
    0: { text: 'text-teal-400', border: 'border-teal-400', bg: 'bg-teal-500/10' },
    1: { text: 'text-green-400', border: 'border-green-400', bg: 'bg-green-500/10' },
    2: { text: 'text-red-400', border: 'border-red-400', bg: 'bg-red-500/10' },
    3: { text: 'text-amber-400', border: 'border-amber-400', bg: 'bg-amber-500/10' },
    4: { text: 'text-slate-400', border: 'border-slate-500', bg: 'bg-slate-500/10' },
  }
  const style = statusStyles[campaign.status] || statusStyles[0]

  return (
    <div className="group bg-[#1E1B2E] rounded-xl shadow-lg
                    hover:shadow-[0_0_35px_5px_rgba(0,255,255,0.3)]
                    transition-all duration-300 ease-in-out transform
                    hover:scale-105 flex flex-col overflow-hidden
                    border border-transparent hover:border-teal-500/50 m-3">
      <div className="relative w-full h-56 md:h-64 overflow-hidden">
        <Image
          src="/images/BanerAltrSeed.jpg"
          alt="Banner"
          fill
          className="object-cover"
          priority
        />
        <span className={`absolute top-3 right-3 px-2 py-1 text-xs font-semibold rounded-full border ${style.border} ${style.text} ${style.bg}`}>
          {getCampaignStatusText(campaign.status)}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-white mb-2 truncate">{title}</h3>
        <div className="text-xs text-slate-400 mb-3">
          Typ:{' '}
          <span className="font-medium text-slate-300">
            {getCampaignTypeText(campaign.campaignType)}
          </span>
        </div>

        <p className="text-sm text-slate-300 mb-4 overflow-y-auto leading-relaxed flex-grow">
          {description}
        </p>

        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>
              Zebrano:{' '}
              <span className="font-semibold text-teal-400">
                {formatAmount(campaign.raisedAmount)} {displayToken}
              </span>
            </span>
            <span>
              Cel:{' '}
              <span className="font-semibold text-white">
                {formatAmount(campaign.targetAmount)} {displayToken}
              </span>
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500 ease-out bg-teal-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-right text-slate-400 mt-1">{progress.toFixed(2)}% zebranych</p>
        </div>

        <div className="border-t border-slate-700/50 pt-3 mt-auto text-xs text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>
              Kreator:{' '}
              <code className="text-slate-300">
                {campaign.creator.slice(0, 6)}…{campaign.creator.slice(-4)}
              </code>
            </span>
            <span>
              Token:{' '}
              <span className="font-semibold text-slate-300">{displayToken}</span>
            </span>
          </div>
          <div>
            Zakończenie:{' '}
            <span className="text-slate-300">
              {new Date(Number(campaign.endTime) * 1000).toLocaleDateString('pl-PL')}
            </span>
          </div>
          {campaign.reclaimDeadline > 0n && (
            <div className="text-amber-400">
              Zwrot do:{' '}
              <span className="text-amber-300">
                {new Date(Number(campaign.reclaimDeadline) * 1000).toLocaleDateString('pl-PL')}
              </span>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-col space-y-3">
          <input
            type="number"
            min="0"
            placeholder="Kwota USDC"
            value={donationInput}
            onChange={e => setDonationInput(e.target.value)}
            className="w-full px-3 py-2 rounded border border-slate-600 bg-slate-800 text-white text-sm"
          />

          <DonateButton campaignId={idx + 1} donationAmount={donationInput} />
          <RefundButton campaignId={idx + 1} />
        </div>
      </div>
    </div>
  )
}

export default CampaignCard
