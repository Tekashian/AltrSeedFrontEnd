// src/app/page.tsx
"use client"; // Komponenty używające hooków muszą być komponentami klienckimi

import React from 'react';
import { CampaignCard } from '../components/CampaignCard'; // Upewnij się, że ścieżka jest poprawna
import { useGetAllCampaigns, type Campaign } from '../hooks/useCrowdfund'; // Upewnij się, że ścieżka jest poprawna
import Footer from '../components/Footer'; // Importuj komponent stopki

export default function HomePage() {
  const { campaigns, isLoading, error, refetchCampaigns } = useGetAllCampaigns();

  // Handle click for campaign details (placeholder)
  const handleDetailsClick = (campaignId: string | number) => {
    console.log(`Wyświetl szczegóły kampanii o ID: ${campaignId}`);
    // Tutaj możesz dodać logikę do nawigacji do strony szczegółów kampanii
    // np. router.push(`/campaign/${campaignId}`);
  };

  // Handle click for campaign donation (placeholder)
  const handleDonateClick = (campaignId: string | number) => {
    console.log(`Rozpocznij proces darowizny dla kampanii o ID: ${campaignId}`);
    // Tutaj możesz otworzyć modal do wpłacania darowizny lub nawigować do formularza
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white"> {/* Dodanie tła i tekstu dla całej strony */}
      {/* Header lub Navbar (zakładamy, że jest gdzieś indziej) */}
      {/* <Header /> */} 

      <main className="flex-grow container mx-auto p-4 md:p-8"> {/* flex-grow pozwoli main rozciągnąć się i "pchnąć" footer na dół */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-teal-400"> {/* Zmieniony kolor nagłówka dla lepszego kontrastu */}
            Kampanie Crowdfundingowe
          </h1>
          <button
            onClick={() => refetchCampaigns()}
            className="px-4 py-2 bg-slate-700 text-slate-200 rounded hover:bg-slate-600 transition-colors duration-200 text-sm"
            title="Odśwież listę kampanii"
          >
            Odśwież
          </button>
        </div>

        {isLoading && (
          <div className="text-center py-10">
            <p className="text-lg text-slate-400">Ładowanie kampanii z blockchaina...</p>
            {/* Możesz dodać tu animację ładowania (spinner) */}
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-teal-500 mx-auto mt-4"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-10 text-red-400">
            <p className="text-lg font-semibold">Wystąpił błąd podczas ładowania kampanii:</p>
            <p className="text-sm mt-2 bg-red-900/30 p-3 rounded-md border border-red-700">{error.message}</p>
            <button
              onClick={() => refetchCampaigns()}
              className="mt-4 px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              Spróbuj ponownie
            </button>
          </div>
        )}

        {!isLoading && !error && (!campaigns || campaigns.length === 0) && (
          <div className="text-center py-10">
            <p className="text-lg text-slate-400">Nie znaleziono żadnych aktywnych kampanii.</p>
            {/* Możesz tu dodać przycisk do tworzenia nowej kampanii, jeśli masz taką funkcjonalność */}
            <button
              // onClick={() => router.push('/create-campaign')}
              className="mt-4 px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              Utwórz nową kampanię
            </button>
          </div>
        )}

        {!isLoading && !error && campaigns && campaigns.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard 
                key={campaign.campaignId} 
                campaign={campaign} 
                onDetailsClick={handleDetailsClick} // Przekazujemy handler
                onDonateClick={handleDonateClick}   // Przekazujemy handler
              />
            ))}
          </div>
        )}
      </main>

      <Footer /> {/* Dodanie komponentu stopki na końcu */}
    </div>
  );
}