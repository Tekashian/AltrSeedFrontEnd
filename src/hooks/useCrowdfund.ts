// src/hooks/useCrowdfund.ts
import { useReadContract } from 'wagmi';
import { crowdfundContractConfig } from '../blockchain/contracts'; // Importujemy konfigurację naszego kontraktu
import { sepolia } from '@reown/appkit/networks'; // Używamy Sepolii, zgodnie z konfiguracją

// Definicja typu dla pojedynczej kampanii, na podstawie struktury w ABI
// Zwróć uwagę na typy - BigInt dla uint256, string dla address/string, number dla enum/uint8
export interface Campaign {
  creator: `0x${string}`; // Adres Ethereum
  acceptedToken: `0x${string}`; // Adres tokena ERC20
  targetAmount: bigint;
  raisedAmount: bigint;
  totalEverRaised: bigint;
  dataCID: string;
  endTime: bigint;
  status: number; // Enum Crowdfund.Status (0: Active, 1: Successful, 2: Failed, 3: Closing, 4: Closed)
  creationTimestamp: bigint;
  reclaimDeadline: bigint;
  campaignType: number; // Enum Crowdfund.CampaignType (0: Startup, 1: Charity)
  // Dodajmy campaignId, które przypiszemy w komponencie na podstawie indeksu w tablicy
  campaignId?: number;
}

export function useGetAllCampaigns() {
  const { data: allCampaignsData, isLoading, error, refetch } = useReadContract({
    address: crowdfundContractConfig.address,
    abi: crowdfundContractConfig.abi,
    functionName: 'getAllCampaigns',
    // args: [], // Funkcja getAllCampaigns nie przyjmuje argumentów, więc to jest opcjonalne
    chainId: sepolia.id, // Jawnie określamy chainId dla pewności, że odpytujemy Sepolię
                         // Wagmi użyje providera dla Sepolii, jeśli portfel jest połączony z tą siecią.
                         // Jeśli portfel jest na innej sieci, to zapytanie może się nie udać lub zwrócić błąd.
                         // Można to obsłużyć bardziej elegancko, ale na razie zostawmy tak dla prostoty.
  });

  // Przetwarzanie danych, aby dodać campaignId (jeśli kontrakt go nie zwraca bezpośrednio w strukturze)
  // i upewnić się, że typy są zgodne z naszym interfejsem Campaign
  const campaignsWithIds = allCampaignsData?.map((campaign, index) => ({
    ...campaign,
    // Zakładamy, że kampanie są numerowane od 0 tak jak indeksy tablicy.
    // Jeśli Twój kontrakt numeruje kampanie od 1, możesz zrobić `campaignId: index + 1`
    // lub jeśli kontrakt zwraca ID w strukturze, użyj tego ID.
    // Na podstawie ABI funkcja getAllCampaigns zwraca tablicę struktur,
    // więc ID będziemy musieli nadać na podstawie pozycji w tablicy lub pobrać osobno,
    // jeśli funkcja `campaigns(id)` zwraca też ID (co nie jest typowe dla mapowań).
    // Dla uproszczenia zakładamy, że kolejność w tablicy odpowiada ID 0, 1, 2...
    // Jeśli `getAllCampaigns` zwraca strukturę zawierającą ID, to przypisanie `campaignId: index` nie jest potrzebne.
    // Sprawdź, czy Twoja struktura `Campaign` w Solidity zawiera pole `id`.
    // Jeśli tak, to `campaign.id` będzie tutaj dostępne.
    // Twoje ABI dla `getAllCampaigns` zwraca `struct Crowdfund.Campaign[]`,
    // a struktura `Campaign` nie ma explicite pola `id`.
    // Dlatego musimy je nadać lub pobrać `nextCampaignId` i iterować,
    // ale skoro mamy `getAllCampaigns`, to po prostu użyjemy indeksu.
    campaignId: index, // Używamy indeksu jako ID dla uproszczenia wyświetlania
  })) as Campaign[] | undefined;


  return {
    campaigns: campaignsWithIds,
    isLoading,
    error,
    refetchCampaigns: refetch, // Funkcja do ponownego pobrania danych
  };
}