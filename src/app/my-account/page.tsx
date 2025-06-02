// src/app/my-account/page.tsx
'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  useAppKitAccount,
  useAppKitNetworkCore,
  useAppKitProvider,
  type Provider
} from '@reown/appkit/react'
import { BrowserProvider, Contract, formatEther } from 'ethers'
import { useReadContract } from 'wagmi'

// Importujemy klienta Web3.Storage (upewnij się, że ścieżka do pliku jest poprawna)
import { getWeb3StorageClient } from '../../lib/web3storage'

import {
  crowdfundContractConfig,
  usdcContractConfig
} from '../../blockchain/contracts'
import { Campaign } from '../../hooks/useCrowdfund'
import MyCampaignCard from '../../components/MyCampaignCard'
import MyDonationCard from '../../components/MyDonationCard'
import Footer from '../../components/Footer'

import { CROWDFUND_ABI } from '../../blockchain/crowdfundAbi'

export default function MyAccountPage() {
  const router = useRouter()
  const { address, isConnected } = useAppKitAccount()
  const { chainId }              = useAppKitNetworkCore()
  const { walletProvider }       = useAppKitProvider<Provider>('eip155')

  // Stany lokalne: salda
  const [ethBalance,  setEthBalance ] = useState<string>('0')
  const [usdcBalance, setUsdcBalance] = useState<string>('0')

  // Logi zdarzeń z blockchain (darowizny, tworzenie kampanii)
  const [donations, setDonations] = useState<any[]>([])
  const [creations, setCreations] = useState<any[]>([])

  // Mapa stanu „czy darczyńca już odebrał zwrot” (hasReclaimed)
  const [hasReclaimedMap, setHasReclaimedMap] = useState<Record<number, boolean>>({})

  // Wybrana karta („Zakładka”) w widoku kampanii
  const [selectedTab, setSelectedTab] = useState<
    'active' | 'completed' | 'closing' | 'failed' | 'donated'
  >('active')

  // Wybrana karta w sekcji historii: „donations” lub „creations”
  const [selectedHistoryTab, setSelectedHistoryTab] = useState<'donations' | 'creations'>('donations')

  // Paginacja: ile elementów historii pokazać
  const [visibleDonationsCount, setVisibleDonationsCount] = useState<number>(5)
  const [visibleCreationsCount, setVisibleCreationsCount] = useState<number>(5)

  // --- Pobranie wszystkich kampanii z kontraktu ---
  const {
    data: allCampaignsRaw,
    isLoading: campaignsLoading,
    refetch: refetchCampaigns
  } = useReadContract({
    address:       crowdfundContractConfig.address,
    abi:           crowdfundContractConfig.abi,
    functionName:  'getAllCampaigns',
    chainId
  })

  // Zamieniamy „surówkę” na tablicę obiektów typu Campaign, nadając campaignId = index
  const allCampaigns: Campaign[] | undefined = allCampaignsRaw?.map(
    (c: any, i: number) => ({ ...c, campaignId: i })
  )

  // Filtrujemy „moje kampanie” – tylko te, których creator to mój address
  const myCampaigns = useMemo(() => {
    if (!allCampaigns || !address) return []
    return allCampaigns.filter(
      c => c.creator.toLowerCase() === address.toLowerCase()
    )
  }, [allCampaigns, address])

  // Rozdzielamy „moje kampanie” na tablice wg stanów:
  // 0 = Active, 1 = Completed, 2 = Closing, 5 = Failed
  const activeCampaigns = useMemo(() =>
    myCampaigns
      .filter(c => c.status === 0)
      .sort((a, b) => {
        const progA = Number(a.raisedAmount) / Number(a.targetAmount)
        const progB = Number(b.raisedAmount) / Number(b.targetAmount)
        if (progB !== progA) return progB - progA
        return Number(a.creationTimestamp) - Number(b.creationTimestamp)
      }),
  [myCampaigns])

  const completedCampaigns = useMemo(() =>
    myCampaigns
      .filter(c => c.status === 1)
      .sort((a, b) => {
        const progA = Number(a.raisedAmount) / Number(a.targetAmount)
        const progB = Number(b.raisedAmount) / Number(b.targetAmount)
        if (progB !== progA) return progB - progA
        return Number(a.creationTimestamp) - Number(b.creationTimestamp)
      }),
  [myCampaigns])

  const closingCampaigns = useMemo(() =>
    myCampaigns
      .filter(c => c.status === 2)
      .sort((a, b) => {
        const progA = Number(a.raisedAmount) / Number(a.targetAmount)
        const progB = Number(b.raisedAmount) / Number(b.targetAmount)
        if (progB !== progA) return progB - progA
        return Number(a.creationTimestamp) - Number(b.creationTimestamp)
      }),
  [myCampaigns])

  const failedCampaigns = useMemo(() =>
    myCampaigns
      .filter(c => c.status === 5)
      .sort((a, b) => {
        const progA = Number(a.raisedAmount) / Number(a.targetAmount)
        const progB = Number(b.raisedAmount) / Number(b.targetAmount)
        if (progB !== progA) return progB - progA
        return Number(a.creationTimestamp) - Number(b.creationTimestamp)
      }),
  [myCampaigns])

  // Sumujemy wszystkie dotacje (amountToCampaign) dla każdego campaignId
  const donationTotals = useMemo(() => {
    const totals: Record<number, number> = {}
    donations.forEach(log => {
      const onChainId = Number(log.args!.campaignId)
      const id = onChainId - 1
      const amount = Number(log.args!.amountToCampaign)
      totals[id] = (totals[id] || 0) + amount
    })
    return totals
  }, [donations])

  // Kampanie, które ja wspierałem i jeszcze nie odebrałem refundu
  const donatedCampaigns = useMemo(() => {
    if (!allCampaigns) return []
    return Object.entries(donationTotals)
      .map(([idStr, total]) => {
        const id = Number(idStr)
        const campaign = allCampaigns[id]
        return { ...campaign, donatedAmount: total }
      })
      .filter(c =>
        c.donatedAmount > 0 &&
        c.status !== 2 && // nie pokazujemy tych w Closing
        c.status !== 5 && // nie pokazujemy tych w Failed
        !hasReclaimedMap[c.campaignId]
      )
      .sort((a, b) => b.donatedAmount - a.donatedAmount)
  }, [allCampaigns, donationTotals, hasReclaimedMap])

  // --- Ładowanie sald i logów, gdy użytkownik zmienia portfel/lub mount ---
  useEffect(() => {
    if (!isConnected || !address || !walletProvider) return

    const init = async () => {
      const provider = new BrowserProvider(walletProvider, chainId)

      // 1. ETH balance
      const rawEth = await provider.getBalance(address)
      setEthBalance(formatEther(rawEth))

      // 2. USDC balance
      const usdc = new Contract(
        usdcContractConfig.address,
        usdcContractConfig.abi,
        provider
      )
      const rawUsdc  = await usdc.balanceOf(address)
      const decimals = await usdc.decimals()
      setUsdcBalance((Number(rawUsdc) / 10 ** Number(decimals)).toFixed(2))

      // 3. QueryFilter DonationReceived → wyświetlamy historię dotacji
      const cf = new Contract(
        crowdfundContractConfig.address,
        crowdfundContractConfig.abi,
        provider
      )
      const donLogs = await cf.queryFilter(cf.filters.DonationReceived(null, address))
      setDonations(donLogs.sort((x, y) => Number(y.args!.timestamp) - Number(x.args!.timestamp)))

      // 4. QueryFilter CampaignCreated → wyświetlamy historię tworzenia kampanii
      const crLogs = await cf.queryFilter(cf.filters.CampaignCreated(null, address))
      setCreations(crLogs.sort((x, y) => Number(y.args!.creationTimestamp) - Number(x.args!.creationTimestamp)))

      // 5. Sprawdzamy, czy już odebrałem refund (hasReclaimed) dla każdego ID, na które wpłaciłem
      const uniqueIds = Object.keys(donationTotals).map(id => Number(id))
      for (const id of uniqueIds) {
        try {
          const reclaimed: boolean = await cf.hasReclaimed(id + 1, address)
          setHasReclaimedMap(prev => ({ ...prev, [id]: reclaimed }))
        } catch {
          // ignorujemy ewentualne błędy
        }
      }
    }

    init().catch(console.error)
  }, [isConnected, address, chainId, walletProvider, donationTotals])

  // --- AKCJE: Inicjowanie zamknięcia, wypłata, żądanie refundu ---

  // 1) Inicjowanie zamknięcia kampanii (status → Closing)
  const initiateClosure = async (campaignId: number) => {
    if (!walletProvider) return
    try {
      alert('Rozpoczynam zamknięcie kampanii… Proszę potwierdzić transakcję w portfelu.')
      const provider = new BrowserProvider(walletProvider, chainId)
      const signer = await provider.getSigner()
      const cf = new Contract(
        crowdfundContractConfig.address,
        CROWDFUND_ABI,
        signer
      )
      const tx = await cf.initiateClosure(campaignId + 1)
      await tx.wait()
      alert('✅ Kampania została oznaczona jako „Zamykanie”. Darczyńcy mają teraz 14 dni na zwroty.')
      refetchCampaigns()
    } catch (err: any) {
      console.error('Błąd initiateClosure:', err)
      alert('❌ Wystąpił błąd podczas zamykania kampanii:\n' + (err.message || err.toString()))
    }
  }

  // 2) Wypłata środków (+ usunięcie IPFS)
  const withdrawFunds = async (campaignId: number, dataCID: string) => {
    if (!walletProvider) return
    try {
      const campaign = allCampaigns![campaignId]
      const provider = new BrowserProvider(walletProvider, chainId)
      const signer = await provider.getSigner()
      const cf = new Contract(
        crowdfundContractConfig.address,
        CROWDFUND_ABI,
        signer
      )

      // A) Kampania Completed → withdrawFunds
      if (campaign.status === 1) {
        alert('Wypłacam środki z zakończonej kampanii… Proszę potwierdzić transakcję.')
        const tx = await cf.withdrawFunds(campaignId + 1)
        await tx.wait()
        alert('✅ Środki z zakończonej kampanii zostały wypłacone.')
      }
      // B) Kampania Closing → finalizeClosureAndWithdraw, ale tylko po upływie reclaimDeadline
      else if (campaign.status === 2) {
        const nowSec = Math.floor(Date.now() / 1000)
        const reclaimDeadline =
          typeof campaign.reclaimDeadline === 'bigint'
            ? Number(campaign.reclaimDeadline)
            : campaign.reclaimDeadline ?? 0

        if (nowSec < reclaimDeadline) {
          alert('⏳ Okres zwrotu jeszcze trwa do:\n' + new Date(reclaimDeadline * 1000).toLocaleString())
          return
        }
        alert('Kończę zamknięcie kampanii i wypłacam pozostałe środki… Proszę potwierdzić transakcję.')
        const tx = await cf.finalizeClosureAndWithdraw(campaignId + 1)
        await tx.wait()
        alert('✅ Środki po okresie zwrotu zostały wypłacone.')
      }
      // C) Kampania Failed → finalizeClosureAndWithdraw, jeśli zostało coś do wypłaty
      else if (campaign.status === 5 && Number(campaign.raisedAmount) > 0) {
        alert('Wypłacam pozostałe środki z nieudanej kampanii… Proszę potwierdzić transakcję.')
        const tx = await cf.finalizeClosureAndWithdraw(campaignId + 1)
        await tx.wait()
        alert('✅ Pozostałe środki z nieudanej kampanii zostały wypłacone.')
      }
      // Inne stany – nic do wypłacenia
      else {
        alert('ℹ️ Brak środków do wypłaty lub kampania nie jest w odpowiednim stanie.')
        return
      }

      // 3) Usunięcie plików z IPFS (web3.storage)
      alert('Usuwam metadane kampanii z web3.storage (IPFS)…')
      const client = getWeb3StorageClient()
      await client.delete(dataCID)
      alert('✅ Metadane zostały usunięte z web3.storage (może upłynąć chwilka, zanim rzeczywiście znikną).')

      refetchCampaigns()
    } catch (err: any) {
      console.error('Błąd withdrawFunds:', err)
      alert('❌ Wystąpił błąd podczas wypłacania środków:\n' + (err.message || err.toString()))
    }
  }

  // 3) Darczyńca żąda refundu (claimRefund)
  const claimRefund = async (campaignId: number) => {
    if (!walletProvider) return
    try {
      alert('Rozpoczynam zwrot wpłaconej kwoty… Proszę potwierdzić transakcję w portfelu.')
      const provider = new BrowserProvider(walletProvider, chainId)
      const signer = await provider.getSigner()
      const cf = new Contract(
        crowdfundContractConfig.address,
        CROWDFUND_ABI,
        signer
      )
      const tx = await cf.claimRefund(campaignId + 1)
      await tx.wait()
      alert('✅ Zwrot środków został pomyślnie wykonany.')
      refetchCampaigns()
      setHasReclaimedMap(prev => ({ ...prev, [campaignId]: true }))
    } catch (err: any) {
      console.error('Błąd claimRefund:', err)
      alert('❌ Wystąpił błąd podczas żądania zwrotu:\n' + (err.message || err.toString()))
    }
  }

  // --- Sekcja z subtelnym komunikatem o tym, co się dzieje w aktualnie wybranej karcie ---
  const renderTabInfo = () => {
    switch (selectedTab) {
      case 'active':
        return (
          <div className="mb-4 p-3 bg-white border-l-4 border-blue-500 text-blue-900">
            <strong>Aktywne kampanie:</strong> Możesz dołączać nowe wpłaty. 
            Dla twoich własnych (ty jesteś kreatorem), jeśli osiągną cel i minie czas zakończenia, pokaże się przycisk „Zamknij kampanię”.
          </div>
        )
      case 'completed':
        return (
          <div className="mb-4 p-3 bg-white border-l-4 border-green-500 text-green-900">
            <strong>Zakończone sukcesem:</strong> Cel został osiągnięty. 
            Jako twórca możesz już wypłacić zebrane środki przyciskiem „Wypłać”.
          </div>
        )
      case 'closing':
        return (
          <div className="mb-4 p-3 bg-white border-l-4 border-yellow-500 text-yellow-900">
            <strong>Kampanie w trakcie zamykania:</strong> Twórca wywołał „Zamknij kampanię”. 
            Teraz darczyńcy mają 14 dni na żądanie zwrotu. Po upływie 14 dni twórca będzie mógł wypłacić pozostałe środki.
          </div>
        )
      case 'failed':
        return (
          <div className="mb-4 p-3 bg-white border-l-4 border-red-500 text-red-900">
            <strong>Nieudane kampanie:</strong> Kampania nie osiągnęła celu w ustalonym czasie. 
            Darczyńcy mogą żądać zwrotu środków (przycisk „Zwróć wpłatę”). 
            Twórca może wypłacić pozostałe środki tylko wtedy, gdy nie ma już nic do zwrotu.
          </div>
        )
      case 'donated':
        return (
          <div className="mb-4 p-3 bg-white border-l-4 border-indigo-500 text-indigo-900">
            <strong>Moje dotacje:</strong> Zobacz, na które kampanie wpłaciłeś i czy masz możliwość refundu. 
            Jeśli już odebrałeś zwrot, dany wpis zniknie z tej listy.
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
      <main className="container mx-auto p-6 space-y-8 bg-[#E0F0FF]">
        <h1 className="text-3xl font-bold text-[#1F4E79]">My Account</h1>

        {/* Bieżące salda użytkownika */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-white rounded shadow">
            <h2 className="font-semibold text-[#1F4E79]">ETH Balance</h2>
            <p className="text-xl text-[#00ADEF]">{ethBalance} ETH</p>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h2 className="font-semibold text-[#1F4E79]">USDC Balance</h2>
            <p className="text-xl text-[#00ADEF]">{usdcBalance} USDC</p>
          </div>
        </div>

        {/* Zakładki (Tabs) dla kampanii */}
        <div className="flex space-x-4 border-b border-gray-300">
          {(['active','completed','closing','failed','donated'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`pb-2 text-lg font-medium ${
                selectedTab === tab 
                  ? 'text-[#1F4E79] border-b-2 border-[#1F4E79]' 
                  : 'text-gray-500'
              }`}
            >
              {tab === 'active' ? 'Aktywne'
                : tab === 'completed' ? 'Zakończone'
                : tab === 'closing' ? 'Zamykane'
                : tab === 'failed' ? 'Nie Udane'
                : 'Moje dotacje'}
            </button>
          ))}
        </div>

        {/* Komunikat kontekstowy – subtelne info: co się dzieje w aktualnej karcie */}
        {renderTabInfo()}

        {/* Lista kampanii zgodnie z wybraną zakładką */}
        <section>
          {campaignsLoading ? (
            <p>Ładowanie kampanii…</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(selectedTab === 'donated' ? donatedCampaigns
               : selectedTab === 'active'    ? activeCampaigns
               : selectedTab === 'completed' ? completedCampaigns
               : selectedTab === 'closing'   ? closingCampaigns
               : failedCampaigns
              ).map(c => (
                <div key={c.campaignId}>
                  {selectedTab === 'donated' ? (
                    /* Historia dotacji: karta MyDonationCard */
                    <MyDonationCard campaign={c} />
                  ) : (
                    /* Karta „Mojej kampanii”: MyCampaignCard z przekazanymi akcjami */
                    <MyCampaignCard
                      campaign={c}
                      hasReclaimedMap={hasReclaimedMap}
                      onInitiateClosure={(id) => initiateClosure(id)}
                      onWithdraw={(id, cid) => withdrawFunds(id, cid)}
                      onClaimRefund={(id) => claimRefund(id)}
                    />
                  )}
                </div>
              ))}
              {((selectedTab === 'donated'   && donatedCampaigns.length === 0) ||
                (selectedTab === 'active'    && activeCampaigns.length === 0) ||
                (selectedTab === 'completed' && completedCampaigns.length === 0) ||
                (selectedTab === 'closing'   && closingCampaigns.length === 0) ||
                (selectedTab === 'failed'    && failedCampaigns.length === 0)
              ) && (
                <p className="text-gray-500">
                  {selectedTab === 'donated'   ? 'Nie wpłaciłeś jeszcze na żadną kampanię.'
                    : selectedTab === 'active'    ? 'Brak aktywnych kampanii.'
                    : selectedTab === 'completed' ? 'Brak zakończonych kampanii.'
                    : selectedTab === 'closing'   ? 'Brak kampanii w trakcie zamykania.'
                    : 'Brak nieudanych kampanii.'}
                </p>
              )}
            </div>
          )}
        </section>

        {/* Sekcja historii: zakładki „Historia Dotacji” i „Historia Tworzenia” */}
        <div className="flex space-x-4 border-b border-gray-300 mt-8">
          {(['donations','creations'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedHistoryTab(tab)}
              className={`pb-2 tekst-lg font-medium ${
                selectedHistoryTab === tab 
                  ? 'text-[#1F4E79] border-b-2 border-[#1F4E79]' 
                  : 'text-gray-500'
              }`}
            >
              {tab === 'donations' ? 'Historia Dotacji' : 'Historia Tworzenia'}
            </button>
          ))}
        </div>

        <section className="space-y-4 mt-4">
          {selectedHistoryTab === 'donations' ? (
            <>
              {donations.slice(0, visibleDonationsCount).map((log, i) => {
                const args = log.args!
                return (
                  <div key={i} className="p-4 bg-white rounded shadow">
                    <p className="text-black"><strong>Kampania #</strong> {args.campaignId.toString()}</p>
                    <p className="text-black">
                      <strong>Kwota:</strong>{' '}
                      {(Number(args.amountToCampaign) / 10 ** 6).toFixed(2)} USDC
                    </p>
                    <p className="text-black">
                      <strong>Czas:</strong>{' '}
                      {new Date(Number(args.timestamp) * 1000).toLocaleString()}
                    </p>
                  </div>
                )
              })}
              {donations.length > visibleDonationsCount && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setVisibleDonationsCount(prev => prev + 5)}
                    className="px-4 py-2 bg-[#1F4E79] text-white rounded hover:bg-[#163D60] transition"
                  >
                    Pokaż więcej
                  </button>
                </div>
              )}
              {donations.length === 0 && <p className="text-black">Brak dotacji.</p>}
            </>
          ) : (
            <>
              {creations.slice(0, visibleCreationsCount).map((log, i) => {
                const args = log.args!
                const typeValue = Number(args.campaignType)
                const typeLabel = typeValue === 0 ? 'Startup' : 'Charity'
                return (
                  <div key={i} className="p-4 bg-white rounded shadow">
                    <p className="text-black">
                      <strong>Kampania #</strong> {args.campaignId.toString()}
                    </p>
                    <p className="text-black">
                      <strong>Typ:</strong> {typeLabel}
                    </p>
                    <p className="text-black">
                      <strong>Cel:</strong>{' '}
                      {(Number(args.targetAmount) / 10 ** 6).toFixed(2)} USDC
                    </p>
                    <p className="text-black">
                      <strong>Utworzono:</strong>{' '}
                      {new Date(Number(args.creationTimestamp) * 1000).toLocaleString()}
                    </p>
                  </div>
                )
              })}
              {creations.length > visibleCreationsCount && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setVisibleCreationsCount(prev => prev + 5)}
                    className="px-4 py-2 bg-[#1F4E79] text-white rounded hover:bg-[#163D60] transition"
                  >
                    Pokaż więcej
                  </button>
                </div>
              )}
              {creations.length === 0 && <p className="text-black">Brak utworzonych kampanii.</p>}
            </>
          )}
        </section>
      </main>

      <Footer />
    </>
  )
}
