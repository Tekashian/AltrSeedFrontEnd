// components/Hero3D.tsx
"use client";

import React from "react";
import Image from "next/image";

export default function Hero3D() {
  return (
    <div className="w-full aspect-[1920/800] relative overflow-hidden">
      {/* warstwa tła (statyczna) */}
      <div className="absolute inset-0">
        <Image
          src="/images/layer-back.png"
          alt="tło"
          fill
          quality={100}
          priority
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
      </div>

      {/* warstwa deszczu (mid) – już bez efektu paralaksy, statyczna */}
      <div className="absolute inset-0">
        <Image
          src="/images/layer-mid.png"
          alt="deszcz i pyłki"
          fill
          quality={100}
          priority
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
      </div>

      {/* warstwa liści (front) statyczna */}
      <div className="absolute inset-0">
        <Image
          src="/images/layer-front.png"
          alt="liście"
          fill
          quality={100}
          priority
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
      </div>

      {/* ewentualny tekst lub overlay do dodania poniżej */}
    </div>
  );
}
