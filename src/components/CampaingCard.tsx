// src/components/CampaignCard.tsx
import React, { useState, useEffect } from 'react';
import { type Campaign } from '../hooks/useCrowdfund'; // Zaimportuj typ Campaign z naszego hooka

interface CampaignCardProps {
  campaign: Campaign;
}

// --- Stałe ---
// TODO: Zastąp tym adresem kontraktu USDC, którego używasz na sieci Sepolia
const USDC_TOKEN_ADDRESS_SEPOLIA = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'; // Przykładowy adres USDC na Sepolia (może być inny!)
const IPFS_GATEWAY_PREFIX = 'https://ipfs.io/ipfs/'; // Możesz zmienić na preferowaną bramkę IPFS

// --- Interfejs dla metadanych z IPFS ---
interface CampaignMetadata {
  title: string;
  description: string;
  image?: string; // Opcjonalne pole na obrazek
  // Możesz dodać więcej pól, jeśli Twoje metadane je zawierają
}

// --- Funkcje pomocnicze ---
const getCampaignStatusText = (status: number): string => {
  switch (status) {
    case 0: return "Aktywna";
    case 1: return "Zakończona sukcesem";
    case 2: return "Nieudana";
    case 3: return "W trakcie zamykania";
    case 4: return "Zamknięta";
    default: return `Nieznany status (${status})`;
  }
};

const getCampaignTypeText = (campaignType: number): string => {
  switch (campaignType) {
    case 0: return "Startup";
    case 1: return "Charytatywna";
    default: return `Nieznany typ (${campaignType})`;
  }
};

// Poprawiona funkcja do formatowania kwot
const formatAmount = (amount: bigint | undefined | null, decimals: number = 6): string => { // Zakładamy 6 dla USDC
  if (amount === undefined || amount === null || typeof amount !== 'bigint') {
    console.warn("formatAmount otrzymał niepoprawny typ lub wartość dla kwoty:", amount);
    return "0.00"; // Lub inna domyślna wartość
  }

  const divisor = BigInt(10) ** BigInt(decimals);
  const integerPart = amount / divisor;
  const fractionalPart = amount % divisor;

  if (fractionalPart === BigInt(0)) {
    return integerPart.toString();
  }

  // Upewnij się, że część ułamkowa ma odpowiednią długość, dopełniając zerami z przodu
  const fractionalString = fractionalPart.toString().padStart(decimals, '0');
  // Wyświetl np. 2 miejsca po przecinku, dostosuj według potrzeb
  return `${integerPart}.${fractionalString.substring(0, 2)}`;
};


// Komponent karty kampanii
export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  const [metadata, setMetadata] = useState<CampaignMetadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);

  // Efekt do pobierania danych z IPFS na podstawie dataCID
  useEffect(() => {
    if (campaign.dataCID) {
      const fetchMetadata = async () => {
        setIsLoadingMetadata(true);
        setMetadataError(null);
        try {
          const response = await fetch(`${IPFS_GATEWAY_PREFIX}${campaign.dataCID}`);
          if (!response.ok) {
            throw new Error(`Nie udało się pobrać metadanych z IPFS: ${response.statusText}`);
          }
          const data: CampaignMetadata = await response.json();
          setMetadata(data);
        } catch (error) {
          console.error("Błąd podczas pobierania metadanych z IPFS:", error);
          if (error instanceof Error) {
            setMetadataError(error.message);
          } else {
            setMetadataError("Wystąpił nieznany błąd podczas ładowania metadanych.");
          }
          // Ustaw domyślne wartości, jeśli nie uda się pobrać
          setMetadata({
            title: `Kampania ${campaign.campaignId || ''}`,
            description: `Nie udało się załadować szczegółów dla CID: ${campaign.dataCID.substring(0,20)}...`,
          });
        } finally {
          setIsLoadingMetadata(false);
        }
      };
      fetchMetadata();
    } else {
        // Ustaw domyślne wartości, jeśli CID jest pusty
        setMetadata({
            title: `Kampania ${campaign.campaignId || ''}`,
            description: "Brak identyfikatora CID dla tej kampanii.",
        });
    }
  }, [campaign.dataCID, campaign.campaignId]);

  const progressPercentage = campaign.targetAmount > BigInt(0)
    ? Number((campaign.raisedAmount * BigInt(10000)) / campaign.targetAmount) / 100 // Dokładniejsze obliczenie (np. do 2 miejsc po przecinku)
    : 0;

  const displayTokenSymbol = campaign.acceptedToken.toLowerCase() === USDC_TOKEN_ADDRESS_SEPOLIA.toLowerCase()
    ? 'USDC'
    : `${campaign.acceptedToken.substring(0, 6)}...${campaign.acceptedToken.substring(campaign.acceptedToken.length - 4)}`;

  const campaignTitle = isLoadingMetadata ? "Ładowanie tytułu..." : (metadata?.title || `Kampania ${campaign.campaignId}`);
  const campaignDescription = isLoadingMetadata ? "Ładowanie opisu..." : (metadata?.description || "Brak opisu.");


  return (
    <div className="border rounded-lg p-5 shadow-md bg-slate-50 hover:shadow-lg transition-shadow duration-300 ease-in-out flex flex-col justify-between h-full">
      <div>
        {/* Obrazek kampanii (jeśli jest w metadanych) */}
        {metadata?.image && (
          <img
            src={metadata.image.startsWith('ipfs://')
              ? `${IPFS_GATEWAY_PREFIX}${metadata.image.substring(7)}`
              : metadata.image}
            alt={campaignTitle}
            className="w-full h-40 object-cover rounded-t-lg mb-3"
            onError={(e) => (e.currentTarget.style.display = 'none')} // Ukryj jeśli błąd ładowania obrazka
          />
        )}

        <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate" title={campaignTitle}>
          {campaignTitle}
        </h3>

        <div className="text-xs text-gray-500 mb-2">
          ID: {campaign.campaignId === undefined ? 'N/A' : campaign.campaignId} | Typ: {getCampaignTypeText(campaign.campaignType)}
        </div>

        <p className="text-sm text-gray-600 mb-3 h-20 overflow-y-auto text-ellipsis break-words">
          {metadataError ? <span className="text-red-500">{metadataError}</span> : campaignDescription}
        </p>

        <div className="mb-3">
          <div className="flex justify-between text-sm text-gray-700 mb-1">
            <span>Zebrano: {formatAmount(campaign.raisedAmount)} {displayTokenSymbol}</span>
            <span>Cel: {formatAmount(campaign.targetAmount)} {displayTokenSymbol}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              title={`${progressPercentage.toFixed(2)}%`}
            ></div>
          </div>
          <p className="text-xs text-right text-gray-600 mt-1">{progressPercentage.toFixed(2)}%</p>
        </div>

        <div className="mb-3">
          <span className="text-sm font-medium text-gray-700">Status: </span>
          <span className={`text-sm font-semibold ${campaign.status === 0 ? 'text-green-600' : campaign.status === 1 ? 'text-blue-600' : 'text-red-600'}`}>
            {getCampaignStatusText(campaign.status)}
          </span>
        </div>
      </div>

      <div>
        <div className="mb-3">
          <p className="text-xs text-gray-500">Kreator:</p>
          <p className="text-xs text-gray-700 font-mono break-all" title={campaign.creator}>
            {campaign.creator.substring(0, 8)}...{campaign.creator.substring(campaign.creator.length - 6)}
          </p>
        </div>

        <div className="text-xs text-gray-500 space-y-1 border-t pt-2 mt-2">
          <p title={campaign.acceptedToken}>
            Token: {displayTokenSymbol}
          </p>
          <p>Data utworzenia: {new Date(Number(campaign.creationTimestamp) * 1000).toLocaleDateString('pl-PL')}</p>
          <p>Data zakończenia: {new Date(Number(campaign.endTime) * 1000).toLocaleDateString('pl-PL')}</p>
          {campaign.reclaimDeadline > BigInt(0) && (
            <p className="text-orange-600">
              Termin zwrotu: {new Date(Number(campaign.reclaimDeadline) * 1000).toLocaleDateString('pl-PL')}
            </p>
          )}
        </div>
      </div>
      {/* Możesz dodać tu przyciski akcji, np. "Wesprzyj", "Zobacz szczegóły" */}
      {/* <div className="mt-4">
           <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors">
             Zobacz szczegóły
           </button>
         </div> */}
    </div>
  );
};