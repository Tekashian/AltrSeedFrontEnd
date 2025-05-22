// src/components/CampaignCard.tsx
import React, { useState, useEffect } from 'react';
import { type Campaign } from '../hooks/useCrowdfund';
import DonateButton from './DonateButton';

interface CampaignCardProps {
  campaign: Campaign;
  onDetailsClick?: (campaignId: string | number) => void;
}

const USDC_TOKEN_ADDRESS_SEPOLIA = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
const IPFS_GATEWAY_PREFIX = 'https://ipfs.io/ipfs/';

interface CampaignMetadata {
  title: string;
  description: string;
  image?: string;
}

const getCampaignStatusText = (status: number): string => {
  switch (status) {
    case 0: return "Aktywna";
    case 1: return "Zakończona";
    case 2: return "Nieudana";
    case 3: return "Zamykanie";
    case 4: return "Zamknięta";
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
  if (amount === undefined || amount === null || typeof amount !== 'bigint') return "0.00";
  const divisor = BigInt(10) ** BigInt(decimals);
  const integerPart = amount / divisor;
  const fractionalPart = amount % divisor;
  const fractionalString = fractionalPart.toString().padStart(decimals, '0');
  return `${integerPart}.${fractionalString.substring(0, 2)}`;
};

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onDetailsClick }) => {
  const [metadata, setMetadata] = useState<CampaignMetadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(true);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [donationInput, setDonationInput] = useState<string>('');

  useEffect(() => {
    setIsLoadingMetadata(true);
    setMetadataError(null);
    setMetadata(null);

    if (campaign.dataCID?.trim()) {
      const fetchMetadata = async () => {
        const ipfsUrl = `${IPFS_GATEWAY_PREFIX}${campaign.dataCID}`;
        try {
          const response = await fetch(ipfsUrl);
          if (!response.ok) throw new Error(`IPFS: ${response.status}`);
          const data: CampaignMetadata = await response.json();
          if (typeof data.title === 'string' && typeof data.description === 'string') {
            setMetadata(data);
          } else {
            setMetadataError("Niekompletne metadane z IPFS.");
          }
        } catch (error) {
          setMetadataError("Błąd pobierania metadanych.");
        } finally {
          setIsLoadingMetadata(false);
        }
      };
      fetchMetadata();
    } else {
      setIsLoadingMetadata(false);
      setMetadataError("Brak identyfikatora CID.");
    }
  }, [campaign.dataCID, campaign.campaignId]);

  const progressPercentage = campaign.targetAmount > BigInt(0)
    ? Number((campaign.raisedAmount * BigInt(10000)) / campaign.targetAmount) / 100
    : 0;

  const displayTokenSymbol = campaign.acceptedToken.toLowerCase() === USDC_TOKEN_ADDRESS_SEPOLIA.toLowerCase()
    ? 'USDC'
    : `${campaign.acceptedToken.substring(0, 5)}...${campaign.acceptedToken.substring(campaign.acceptedToken.length - 3)}`;

  const campaignTitle = isLoadingMetadata 
    ? "Ładowanie tytułu..." 
    : (metadata?.title || `Kampania ${campaign.campaignId}`);

  const campaignDescription = isLoadingMetadata 
    ? "Ładowanie opisu..." 
    : (metadata?.description || "Brak dodatkowych informacji.");

  const handleDetailsClick = () => {
    if (onDetailsClick && campaign.campaignId !== undefined) {
      onDetailsClick(campaign.campaignId);
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
    <div className="group bg-[#1E1B2E] rounded-xl shadow-lg hover:shadow-[0_0_35px_5px_rgba(0,255,255,0.3)] transition-all duration-300 ease-in-out transform hover:scale-105 m-3 flex flex-col overflow-hidden border border-transparent hover:border-teal-500/50">
      <div className="relative w-full h-56 md:h-64 overflow-hidden">
        <div className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold rounded-full border ${currentStatusStyle.border} ${currentStatusStyle.text} ${currentStatusStyle.bg} backdrop-blur-sm`}>
          {getCampaignStatusText(campaign.status)}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-white mb-1.5 truncate" title={campaignTitle}>{campaignTitle}</h3>
        <div className="text-xs text-slate-400 mb-3">
          Typ: <span className="font-medium text-slate-300">{getCampaignTypeText(campaign.campaignType)}</span>
        </div>
        <p className="text-sm text-slate-300 mb-4 h-16 overflow-y-auto break-words leading-relaxed flex-grow">
          {campaignDescription}
        </p>

        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>Zebrano: <span className="font-semibold text-teal-400">{formatAmount(campaign.raisedAmount)} {displayTokenSymbol}</span></span>
            <span>Cel: <span className="font-semibold text-white">{formatAmount(campaign.targetAmount)} {displayTokenSymbol}</span></span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className={`h-2 rounded-full transition-all duration-500 ease-out ${accentColor}`} style={{ width: `${Math.min(progressPercentage, 100)}%` }}></div>
          </div>
          <p className="text-xs text-right text-slate-400 mt-1">{progressPercentage.toFixed(2)}% zebranych</p>
        </div>

        <div className="border-t border-slate-700/50 pt-3 mt-auto text-xs text-slate-400 space-y-1">
          <div className="flex justify-between items-center">
            <p>Kreator: <span className="font-mono text-slate-300" title={campaign.creator}>{campaign.creator.substring(0, 6)}...{campaign.creator.slice(-4)}</span></p>
            <p>Token: <span className="font-semibold text-slate-300" title={campaign.acceptedToken}>{displayTokenSymbol}</span></p>
          </div>
          <p>Zakończenie: <span className="text-slate-300">{new Date(Number(campaign.endTime) * 1000).toLocaleDateString('pl-PL')}</span></p>
          {campaign.reclaimDeadline > BigInt(0) && (
            <p className="text-amber-400">Zwrot do: <span className="text-amber-300">{new Date(Number(campaign.reclaimDeadline) * 1000).toLocaleDateString('pl-PL')}</span></p>
          )}
        </div>

        <div className="mt-5 flex flex-col space-y-3">
          {onDetailsClick && (
            <button
              onClick={handleDetailsClick}
              className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-40 text-sm transition-all"
            >
              Szczegóły
            </button>
          )}

          <input
            type="number"
            min="0"
            placeholder="Kwota USDC"
            value={donationInput}
            onChange={(e) => setDonationInput(e.target.value)}
            className="w-full px-3 py-2 rounded border border-slate-600 bg-slate-800 text-white text-sm"
          />

          <DonateButton
            campaignId={campaign.campaignId + 1}
            donationAmount={donationInput}
          />
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;
