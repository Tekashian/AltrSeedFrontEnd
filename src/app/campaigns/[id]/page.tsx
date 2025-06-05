// src/app/campaigns/[id]/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useReadContract } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { crowdfundContractConfig } from '../../../blockchain/contracts'
import { formatUnits } from 'ethers'
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

const USDC_TOKEN_ADDRESS_SEPOLIA =
  '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
const IPFS_GATEWAY_PREFIX = 'https://ipfs.io/ipfs/'
// placeholder dla testowych CID lub braku obrazu
const PLACEHOLDER_IMAGE = '/images/BanerAltrSeed.jpg'

// Formatuje wartość USDC (6 miejsc dziesiętnych) do 2 miejsc po przecinku
const formatUSDC = (amount: bigint): string => {
  const asString = formatUnits(amount, 6)   // "123.456789"
  const asNumber = Number(asString)         // 123.456789
  return asNumber.toFixed(2)                // "123.46"
}

export default function CampaignDetailPage() {
  const params = useParams()
  const idParam = params.id
  const idNum = Number(idParam)

  const { data, isLoading, error } = useReadContract({
    address: crowdfundContractConfig.address,
    abi: crowdfundContractConfig.abi,
    functionName: 'getCampaignDetails',
    args: [idNum],
    chainId: sepolia.id,
  })

  const [metadata, setMetadata] = useState<CampaignMetadata | null>(null)
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true)
  const [donationInput, setDonationInput] = useState('')

  // -----------------------------------------------------------------------------------
  // Fetch metadanych JSON z IPFS
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
          cause: meta.cause,
        })
      })
      .catch(() => {
        // Jeśli fetch się nie uda, zostawiamy metadata = null
      })
      .finally(() => setIsLoadingMetadata(false))
  }, [data])
  // -----------------------------------------------------------------------------------

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

  // -----------------------------------------------------------------------------------
  // Przygotowanie URL-a obrazka z IPFS (lub placeholder)
  const cid = campaign.dataCID.trim()
  const isTestCid = cid.startsWith('Test')
  let imageUrl: string
  if (!metadata?.image || isTestCid) {
    imageUrl = PLACEHOLDER_IMAGE
  } else if (metadata.image.startsWith('ipfs://')) {
    const raw = metadata.image.replace('ipfs://', '')
    imageUrl = `${IPFS_GATEWAY_PREFIX}${raw}`
  } else if (metadata.image.startsWith('http')) {
    imageUrl = metadata.image
  } else {
    imageUrl = `${IPFS_GATEWAY_PREFIX}${metadata.image}`
  }
  // -----------------------------------------------------------------------------------

  const description = metadata?.description || ''
  const location = metadata?.location
  const disease = metadata?.disease
  const cause = metadata?.cause

  // Procentowy postęp
  const progressPercent =
    campaign.targetAmount > 0n
      ? Number((campaign.raisedAmount * 10000n) / campaign.targetAmount) / 100
      : 0

  // Wyświetlana etykieta tokena
  const displayToken =
    campaign.acceptedToken.toLowerCase() ===
    USDC_TOKEN_ADDRESS_SEPOLIA.toLowerCase()
      ? 'USDC'
      : campaign.acceptedToken.slice(0, 6) + '…'

  return (
    <>
      <main className="container mx-auto p-6 bg-[#E0F0FF]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* ------------------------------------ */}
          {/* Lewa kolumna: duży obraz + opis kampanii */}
          <div>
            <div className="w-full rounded-lg overflow-hidden shadow-lg">
              <Image
                src={imageUrl}
                alt={title}
                width={800}
                height={600}
                className="object-cover w-full h-full"
                priority
              />
            </div>
            <p className="mt-4 text-gray-700">{description}</p>
          </div>
          {/* ------------------------------------ */}

          {/* ------------------------------------ */}
          {/* Prawa kolumna: STICKY, z top-20, bg i z-index, żeby nie chowała się pod header */}
          <div className="flex flex-col sticky top-50 z-10 bg-[#E0F0FF] pt-2 pb-4">
            {/* Tytuł kampanii */}
            <h1 className="text-4xl font-bold text-[#1F4E79] px-4 mb-4">
              {title}
            </h1>

            {/* Pasek postępu */}
            <div className="px-4 pb-2">
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className="h-4 rounded-full bg-[#00ADEF] transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Kwoty w USDC */}
            <p className="text-2xl font-semibold text-[#1F4E79] mb-4 px-4">
              {formatUSDC(campaign.raisedAmount)} {displayToken}
              {' / '}
              {formatUSDC(campaign.targetAmount)} {displayToken}
              {' '}({progressPercent.toFixed(2)}%)
            </p>

            {/* Pole na wpisanie kwoty */}
            <div className="px-4 mb-4">
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Kwota w USDC"
                value={donationInput}
                onChange={(e) => setDonationInput(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>

            {/* Przycisk Support (Donate) */}
            <div className="px-4 mb-8">
              <DonateButton
                campaignId={idNum}
                donationAmount={donationInput}
                className="w-full py-4 text-lg font-semibold text-white bg-[#68CC89] hover:bg-[#5fbf7a] rounded-lg transition"
              >
                Support
              </DonateButton>
            </div>

            {/* Dodatkowe dane kampanii */}
            <div className="border-t border-gray-300 pt-6 space-y-4 text-[#1F4E79] px-4">
              <p>
                <strong>Rozpoczęcie:</strong>{' '}
                {new Date(Number(campaign.creationTimestamp) * 1000).toLocaleDateString(
                  'pl-PL'
                )}
              </p>
              <p>
                <strong>Zakończenie:</strong>{' '}
                {new Date(Number(campaign.endTime) * 1000).toLocaleDateString('pl-PL')}
              </p>
              {location && (
                <p>
                  <strong>Lokalizacja:</strong> {location}
                </p>
              )}
              {disease && (
                <p>
                  <strong>Choroba:</strong> {disease}
                </p>
              )}
              {cause && (
                <p>
                  <strong>Cel zbiórki:</strong> {cause}
                </p>
              )}
            </div>
          </div>
          {/* ------------------------------------ */}
        </div>
      </main>

      <Footer />
    </>
  )
}
