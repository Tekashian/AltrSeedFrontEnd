// src/app/campaigns/[id]/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useReadContract } from 'wagmi'
import { sepolia } from '@reown/appkit/networks'
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

  const [metadata, setMetadata] = useState<CampaignMetadata | null>(null)
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true)
  const [donationInput, setDonationInput] = useState('')
  const [donations, setDonations] = useState<DonationLog[]>([])
  const [showSmsSection, setShowSmsSection] = useState(false)
  const [showTaxSection, setShowTaxSection] = useState(false)
  const [uniqueDonorsCount, setUniqueDonorsCount] = useState(0)

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

  // -----------------------------------------------------------------------------------
  // Pobierz logi dotacji (DonationReceived) i wylicz unikalną liczbę darczyńców
  useEffect(() => {
    if (!data) return
    if (typeof window === 'undefined') return

    const fetchDonationLogs = async () => {
      try {
        // Użyj BrowserProvider opakowanego w window.ethereum
        const ethersProvider = new BrowserProvider((window as any).ethereum, sepolia.id)
        const cfContract = new Contract(
          crowdfundContractConfig.address,
          crowdfundContractConfig.abi,
          ethersProvider
        )

        // Filtruj logi DonationReceived(campaignId, donor=null)
        const rawLogs = await cfContract.queryFilter(
          cfContract.filters.DonationReceived(idNum, null)
        )

        // Przetwórz logi na tablicę DonationLog
        const parsedLogs: DonationLog[] = rawLogs.map((log: any) => {
          const { donor, amountToCampaign, timestamp } = log.args!
          return {
            donor: donor.toLowerCase(),
            amount: Number(amountToCampaign) / 10 ** 6,
            timestamp: Number(timestamp) * 1000,
          }
        })

        // Posortuj od najnowszych
        parsedLogs.sort((a, b) => b.timestamp - a.timestamp)

        setDonations(parsedLogs)

        // Oblicz liczbę unikalnych darczyńców
        const uniqueDonors = new Set(parsedLogs.map((d) => d.donor))
        setUniqueDonorsCount(uniqueDonors.size)
      } catch (err) {
        console.error('Błąd pobierania logów dotacji:', err)
      }
    }

    fetchDonationLogs()
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

  // Obliczenia dla panelu: ile zebrano, ile brakuje
  const raised = Number(formatUnits(campaign.raisedAmount, 6))
  const target = Number(formatUnits(campaign.targetAmount, 6))
  const missing = (target - raised).toFixed(2)

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
          {/* Prawa kolumna: STICKY z top-50, dwie kolumny (podsumowanie + historia) */}
          <div className="sticky top-50 z-10 flex flex-row space-x-4 px-2">
            {/* ---------------- */}
            {/* Panel 1: tytuł, podsumowanie, input i przycisk */}
            <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden">
              {/* Tytuł kampanii */}
              <div className="px-6 py-4 bg-white">
                <h1 className="text-2xl font-bold text-[#1F4E79] leading-snug">
                  {title}
                </h1>
              </div>

              {/* Górna część panelu – zebrano / brakująca kwota */}
              <div className="px-6 pb-4">
                <p className="text-xl font-semibold text-green-600">
                  {raised.toLocaleString('pl-PL')} {displayToken}{' '}
                  <span className="text-lg font-normal text-gray-500">
                    ({progressPercent.toFixed(2)}%)
                  </span>
                </p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-green-600 transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Brakuje {missing} {displayToken}
                </p>
              </div>

              {/* Pole na wpisanie kwoty dotacji */}
              <div className="px-6 mb-4">
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

              {/* Duży przycisk "Wesprzyj" */}
              <div className="px-6 py-4">
                <DonateButton
                  campaignId={idNum}
                  donationAmount={donationInput}
                  className="w-full py-3 text-lg font-semibold text-white bg-[#68CC89] hover:bg-[#5FBF7A] rounded-lg transition"
                >
                  Wesprzyj
                </DonateButton>
                <p className="mt-2 text-center text-sm text-gray-500">
                  Wsparło {uniqueDonorsCount.toLocaleString('pl-PL')} osób
                </p>
              </div>

              {/* Ikony podziału: Załóż skarbonkę / Promuj / Udostępnij */}
              <div className="px-6 py-3 flex justify-between border-t border-gray-200 bg-white">
                <button className="flex flex-col items-center text-blue-500 hover:text-blue-700 transition">
                  <span className="text-2xl mb-1">🐷</span>
                  <span className="text-xs">Załóż skarbonkę</span>
                </button>
                <button className="flex flex-col items-center text-blue-500 hover:text-blue-700 transition">
                  <span className="text-2xl mb-1">📣</span>
                  <span className="text-xs">Promuj</span>
                </button>
                <button className="flex flex-col items-center text-blue-500 hover:text-blue-700 transition">
                  <span className="text-2xl mb-1">📤</span>
                  <span className="text-xs">Udostępnij</span>
                </button>
              </div>

              {/* Sekcja: "Wpłać, wysyłając SMS" */}
              <div className="border-t border-gray-200 bg-white">
                <button
                  onClick={() => setShowSmsSection((prev) => !prev)}
                  className="w-full px-6 py-3 flex justify-between items-center text-gray-700 hover:bg-gray-50 transition"
                >
                  <span className="text-sm">Wpłać, wysyłając SMS</span>
                  <span className="text-lg">{showSmsSection ? '−' : '+'}</span>
                </button>
                {showSmsSection && (
                  <div className="px-6 pb-4 pt-2 text-gray-600 text-sm">
                    <p>
                      Wyślij SMS o treści <strong>WPOMOC</strong> na numer{' '}
                      <strong>7545</strong>, aby przekazać 5 zł.
                    </p>
                    <p className="mt-1">Koszt SMS-a: 5 zł + VAT.</p>
                  </div>
                )}
              </div>

              {/* Sekcja: "Przekaż mi 1,5% podatku" */}
              <div className="border-t border-gray-200 bg-white">
                <button
                  onClick={() => setShowTaxSection((prev) => !prev)}
                  className="w-full px-6 py-3 flex justify-between items-center text-gray-700 hover:bg-gray-50 transition"
                >
                  <span className="text-sm">Przekaż mi 1,5% podatku</span>
                  <span className="text-lg">{showTaxSection ? '−' : '+'}</span>
                </button>
                {showTaxSection && (
                  <div className="px-6 pb-4 pt-2 text-gray-600 text-sm space-y-1">
                    <p>
                      <strong>Numer KRS:</strong> <span className="text-red-600">0000396361</span>
                    </p>
                    <p>
                      <strong>Cel szczegółowy 1,5%:</strong>{' '}
                      <span className="text-red-600">0768440 Adam</span>
                    </p>
                    <p className="underline text-blue-500 hover:text-blue-700 transition cursor-pointer">
                      Sprawdź, jak przekazać 1,5% podatku →
                    </p>
                    <p className="underline text-blue-500 hover:text-blue-700 transition cursor-pointer">
                      Ustaw przypomnienie o przekazaniu 1,5% →
                    </p>
                  </div>
                )}
              </div>
            </div>
            {/* ---------------- */}

            {/* ---------------- */}
            {/* Panel 2: Historia wspierających */}
            <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-[#1F4E79]">
                  Historia wpłat
                </h2>
              </div>
              {donations.length === 0 && (
                <p className="px-6 py-4 text-sm text-gray-500">Brak wpłat.</p>
              )}
              {donations.length > 0 && (
                <ul className="divide-y divide-gray-200 max-h-[720px] overflow-auto">
                  {donations.map((d, idx) => (
                    <li key={idx} className="flex justify-between px-6 py-3">
                      <div>
                        <p className="text-sm text-gray-700">
                          {d.donor.slice(0, 6)}…{d.donor.slice(-4)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(d.timestamp).toLocaleString('pl-PL')}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-green-600">
                        {d.amount.toFixed(2)} {displayToken}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* ---------------- */}
          </div>
          {/* ------------------------------------ */}
        </div>
      </main>

      <Footer />
    </>
  )
}
