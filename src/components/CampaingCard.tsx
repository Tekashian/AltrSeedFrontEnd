"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Campaign, CampaignState, CampaignType } from '@/abi/CrowdfundABI'; // Zaimportuj zaktualizowane typy
import { formatEther } from 'viem';

interface CampaignCardProps {
  campaignData: Campaign; // Zmieniono nazwę propa dla jasności
}

interface CampaignMetadata {
  title?: string;
  description?: string;
  imageUrl?: string;
}

// Funkcja pomocnicza do konwersji stanu na tekst
const getCampaignStateText = (state: number): string => {
  switch (state) {
    case CampaignState.Active: return "Aktywna";
    case CampaignState.Successful: return "Zakończona sukcesem";
    case CampaignState.Failed: return "Nieudana";
    case CampaignState.Cancelled: return "Anulowana";
    case CampaignState.Closing: return "W trakcie zamykania";
    default: return "Nieznany status";
  }
};

// Funkcja pomocnicza do konwersji typu kampanii na tekst
const getCampaignTypeText = (type: number): string => {
  switch (type) {
    case CampaignType.Startup: return "Startup";
    case CampaignType.Charity: return "Charytatywna";
    default: return "Nieznany typ";
  }
};

// Funkcja pomocnicza do formatowania daty
const formatTimestamp = (timestamp: bigint): string => {
  if (timestamp === 0n) return "N/A"; // Obsługa przypadku, gdy data nie jest ustawiona
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Funkcja do tworzenia linku do bramki IPFS
const ipfsGatewayLink = (cid: string) => {
  if (!cid) return null;
  // Możesz użyć preferowanej bramki IPFS
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
  // Alternatywnie: `https://ipfs.io/ipfs/${cid}` lub inna
};

const CampaignCard: React.FC<CampaignCardProps> = ({ campaignData }) => {
  const [metadata, setMetadata] = useState<CampaignMetadata | null>(null);
  const [loadingMetadata, setLoadingMetadata] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (campaignData.dataCID && campaignData.dataCID !== "") {
        setLoadingMetadata(true);
        try {
          const response = await fetch(ipfsGatewayLink(campaignData.dataCID)!);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data: CampaignMetadata = await response.json();
          setMetadata(data);
        } catch (error) {
          console.error("Failed to fetch metadata from IPFS:", error);
          setMetadata({ title: "Błąd ładowania metadanych", description: "Nie udało się załadować szczegółów kampanii.", imageUrl: "/images/placeholder-error.png" });
        } finally {
          setLoadingMetadata(false);
        }
      } else {
        setMetadata({ title: "Brak metadanych", description: "Brak dodatkowych informacji.", imageUrl: "/images/placeholder-default.png" });
        setLoadingMetadata(false);
      }
    };

    fetchMetadata();
  }, [campaignData.dataCID]);

  const progress = campaignData.targetAmount > 0n
    ? Number((campaignData.raisedAmount * 10000n) / campaignData.targetAmount) / 100
    : 0;

  const title = metadata?.title || campaignData.title || "Brak tytułu";
  const description = metadata?.description || campaignData.description || "Brak opisu.";
  const imageUrl = metadata?.imageUrl ? (metadata.imageUrl.startsWith('http') ? metadata.imageUrl : ipfsGatewayLink(metadata.imageUrl)) : "/images/placeholder-default.png";

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden shadow-lg bg-gray-800 text-white transition-all hover:shadow-blue-500/50 w-full max-w-sm flex flex-col">
      <div className="relative w-full h-56">
        {loadingMetadata ? (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
            <span className="text-gray-400">Ładowanie obrazka...</span>
          </div>
        ) : (
          <Image
            src={imageUrl!}
            alt={title}
            layout="fill"
            objectFit="cover"
            onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder-default.png'; }}
          />
        )}
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold mb-2 truncate text-blue-400" title={title}>
          {title}
        </h3>
        <p className="text-gray-400 text-sm mb-3 h-20 overflow-y-auto custom-scrollbar flex-grow" title={description}>
          {description}
        </p>

        <div className="mb-3 space-y-1 text-xs">
          <p>
            Typ: <span className="font-medium text-purple-400 capitalize">{getCampaignTypeText(campaignData.campaignType)}</span>
          </p>
          <p>
            Status: <span className={`font-medium ${campaignData.status === CampaignState.Active ? 'text-green-400' : 'text-yellow-400'}`}>
              {getCampaignStateText(campaignData.status)}
            </span>
          </p>
          <p>
            Cel: <span className="font-medium text-green-400">{formatEther(campaignData.targetAmount)} ETH</span>
          </p>
          <p>
            Zebrano: <span className="font-medium text-green-400">{formatEther(campaignData.raisedAmount)} ETH</span>
          </p>
          <p>
            Zakończenie: <span className="font-medium text-red-400">{formatDeadline(campaignData.endTime)}</span>
          </p>
          <p className="truncate" title={`Token: ${campaignData.acceptedToken}`}>
            Token: <span className="font-medium text-gray-300">{campaignData.acceptedToken.substring(0,6)}...{campaignData.acceptedToken.substring(campaignData.acceptedToken.length - 4)}</span>
          </p>
          <p className="truncate" title={`Twórca: ${campaignData.creator}`}>
            Twórca: <span className="font-medium text-gray-300">{campaignData.creator.substring(0,6)}...{campaignData.creator.substring(campaignData.creator.length - 4)}</span>
          </p>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-1">
          <div
            className="bg-blue-500 h-2.5 rounded-full"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-400 text-right mb-4">
          {progress.toFixed(2)}%
        </div>

        <button
          className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-150 disabled:opacity-50"
          disabled={campaignData.status !== CampaignState.Active}
        >
          {campaignData.status === CampaignState.Active ? "Wesprzyj projekt" : "Zbiórka zakończona"}
        </button>
      </div>
    </div>
  );
};

export default CampaignCard;