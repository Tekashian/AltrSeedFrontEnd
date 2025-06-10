// components/Hero3D.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function Hero3D() {
  const [rot, setRot] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { width, height, left, top } = e.currentTarget.getBoundingClientRect();
    const xNorm = ((e.clientX - left) / width) * 2 - 1;   // -1..1
    const yNorm = ((e.clientY - top)  / height) * 2 - 1;  // -1..1
    const maxAngle = 3;
    setRot({ x: yNorm * maxAngle, y: -xNorm * maxAngle });
  };

  const handleMouseLeave = () => {
    setRot({ x: 0, y: 0 });
  };

  const midStyle = {
    transform: `perspective(800px) rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
  };

  return (
    <div
      className="w-full aspect-[1920/800] relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
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

      {/* warstwa deszczu (mid) z efektem 3D */}
      <div className="absolute inset-0" style={midStyle}>
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

      {/* tekst na wierzchu */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl font-bold text-white">
          Plant goodness, let people grow.
        </h1>
        <p className="mt-2 text-lg text-white">
          Launch your campaign today and make your vision a reality!
        </p>
      </div>
    </div>
  );
}
