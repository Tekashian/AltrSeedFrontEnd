// src/components/CampaignCard.tsx
import React, { useState, useEffect } from 'react';
import { type Campaign } from '../hooks/useCrowdfund';

interface CampaignCardProps {
  campaign: Campaign;
  onDetailsClick?: (campaignId: string | number) => void;
  onDonateClick?: (campaignId: string | number) => void;
}

// --- Stałe ---
const USDC_TOKEN_ADDRESS_SEPOLIA = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
const IPFS_GATEWAY_PREFIX = 'https://ipfs.io/ipfs/';

// --- Interfejs dla metadanych z IPFS ---
interface CampaignMetadata {
  title: string;
  description: string;
  image?: string;
}

// --- Funkcje pomocnicze ---
const getCampaignStatusText = (status: number): string => {
  switch (status) {
    case 0: return "Aktywna";
    case 1: return "Zakończona"; // Assuming this means successful and ended
    case 2: return "Nieudana";
    case 3: return "Zamykanie";
    case 4: return "Zamknięta"; // Could be after successful withdrawal or failed and closed
    default: return `Status (${status})`;
  }
};

const getCampaignTypeText = (campaignType: number): string => {
  switch (campaignType) {
    case 0: return "Startup";
    case 1: return "Charytatywna";
    default: return `Typ (${campaignType})`;
  }
};

const formatAmount = (amount: bigint | undefined | null, decimals: number = 6): string => {
  if (amount === undefined || amount === null || typeof amount !== 'bigint') {
    return "0.00";
  }
  const divisor = BigInt(10) ** BigInt(decimals);
  const integerPart = amount / divisor;
  const fractionalPart = amount % divisor;
  if (fractionalPart === BigInt(0)) {
    return integerPart.toString();
  }
  const fractionalString = fractionalPart.toString().padStart(decimals, '0');
  return `${integerPart}.${fractionalString.substring(0, 2)}`;
};

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onDetailsClick, onDonateClick }) => {
  const [metadata, setMetadata] = useState<CampaignMetadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(true);
  const [metadataError, setMetadataError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoadingMetadata(true);
    setMetadataError(null); // Reset error state on new CID
    setMetadata(null); // Reset metadata on new CID

    if (campaign.dataCID && typeof campaign.dataCID === 'string' && campaign.dataCID.trim() !== '') {
      const fetchMetadata = async () => {
        const ipfsUrl = `${IPFS_GATEWAY_PREFIX}${campaign.dataCID}`;
        console.log(`[CampaignCard] Attempting to fetch metadata for campaign ID: ${campaign.campaignId}, CID: ${campaign.dataCID}, URL: ${ipfsUrl}`);
        try {
          const response = await fetch(ipfsUrl);
          if (!response.ok) {
            const errorText = await response.text().catch(() => "Could not read error response text.");
            console.error(
              `[CampaignCard] IPFS fetch error for CID ${campaign.dataCID}: ${response.status} ${response.statusText}`,
              `Response body: ${errorText}`
            );
            throw new Error(`Błąd IPFS: ${response.status} ${response.statusText}.`);
          }
          const data: CampaignMetadata = await response.json();
          // Basic validation of expected fields
          if (typeof data.title === 'string' && typeof data.description === 'string') {
            setMetadata(data);
          } else {
            console.warn(`[CampaignCard] Metadata for CID ${campaign.dataCID} is missing title or description. Data:`, data);
            setMetadataError("Niekompletne metadane z IPFS.");
            // setMetadata(null) is already done at the start of useEffect or if dataCID changes
          }
        } catch (error) {
          console.error(`[CampaignCard] Critical error fetching or parsing metadata from IPFS (CID: ${campaign.dataCID}):`, error);
          const errorMessage = error instanceof Error ? error.message : "Nieznany błąd podczas pobierania metadanych.";
          setMetadataError(errorMessage);
          // setMetadata(null) is already done
        } finally {
          setIsLoadingMetadata(false);
        }
      };
      fetchMetadata();
    } else {
      console.warn(`[CampaignCard] Missing or invalid dataCID for campaign ID: ${campaign.campaignId}. CID: '${campaign.dataCID}'`);
      setIsLoadingMetadata(false);
      setMetadataError("Brak identyfikatora CID dla metadanych kampanii.");
      // setMetadata(null) is already done
    }
  }, [campaign.dataCID, campaign.campaignId]);

  const progressPercentage = campaign.targetAmount > BigInt(0)
    ? Number((campaign.raisedAmount * BigInt(10000)) / campaign.targetAmount) / 100
    : 0;

  const displayTokenSymbol = campaign.acceptedToken.toLowerCase() === USDC_TOKEN_ADDRESS_SEPOLIA.toLowerCase()
    ? 'USDC'
    : `${campaign.acceptedToken.substring(0, 5)}...${campaign.acceptedToken.substring(campaign.acceptedToken.length - 3)}`;

  // Determine title and description based on loading state and metadata availability
  const campaignTitle = isLoadingMetadata 
    ? "Ładowanie tytułu..." 
    : (metadata?.title || `Kampania ${campaign.campaignId || 'ID'}`);

  const campaignDescription = isLoadingMetadata 
    ? "Ładowanie opisu..." 
    : (metadata?.description || "Brak dodatkowych informacji o kampanii.");


  const handleDetailsClick = () => {
    if (onDetailsClick && campaign.campaignId !== undefined) {
      onDetailsClick(campaign.campaignId);
    }
  };

  const handleDonateClick = () => {
    if (onDonateClick && campaign.campaignId !== undefined) {
      onDonateClick(campaign.campaignId);
    }
  };

  const statusStyles: { [key: number]: { text: string, border: string, bg?: string } } = {
    0: { text: 'text-teal-400', border: 'border-teal-400', bg: 'bg-teal-500/10' },
    1: { text: 'text-green-400', border: 'border-green-400', bg: 'bg-green-500/10' },
    2: { text: 'text-red-400', border: 'border-red-400', bg: 'bg-red-500/10' },
    3: { text: 'text-amber-400', border: 'border-amber-400', bg: 'bg-amber-500/10' },
    4: { text: 'text-slate-400', border: 'border-slate-500', bg: 'bg-slate-500/10' },
  };
  const currentStatusStyle = statusStyles[campaign.status] || { text: 'text-slate-400', border: 'border-slate-500', bg: 'bg-slate-500/10' };

  const accentColor = "bg-teal-500";
  const accentColorHover = "hover:bg-teal-600";

  return (
    <div
      className={`
        group
        bg-[#1E1B2E]
        rounded-xl
        shadow-lg hover:shadow-[0_0_35px_5px_rgba(0,255,255,0.3)]
        transition-all duration-300 ease-in-out
        transform hover:scale-105
        m-3 flex flex-col overflow-hidden
        border border-transparent hover:border-teal-500/50
      `}
    >
      {/* Sekcja obrazka - serce karty */}
      <div className="relative w-full h-56 md:h-64 overflow-hidden">
        {isLoadingMetadata && !metadata?.image ? (
          <div className="w-full h-full bg-slate-700/50 animate-pulse flex items-center justify-center">
            <svg className="w-12 h-12 text-slate-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
        ) : metadata?.image ? (
          <img
            src={metadata.image.startsWith('ipfs://') ? `${IPFS_GATEWAY_PREFIX}${metadata.image.substring(7)}` : metadata.image}
            alt={campaignTitle}
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const placeholder = document.createElement('div');
                placeholder.className = "w-full h-full bg-slate-800 flex items-center justify-center text-slate-500 text-sm";
                placeholder.innerText = "Błąd obrazka";
                parent.appendChild(placeholder);
              }
            }}
          />
        ) : (
          // Fallback if not loading and no image in metadata, or metadata is null
          <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
            <svg className="w-16 h-16 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.38 3H4.62A2.63 2.63 0 002 5.62v12.76A2.63 2.63 0 004.62 21h14.76A2.63 2.63 0 0022 18.38V5.62A2.63 2.63 0 0019.38 3zM5 17l3.5-4.5 2.5 3.01L14.5 11l4.5 6H5z" />
            </svg>
          </div>
        )}
        <div className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold rounded-full border ${currentStatusStyle.border} ${currentStatusStyle.text} ${currentStatusStyle.bg || 'bg-slate-900/70'} backdrop-blur-sm`}>
          {getCampaignStatusText(campaign.status)}
        </div>
      </div>

      {/* Zawartość pod obrazkiem */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-white mb-1.5 truncate" title={campaignTitle}>
          {campaignTitle}
        </h3>

        <div className="text-xs text-slate-400 mb-3">
          Typ: <span className="font-medium text-slate-300">{getCampaignTypeText(campaign.campaignType)}</span>
        </div>

        {/* Opis Kampanii */}
        <p className="text-sm text-slate-300 mb-4 h-16 overflow-y-auto custom-scrollbar text-ellipsis break-words leading-relaxed flex-grow">
          {campaignDescription}
        </p>

        {/* Pasek postępu */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>Zebrano: <span className="font-semibold text-teal-400">{formatAmount(campaign.raisedAmount)} {displayTokenSymbol}</span></span>
            <span>Cel: <span className="font-semibold text-white">{formatAmount(campaign.targetAmount)} {displayTokenSymbol}</span></span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ease-out ${accentColor}`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              title={`${progressPercentage.toFixed(2)}%`}
            ></div>
          </div>
          <p className="text-xs text-right text-slate-400 mt-1">{progressPercentage.toFixed(2)}% zebranych</p>
        </div>


        {/* Informacje dodatkowe - na dole */}
        <div className="border-t border-slate-700/50 pt-3 mt-auto text-xs text-slate-400 space-y-1">
          <div className="flex justify-between items-center">
            <div>
              <p>Kreator: <span className="font-mono text-slate-300" title={campaign.creator}>{campaign.creator.substring(0, 6)}...{campaign.creator.substring(campaign.creator.length - 4)}</span></p>
            </div>
            <div className="text-right">
              <p>Token: <span className="font-semibold text-slate-300" title={campaign.acceptedToken}>{displayTokenSymbol}</span></p>
            </div>
          </div>
          <p>Zakończenie: <span className="text-slate-300">{new Date(Number(campaign.endTime) * 1000).toLocaleDateString('pl-PL', { year: 'numeric', month: 'short', day: 'numeric' })}</span></p>
          {campaign.reclaimDeadline > BigInt(0) && (
            <p className="text-amber-400">
              Zwrot do: <span className="text-amber-300">{new Date(Number(campaign.reclaimDeadline) * 1000).toLocaleDateString('pl-PL', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </p>
          )}
        </div>

        {/* Przyciski akcji */}
        <div className="mt-5 flex flex-col space-y-3"> {/* Zmieniono na flex-col i space-y dla przycisku pod spodem */}
          {onDetailsClick && (
            <button
              onClick={handleDetailsClick}
              className="
                w-full bg-slate-700 hover:bg-slate-600
                text-slate-200 font-medium
                py-2.5 px-4 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-40
                transition-all duration-200 ease-in-out text-sm"
            >
              Szczegóły
            </button>
          )}
          {onDonateClick && (
            <button
              onClick={handleDonateClick}
              className={`
                w-full ${accentColor} ${accentColorHover}
                text-white font-semibold
                py-2.5 px-4 rounded-lg
                shadow-md hover:shadow-lg hover:shadow-teal-500/40
                focus:outline-none focus:ring-2 focus:ring-teal-300
                transition-all duration-200 ease-in-out text-sm
              `}
            >
              Donate
            </button>
          )}
          
        </div>
      </div>
    </div>
  );
};