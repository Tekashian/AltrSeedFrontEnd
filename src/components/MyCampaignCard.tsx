// src/components/MyCampaignCard.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { type Campaign } from '../hooks/useCrowdfund'

// Importujemy przyciski jako oddzielne komponenty
import CloseCampaignButton from './CloseCampaignButton'
import WithdrawButton from './WithdrawButton'
import RefundButton from './RefundButton'

interface MyCampaignCardProps {
  campaign: Campaign
  hasReclaimedMap: Record<number, boolean>
  onInitiateClosure: (campaignId: number) => Promise<void>
  onWithdraw: (campaignId: number, dataCID: string) => Promise<void>
  onClaimRefund: (campaignId: number) => Promise<void>
}

interface CampaignMetadata {
  title: string
  description: string
  image?: string
}

// Stałe pomocnicze
const USDC_TOKEN_ADDRESS_SEPOLIA =
  '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
const IPFS_GATEWAY_PREFIX = 'https://ipfs.io/ipfs/'
const PLACEHOLDER_IMAGE = '/images/BanerAltrSeed.jpg'

// Pomocnicze formatowanie
const getCampaignStatusText = (status: number): string => {
  switch (status) {
    case 0:
      return 'Aktywna'
    case 1:
      return 'Zakończona'
    case 2:
      return 'Zamykanie'
    case 5:
      return 'Nieudana'
    default:
      return `Status (${status})`
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

const MyCampaignCard: React.FC<MyCampaignCardProps> = ({
  campaign,
  hasReclaimedMap,
  onInitiateClosure,
  onWithdraw,
  onClaimRefund
}) => {
  const router = useRouter()
  const { address } = useAccount()
  const [metadata, setMetadata] = useState<CampaignMetadata | null>(null)
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  const cid = campaign.dataCID.trim() || ''
  const idx = campaign.campaignId ?? 0

  // --- Pobieranie metadanych z IPFS ---
  useEffect(() => {
    setIsLoadingMetadata(true)
    setMetadata(null)
    if (!cid) {
      setIsLoadingMetadata(false)
      return
    }
    fetch(`${IPFS_GATEWAY_PREFIX}${cid}`)
      .then((res) => {
        if (!res.ok) throw new Error(`IPFS error ${res.status}`)
        return res.json()
      })
      .then((data: any) => {
        if (
          typeof data.title === 'string' &&
          typeof data.description === 'string'
        ) {
          setMetadata({
            title: data.title,
            description: data.description,
            image: data.image,
          })
        }
      })
      .catch(() => {
        /* ignorujemy błędy */
      })
      .finally(() => setIsLoadingMetadata(false))
  }, [cid])

  // --- Obliczamy postęp kampanii ---
  const progress =
    campaign.targetAmount > BigInt(0)
      ? Number((campaign.raisedAmount * BigInt(10000)) / campaign.targetAmount) / 100
      : 0

  // Skrót tokena (USDC lub adres)
  const displayToken =
    campaign.acceptedToken.toLowerCase() ===
    USDC_TOKEN_ADDRESS_SEPOLIA.toLowerCase()
      ? 'USDC'
      : campaign.acceptedToken.slice(0, 6) + '…'

  // Budujemy tytuł/ opis
  const title = isLoadingMetadata
    ? 'Ładowanie…'
    : metadata?.title || `Kampania #${idx + 1}`

  const fullDescription = isLoadingMetadata
    ? 'Ładowanie…'
    : metadata?.description || `CID: ${cid}`

  const description =
    fullDescription.length > 100
      ? fullDescription.slice(0, 100) + '…'
      : fullDescription

  const statusText = getCampaignStatusText(campaign.status)

  // Budujemy URL do obrazka (banera)
  let finalImageUrl: string
  const isTestCid = cid.startsWith('Test')
  if (!metadata?.image || isTestCid) {
    finalImageUrl = PLACEHOLDER_IMAGE
  } else if (metadata.image.startsWith('ipfs://')) {
    finalImageUrl = `${IPFS_GATEWAY_PREFIX}${metadata.image.replace(
      'ipfs://',
      ''
    )}`
  } else if (metadata.image.startsWith('http')) {
    finalImageUrl = metadata.image
  } else {
    finalImageUrl = `${IPFS_GATEWAY_PREFIX}${metadata.image}`
  }

  // Sprawdzamy, jakie przyciski pokazać:
  const [showCloseButton, setShowCloseButton] = useState(false)
  const [showWithdrawButton, setShowWithdrawButton] = useState(false)
  const [showRefundButton, setShowRefundButton] = useState(false)

  useEffect(() => {
    const nowSec = Math.floor(Date.now() / 1000)

    const endTimeNumber =
      typeof campaign.endTime === 'bigint'
        ? Number(campaign.endTime)
        : campaign.endTime ?? 0

    const isActive = campaign.status === 0       // 0 = Active
    const isCompleted = campaign.status === 1    // 1 = Completed
    const isClosing = campaign.status === 2      // 2 = Closing
    const isFailed = campaign.status === 5       // 5 = Failed
    const isCreator =
      address?.toLowerCase() === campaign.creator.toLowerCase()
    const hasDonorReclaimed = hasReclaimedMap[campaign.campaignId]

    // 1) Jeśli status = Completed i jesteś twórcą → pokaż „Wypłać”
    if (isCompleted && isCreator) {
      setShowWithdrawButton(true)
      setShowCloseButton(false)
      setShowRefundButton(false)
      return
    }

    // 2) Jeśli status = Active i jesteś twórcą → pokaż „Zamknij kampanię”
    if (isActive && isCreator) {
      setShowCloseButton(true)
      setShowWithdrawButton(false)
      setShowRefundButton(false)
      return
    }

    // 3) Jeśli status = Closing:
    if (isClosing) {
      const reclaimDeadline =
        typeof campaign.reclaimDeadline === 'bigint'
          ? Number(campaign.reclaimDeadline)
          : campaign.reclaimDeadline ?? 0

      // 3a) Darczyńca może refundować, jeżeli okres zwrotu jeszcze trwa:
      if (!isCreator && nowSec < reclaimDeadline && !hasDonorReclaimed) {
        setShowRefundButton(true)
        setShowCloseButton(false)
        setShowWithdrawButton(false)
        return
      }

      // 3b) Twórca może wypłacić dopiero po upływie reclaimDeadline:
      if (isCreator && nowSec >= reclaimDeadline) {
        setShowWithdrawButton(true)
        setShowCloseButton(false)
        setShowRefundButton(false)
        return
      }

      // Pozostałe przypadki → nic nie wyświetlamy (np. darczyńca po reclaimDeadline)
      setShowCloseButton(false)
      setShowWithdrawButton(false)
      setShowRefundButton(false)
      return
    }

    // 4) Jeśli status = Failed (nieudana, po wywołaniu failCampaignIfUnsuccessful):
    if (isFailed) {
      // 4a) Darczyńca może refundować, jeśli jeszcze nie zrefundował
      if (!isCreator && !hasDonorReclaimed) {
        setShowRefundButton(true)
        setShowCloseButton(false)
        setShowWithdrawButton(false)
        return
      }

      // 4b) Twórca może wypłacić pozostałe, jeśli pozostały środki > 0:
      if (isCreator && Number(campaign.raisedAmount) > 0) {
        setShowWithdrawButton(true)
        setShowCloseButton(false)
        setShowRefundButton(false)
        return
      }

      // W innych przypadkach – nic nie pokazujemy
      setShowCloseButton(false)
      setShowWithdrawButton(false)
      setShowRefundButton(false)
      return
    }

    // W każdym innym wypadku (np. Active bez roli twórcy) – chowamy wszystko
    setShowCloseButton(false)
    setShowWithdrawButton(false)
    setShowRefundButton(false)

  }, [campaign, address, hasReclaimedMap])

  return (
    <div
      className="group bg-white rounded-xl shadow-lg hover:shadow-[0_0_35px_5px_rgba(0,255,255,0.3)]
                 transition-all duration-300 ease-in-out transform hover:scale-105
                 overflow-visible cursor-pointer relative"
      onClick={() => router.push(`/campaigns/${idx + 1}`)}
    >
      {/* --- opcjonalne menu rozwijane --- */}
      <div className="absolute top-2 right-2">
        <button
          className="p-1 rounded-full hover:bg-gray-200"
          onClick={(e) => {
            e.stopPropagation()
            setMenuOpen(!menuOpen)
          }}
        >
          <span className="block w-1 h-1 bg-gray-800 rounded-full mb-0.5" />
          <span className="block w-1 h-1 bg-gray-800 rounded-full mb-0.5" />
          <span className="block w-1 h-1 bg-gray-800 rounded-full" />
        </button>
        {menuOpen && (
          <div className="mt-1 bg-white border border-gray-300 rounded shadow-md text-sm text-gray-800">
            <button
              className="block w-full text-left px-3 py-1 hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation()
                alert('Zgłoś kampanię')
              }}
            >
              Zgłoś kampanię
            </button>
            <button
              className="block w-full text-left px-3 py-1 hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation()
                alert('Inna opcja')
              }}
            >
              Inna opcja
            </button>
          </div>
        )}
      </div>

      {/* --- banner --- */}
      <div className="relative w-full h-56 md:h-64 overflow-hidden">
        <Image
          src={finalImageUrl}
          alt={title}
          fill
          className="object-cover"
          priority
          onClick={(e) => e.stopPropagation()}
        />
        <span
          className="absolute top-2 left-2 bg-white bg-opacity-70
                         text-xs font-semibold text-gray-800 px-2 py-1 rounded"
        >
          {statusText}
        </span>
      </div>

      {/* --- content --- */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
          {title}
        </h3>
        <p className="text-sm text-gray-700 mb-4">{description}</p>
        <div className="flex items-center justify-between text-sm text-gray-800 mb-2">
          <span className="font-semibold">Zebrano:</span>{' '}
          <span>
            {formatAmount(campaign.raisedAmount)} {displayToken}
          </span>
          <span className="font-semibold">Cel:</span>{' '}
          <span>
            {formatAmount(campaign.targetAmount)} {displayToken}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className="h-2 rounded-full bg-green-500 transition-all"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-600">
          {progress.toFixed(2)}% zebranych
        </p>
      </div>

      {/* --- Sekcja przycisków --- */}
      <div className="p-4 flex justify-center border-t border-gray-100">
        <div onClick={(e) => e.stopPropagation()}>
          {showWithdrawButton ? (
            <WithdrawButton
              campaignId={idx + 1}
              className="px-6 py-3 bg-green-500 text-white text-lg font-semibold rounded-lg hover:bg-green-600 transition"
              onClick={() => onWithdraw(idx, cid)}
            >
              Wypłać
            </WithdrawButton>
          ) : showCloseButton ? (
            <CloseCampaignButton
              campaignId={idx + 1}
              className="px-6 py-3 bg-orange-500 text-white text-lg font-semibold rounded-lg hover:bg-orange-600 transition"
              onClick={() => onInitiateClosure(idx)}
            >
              Rozpocznij zamknięcie
            </CloseCampaignButton>
          ) : showRefundButton ? (
            <RefundButton
              campaignId={idx + 1}
              className="px-6 py-3 bg-red-500 text-white text-lg font-semibold rounded-lg hover:bg-red-600 transition"
              onClick={() => onClaimRefund(idx)}
            >
              Zwróć wpłatę
            </RefundButton>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default MyCampaignCard
