// components/HeroWithForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import Hero3D from "./Hero3D";
import { useRouter } from "next/navigation";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { parseUnits } from "viem";
import { CROWDFUND_ABI } from "../blockchain/crowdfundAbi";
import { crowdfundContractConfig } from "../blockchain/contracts";

const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

export default function HeroWithForm() {
  const router = useRouter();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  // 1) Parallax state + handlers
  const [rot, setRot] = useState({ x: 0, y: 0 });
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const { width, height, left, top } = e.currentTarget.getBoundingClientRect();
    const xNorm = ((e.clientX - left) / width) * 2 - 1;
    const yNorm = ((e.clientY - top) / height) * 2 - 1;
    const max = 3;
    setRot({ x: yNorm * max, y: -xNorm * max });
  };
  const handlePointerLeave = () => setRot({ x: 0, y: 0 });

  // 2) Form state
  const [campaignType, setCampaignType] = useState<"startup" | "charity">("charity");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [endTime, setEndTime] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 3) Image preview
  useEffect(() => {
    if (!imageFile) return setImagePreview("");
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  // 4) Submit handler (upload → metadata → createCampaign)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title || !description || !targetAmount || !endTime) {
      setError("Wypełnij wszystkie pola.");
      return;
    }

    // parse amount
    let amountBI: bigint;
    try {
      amountBI = parseUnits(targetAmount, 6);
      if (amountBI <= 0n) throw new Error();
    } catch {
      setError("Nieprawidłowa kwota.");
      return;
    }

    // parse end time
    let ts: bigint;
    try {
      const ms = new Date(endTime).getTime();
      ts = BigInt(Math.floor((ms + 5 * 60 * 1000) / 1000));
      if (ts <= BigInt(Math.floor(Date.now() / 1000))) throw new Error();
    } catch {
      setError("Data zakończenia musi być w przyszłości.");
      return;
    }

    if (!address) {
      setError("Podłącz portfel.");
      return;
    }

    setSubmitting(true);
    try {
      // upload image
      let rawCID: any = "";
      if (imageFile) {
        const fm = new FormData();
        fm.append("file", imageFile);
        const res = await fetch("/api/upload", { method: "POST", body: fm });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Błąd uploadu");
        rawCID = json.cid;
      }
      const cid = typeof rawCID === "object" && rawCID["/"] ? rawCID["/"] : String(rawCID);

      // metadata
      const metadata = {
        title: title.trim(),
        description: description.trim(),
        image: cid ? `https://ipfs.io/ipfs/${cid}` : "",
      };
      const blob = new Blob([JSON.stringify(metadata)], {
        type: "application/json",
      });
      const file = new File([blob], "metadata.json", {
        type: "application/json",
      });
      const fm2 = new FormData();
      fm2.append("file", file);
      const res2 = await fetch("/api/upload", {
        method: "POST",
        body: fm2,
      });
      const json2 = await res2.json();
      if (!res2.ok) throw new Error(json2.error || "Błąd uploadu metadanych");
      const metaCID = typeof json2.cid === "object" && json2.cid["/"] ? json2.cid["/"] : String(json2.cid);

      // call createCampaign
      const args = [
        campaignType === "startup" ? 0 : 1,
        USDC_ADDRESS,
        amountBI,
        metaCID,
        ts,
      ] as const;
      await writeContractAsync({
        address: crowdfundContractConfig.address,
        abi: CROWDFUND_ABI,
        functionName: "createCampaign",
        args,
      });

      router.push("/");
    } catch (err: any) {
      setError(err.message || "Błąd podczas tworzenia kampanii.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="relative w-full aspect-[1920/800] overflow-hidden"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* parallax background */}
      <Hero3D rot={rot} />

      {/* overlay: text + form */}
      <div className="absolute inset-0 container mx-auto px-6 flex flex-col lg:flex-row items-center justify-center gap-12 h-full pointer-events-none">
        {/* TEXT */}
        <div className="flex-1 text-white space-y-6 pointer-events-auto">
          <h1 className="text-5xl font-extrabold leading-tight">
            Plant goodness, let people grow.
          </h1>
          <p className="text-lg max-w-md">
            Start your fundraising journey here. Inspire, collect and make a real impact.
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 bg-white/30 backdrop-blur-lg p-8 rounded-xl shadow-lg max-w-md w-full space-y-4 pointer-events-auto"
        >
          {error && <p className="text-red-500">{error}</p>}
          <div>
            <label className="block text-white mb-1">Typ zbiórki</label>
            <select
              value={campaignType}
              onChange={(e) => setCampaignType(e.target.value as any)}
              className="w-full px-4 py-2 rounded bg-white/90 text-black focus:ring-2 focus:ring-[#68CC89]"
            >
              <option value="charity">Charytatywna</option>
              <option value="startup">Startup</option>
            </select>
          </div>
          <div>
            <label className="block text-white mb-1">Tytuł zbiórki</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded bg-white/90 text-black focus:ring-2 focus:ring-[#68CC89]"
              placeholder="My Charity Fund"
            />
          </div>
          <div>
            <label className="block text-white mb-1">Cel kwotowy (USDC)</label>
            <input
              type="number"
              step="0.01"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="w-full px-4 py-2 rounded bg-white/90 text-black focus:ring-2 focus:ring-[#68CC89]"
              placeholder="500.00"
            />
          </div>
          <div>
            <label className="block text-white mb-1">Krótki opis</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded bg-white/90 text-black h-24 focus:ring-2 focus:ring-[#68CC89]"
              placeholder="Write a short summary..."
            />
          </div>
          <div>
            <label className="block text-white mb-1">Data zakończenia</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-2 rounded bg-white/90 text-black focus:ring-2 focus:ring-[#68CC89]"
            />
          </div>
          <div>
            <label className="block text-white mb-1">Dodaj zdjęcie (opcjonalne)</label>
            <label className="w-full flex items-center justify-center px-4 py-2 bg-white/90 text-black rounded cursor-pointer hover:bg-white">
              <span className="mr-2">📷</span>
              <span>{imageFile ? imageFile.name : "Wybierz plik..."}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </label>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="preview"
                className="mt-2 w-full h-32 object-cover rounded"
              />
            )}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 rounded text-white ${
              submitting ? "bg-gray-400" : "bg-[#68CC89] hover:bg-[#5fbf7a]"
            }`}
          >
            {submitting ? "Tworzę…" : "Create Campaign"}
          </button>
        </form>
      </div>
    </div>
  );
}
