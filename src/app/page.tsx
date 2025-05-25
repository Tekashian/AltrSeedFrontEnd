// src/app/page.tsx
"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Slider from "react-slick";
import Footer from "../components/Footer";
import CampaignCard from "../components/CampaignCard";
import { useGetAllCampaigns, type Campaign } from "../hooks/useCrowdfund";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function HomePage() {
  const { campaigns = [], isLoading, error, refetchCampaigns } =
    useGetAllCampaigns();

  // tylko aktywne kampanie, posortowane malejąco po creationTimestamp
  const sortedCampaigns = useMemo(
    () =>
      campaigns
        .filter((c) => c.status === 0)
        .sort(
          (a, b) => Number(b.creationTimestamp) - Number(a.creationTimestamp)
        ),
    [campaigns]
  );

  // wybierz max 6 aktywnych z postępem > 0 i posortuj po %
  const topProgress = useMemo(() => {
    return campaigns
      .filter(
        (c) =>
          c.status === 0 &&
          c.raisedAmount > BigInt(0) &&
          c.targetAmount > BigInt(0)
      )
      .sort((a, b) => {
        const pa = Number(a.raisedAmount) / Number(a.targetAmount);
        const pb = Number(b.raisedAmount) / Number(b.targetAmount);
        return pb - pa;
      })
      .slice(0, 6);
  }, [campaigns]);

  const handleDetailsClick = (id: number) =>
    console.log("Szczegóły kampanii:", id);
  const handleDonateClick = (id: number) =>
    console.log("Donate to campaign:", id);

  // konfiguracja slidera
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
  };

  return (
    // dodajemy overflow-x-hidden żeby nic nie „wystawało” na boki
    <div className="flex flex-col min-h-screen bg-[#E0F0FF] text-[#1F4E79] overflow-x-hidden">
      {/* Hero banner – absolutnie na pełną szerokość ekranu */}
      <div className="relative w-screen h-[50vh]">
        <Image
          src="/images/BanerAltrSeed.jpg"
          alt="Baner AltrSeed"
          fill
          className="object-cover"
          priority
          // maksymalna jakość
          quality={100}
          // zawsze 100vw, by Next wiedział że zajmuje 100% viewportu
          sizes="100vw"
        />
        {/* Tekst na środku banera */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
          <h1 className="text-4xl font-bold text-white text-center drop-shadow-md">
            Have an idea? Need support?
          </h1>
          <p className="mt-2 text-xl text-white text-center drop-shadow-sm">
            Launch your campaign today and make your vision a reality!
          </p>
        </div>
      </div>

      <main className="container mx-auto flex-grow px-4 py-8">
        {/* Slider: Najbliżej celu */}
        {topProgress.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Najbliżej celu</h2>
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

        {/* Wszystkie kampanie */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Wszystkie kampanie</h2>
            <button
              className="px-4 py-2 rounded bg-[#68CC89] text-white hover:bg-[#5fbf7a] transition"
              onClick={() => refetchCampaigns()}
            >
              Odśwież
            </button>
          </div>

          {isLoading && <p>Ładowanie kampanii…</p>}
          {error && <p className="text-red-600">Błąd: {error.message}</p>}
          {!isLoading && !error && sortedCampaigns.length === 0 && (
            <p>Brak aktywnych kampanii do wyświetlenia.</p>
          )}
          {!isLoading && !error && sortedCampaigns.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedCampaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.campaignId}
                  campaign={campaign}
                  onDetailsClick={handleDetailsClick}
                  onDonateClick={handleDonateClick}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
