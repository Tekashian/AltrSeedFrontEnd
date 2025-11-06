// src/components/MyDonationCard.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { type Campaign } from '../hooks/useCrowdfund'
import RefundButton from './RefundButton'

interface MyDonationCardProps {
  campaign: Campaign & { donatedAmount: number }
}

interface CampaignMetadata {
  title: string
  description: string
  image?: string
}

const IPFS_GATEWAY_PREFIX = 'https://ipfs.io/ipfs/'
const PLACEHOLDER_IMAGE = '/images/BanerAltrSeed.jpg'

export default function MyDonationCard({
  campaign
}: MyDonationCardProps) {
  const router = useRouter()
  const { address } = useAccount()

  const [metadata, setMetadata] = useState<CampaignMetadata | null>(null)
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true)

  const cid = campaign.dataCID.trim() || ''
  const idx = campaign.campaignId ?? 0

  // Fetch metadata from IPFS
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
        if (
          typeof data.title === 'string' &&
          typeof data.description === 'string'
        ) {
          setMetadata({
            title: data.title,
            description: data.description,
            image: data.image
          })
        }
      })
      .catch(() => {
        /* ignore errors */
      })
      .finally(() => {
        setIsLoadingMetadata(false)
      })
  }, [cid])

  // Prepare title and description
  const title = isLoadingMetadata
    ? 'Ładowanie…'
    : metadata?.title || `Kampania #${idx + 1}`

  const fullDescription = isLoadingMetadata
    ? 'Ładowanie…'
    : metadata?.description || `CID: ${cid}`

  const description =
    fullDescription.length > 100
      ? `${fullDescription.slice(0, 100)}…`
      : fullDescription

  // Resolve image URL
  let finalImageUrl = PLACEHOLDER_IMAGE
  if (metadata?.image) {
    if (metadata.image.startsWith('ipfs://')) {
      finalImageUrl = `${IPFS_GATEWAY_PREFIX}${metadata.image.replace(
        'ipfs://',
        ''
      )}`
    } else if (metadata.image.startsWith('http')) {
      finalImageUrl = metadata.image
    } else {
      finalImageUrl = `${IPFS_GATEWAY_PREFIX}${metadata.image}`
    }
  }

  return (
    <div
      className="
        group
        bg-white
        rounded-xl
        shadow-lg
        hover:shadow-[0_0_35px_5px_rgba(0,255,255,0.3)]
        transition-all
        duration-300
        ease-in-out
        transform
        hover:scale-105
        overflow-visible
        cursor-pointer
        relative
      "
      onClick={() => router.push(`/campaigns/${idx + 1}`)}
    >
      {/* Header Image */}
      <div className="relative w-full h-56 md:h-64 overflow-hidden">
        <Image
          src={finalImageUrl}
          alt={title}
          fill
          className="object-cover"
          priority
          onClick={e => e.stopPropagation()}
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2 truncate">{title}</h3>
        <p className="text-sm text-gray-700 mb-4">{description}</p>
        <p className="font-semibold mb-2">
          Wpłaciłeś:{' '}
          {(campaign.donatedAmount / 10 ** 6).toFixed(2)} USDC
        </p>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-100 flex justify-center">
        <div onClick={e => e.stopPropagation()}>
          <RefundButton campaignId={idx + 1} refundAmount="0" />
        </div>
      </div>
    </div>
  )
}
