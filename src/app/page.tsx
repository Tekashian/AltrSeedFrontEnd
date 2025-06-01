// src/app/page.tsx
"use client";

import React, { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Slider from "react-slick";
import { useRouter } from "next/navigation";
import Footer from "../components/Footer";
import CampaignCard from "../components/CampaignCard";
import { useGetAllCampaigns, type Campaign } from "../hooks/useCrowdfund";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function HomePage() {
  const router = useRouter();
  const {
    campaigns = [],
    isLoading,
    error,
    refetchCampaigns,
  } = useGetAllCampaigns();

  // Jeżeli kampanie jeszcze nie zostały pobrane, wywołaj refetch
  useEffect(() => {
    if (!campaigns || campaigns.length === 0) {
      refetchCampaigns();
    }
  }, [campaigns, refetchCampaigns]);

  // 1) Tylko aktywne kampanie, posortowane malejąco według czasu utworzenia
  const sortedCampaigns = useMemo(() => {
    return Array.isArray(campaigns)
      ? campaigns
          .filter((c) => c.status === 0)
          .sort(
            (a, b) =>
              Number(b.creationTimestamp) - Number(a.creationTimestamp)
          )
      : [];
  }, [campaigns]);

  // 2) Top 6 kampanii, które mają >0% postępu, posortowane po procencie zebranej kwoty
  const topProgress = useMemo(() => {
    return Array.isArray(campaigns)
      ? campaigns
          .filter(
            (c) =>
              c.status === 0 &&
              c.raisedAmount > 0n &&
              c.targetAmount > 0n
          )
          .sort((a, b) => {
            const pa =
              Number(a.raisedAmount) / Number(a.targetAmount);
            const pb =
              Number(b.raisedAmount) / Number(b.targetAmount);
            return pb - pa;
          })
          .slice(0, 6)
      : [];
  }, [campaigns]);

  const handleDetailsClick = (id: number) =>
    console.log("Szczegóły kampanii:", id);
  const handleDonateClick = (id: number) =>
    console.log("Donate to campaign:", id);

  // State do przechowywania aktywnej zakładki: "Wszystkie", "Startups" lub "Charity"
  const [activeTab, setActiveTab] = useState<"Wszystkie" | "Startups" | "Charity">("Wszystkie");

  // Funkcja wybiera kampanie w zależności od aktywnej zakładki
  // Kampanie typu "Startups" mają campaignType === 0
  // Kampanie typu "Charity" mają campaignType === 1
  const displayedCampaigns = useMemo(() => {
    if (!Array.isArray(sortedCampaigns)) return [];
    if (activeTab === "Startups") {
      return sortedCampaigns.filter((c) => c.campaignType === 0);
    } else if (activeTab === "Charity") {
      return sortedCampaigns.filter((c) => c.campaignType === 1);
    } else {
      // "Wszystkie"
      return sortedCampaigns;
    }
  }, [activeTab, sortedCampaigns]);

  // Ustawienia slidera (react-slick):
  // - Na desktopie pokazujemy 3 karty
  // - Na tabletach (np. < 1024px) pokazujemy 2 karty
  // - Na mobilnych (np. < 640px) pokazujemy 1 kartę, wyłączamy centerMode
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: "0px",
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        // gdy szerokość ekranu jest mniejsza niż 1024px
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          centerMode: true,
          centerPadding: "0px",
        },
      },
      {
        // gdy szerokość ekranu jest mniejsza niż 640px (mobilne)
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: false, // wyłączamy centerMode dla lepszej responsywności
          centerPadding: "0px",
        },
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#E0F0FF] text-[#1F4E79]">
      {/* Hero banner */}
      <div className="relative w-full h-[50vh]">
        <Image
          src="/images/BanerAltrSeed.jpg"
          alt="Baner AltrSeed"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl font-bold text-white">
            Have an idea? Need support?
          </h1>
          <p className="mt-2 text-lg text-white">
            Launch your campaign today and make your vision a reality!
          </p>
        </div>
      </div>

      {/* Sticky button do tworzenia kampanii */}
      <div
        className="
          sticky top-[70px] z-[1000] flex justify-center bg-transparent
          -mt-[50px] lg:-mt-[80px]
        "
      >
        <button
          onClick={() => router.push("/create-campaign")}
          className="
            bg-[#68CC89] text-white
            transform transition duration-200 ease-in-out
            hover:scale-105 hover:shadow-[0_0_12px_rgba(99,211,145,0.5)]
            px-6 sm:px-8 md:px-10 py-2 sm:py-3 md:py-4
            text-lg sm:text-xl md:text-2xl
            rounded-full
          "
        >
          Create Campaign
        </button>
      </div>

      {/* Główna zawartość */}
      <main className="container mx-auto px-4 pt-24 pb-8">
        {/* Sekcja: najbliżej celu */}
        {topProgress.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">
              Najbliżej celu
            </h2>
            <Slider {...sliderSettings}>
              {topProgress.map((c) => (
                <div key={c.campaignId} className="px-2">
                  <CampaignCard
                    campaign={c}
                    onDetailsClick={handleDetailsClick}
                    onDonateClick={handleDonateClick}
                  />
                </div>
              ))}
            </Slider>
          </section>
        )}

        {/* Sekcja: kampanie z zakładkami */}
        <section>
          {/* NAV ZAKŁADEK */}
          <nav className="flex justify-center border-b border-gray-300 mb-6">
            <ul className="flex space-x-8">
              <li>
                <button
                  onClick={() => setActiveTab("Wszystkie")}
                  className={`pb-2 text-lg font-medium ${
                    activeTab === "Wszystkie"
                      ? "text-[#1F4E79] border-b-2 border-[#68CC89]"
                      : "text-[#1F4E79]/60 hover:text-[#1F4E79]"
                  }`}
                >
                  Wszystkie
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("Startups")}
                  className={`pb-2 text-lg font-medium ${
                    activeTab === "Startups"
                      ? "text-[#1F4E79] border-b-2 border-[#68CC89]"
                      : "text-[#1F4E79]/60 hover:text-[#1F4E79]"
                  }`}
                >
                  Startups
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("Charity")}
                  className={`pb-2 text-lg font-medium ${
                    activeTab === "Charity"
                      ? "text-[#1F4E79] border-b-2 border-[#68CC89]"
                      : "text-[#1F4E79]/60 hover:text-[#1F4E79]"
                  }`}
                >
                  Charity
                </button>
              </li>
            </ul>
          </nav>

          {/* Komunikat jeśli brak kampanii w bieżącej zakładce */}
          {isLoading && <p>Ładowanie kampanii…</p>}
          {error && <p className="text-red-600">Błąd: {error.message}</p>}
          {!isLoading && !error && displayedCampaigns.length === 0 && (
            <p className="text-center text-[#1F4E79]/70">
              Brak kampanii do wyświetlenia w tej zakładce.
            </p>
          )}

          {/* WYSWIETLANIE KAMPANII W GRIDZIE */}
          {!isLoading && !error && displayedCampaigns.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedCampaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.campaignId}
                  campaign={campaign}
                  onDetailsClick={handleDetailsClick}
                  onDonateClick={handleDonateClick}
                />
              ))}
            </div>
          )}

          {/* Przycisk Odśwież (po prawej stronie poniżej listy) */}
          <div className="flex justify-end mt-6">
            <button
              className="px-4 py-2 rounded bg-[#68CC89] text-white hover:bg-[#5fbf7a] transition"
              onClick={() => refetchCampaigns()}
            >
              Odśwież
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
