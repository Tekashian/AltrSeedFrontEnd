// src/app/create-campaign/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useContractWrite } from "wagmi";
import { parseUnits } from "viem";

import { crowdfundContractConfig } from "../../blockchain/contracts";
import { CROWDFUND_ABI } from "../../blockchain/crowdfundAbi";

// Lazily initialize IPFS client with Infura project credentials:
async function getIpfsClient() {
  if (typeof window === "undefined") return null;

  const projectId = process.env.NEXT_PUBLIC_IPFS_PROJECT_ID;
  const projectSecret = process.env.NEXT_PUBLIC_IPFS_PROJECT_SECRET;
  if (!projectId || !projectSecret) {
    console.error("IPFS project ID / secret not set in env");
    return null;
  }

  const auth =
    "Basic " + btoa(`${projectId}:${projectSecret}`);

  const { create } = await import("ipfs-http-client");
  return create({
    url: "https://ipfs.infura.io:5001/api/v0",
    headers: {
      authorization: auth,
    },
  });
}

const USDC_ADDRESS =
  "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

export default function CreateCampaignPage() {
  const router = useRouter();

  // form state
  const [campaignType, setCampaignType] =
    useState<"startup" | "charity">("charity");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [acceptedToken, setAcceptedToken] =
    useState(USDC_ADDRESS);
  const [endTime, setEndTime] = useState("");
  const [imageFile, setImageFile] =
    useState<File | null>(null);
  const [imagePreview, setImagePreview] =
    useState<string>("");
  const [ipfsClient, setIpfsClient] = useState<any>(null);
  const [submitting, setSubmitting] =
    useState(false);
  const [error, setError] = useState<string | null>(
    null
  );

  // wagmi contract write
  const { writeAsync } = useContractWrite({
    address: crowdfundContractConfig.address,
    abi: crowdfundContractConfig.abi,
    functionName: "createCampaign",
  });

  // initialize IPFS client on mount
  useEffect(() => {
    getIpfsClient()
      .then((client) => setIpfsClient(client))
      .catch(console.error);
  }, []);

  // generate preview URL when user selects a file
  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  // on form submit
  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    setError(null);

    // validate required fields
    if (
      !title.trim() ||
      !description.trim() ||
      !endTime.trim() ||
      !targetAmount.trim()
    ) {
      setError("Wypełnij wszystkie wymagane pola.");
      return;
    }

    // parse amount to bigint
    let amountBI: bigint;
    try {
      amountBI = parseUnits(targetAmount, 6);
      if (amountBI <= 0n) throw new Error();
    } catch {
      setError(
        "Podaj prawidłową kwotę (np. 500.00)."
      );
      return;
    }

    // parse endTime to unix seconds
    let ts: bigint;
    try {
      const ms = new Date(endTime).getTime();
      ts = BigInt(Math.floor(ms / 1000));
      if (
        ts <= BigInt(Math.floor(Date.now() / 1000))
      )
        throw new Error();
    } catch {
      setError(
        "Data zakończenia musi być w przyszłości."
      );
      return;
    }

    if (!ipfsClient) {
      setError("IPFS client not initialized.");
      return;
    }

    setSubmitting(true);

    try {
      // 1) upload image to IPFS if provided
      let imageCID = "";
      if (imageFile) {
        const addedImage = await ipfsClient.add(
          imageFile
        );
        imageCID = addedImage.path;
      }

      // 2) prepare metadata JSON
      const metadata = {
        title: title.trim(),
        description: description.trim(),
        image: imageCID
          ? `ipfs://${imageCID}`
          : "",
      };
      const metadataBuffer = Buffer.from(
        JSON.stringify(metadata)
      );
      const addedMeta = await ipfsClient.add(
        metadataBuffer
      );
      const metadataCID = addedMeta.path;

      // 3) call contract with generated metadata CID
      const tx = await writeAsync({
        args: [
          campaignType === "startup" ? 0 : 1, // enum Crowdfund.CampaignType
          acceptedToken,
          amountBI,
          metadataCID,
          ts,
        ],
      });
      await tx.wait();

      // navigate home on success
      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          "Błąd w trakcie tworzenia kampanii."
      );
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#E0F0FF] py-12 px-4">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Form */}
        <div className="w-full lg:w-1/2">
          <h1 className="text-3xl font-bold text-[#1F4E79] mb-6 text-center">
            Utwórz zbiórkę
          </h1>

          <div className="bg-green-500 text-white rounded-lg p-4 mb-8 shadow-lg">
            <h2 className="font-semibold mb-2">
              Zakładając zbiórkę:
            </h2>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>
                zbierasz środki na konkretny cel i
                zapewniasz zielony pasek,
              </li>
              <li>zbierasz 1.5% podatku,</li>
              <li>
                opłacasz lub refundujesz wydatki bez
                wychodzenia z domu,
              </li>
              <li>
                dołączasz do Podopiecznych naszej
                platformy.
              </li>
            </ul>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg p-6 shadow-xl border border-gray-200 space-y-6"
          >
            {/* Typ zbiórki */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Typ zbiórki
              </label>
              <select
                className="w-full border border-gray-300 rounded p-2 text-black focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-500"
                value={campaignType}
                onChange={(e) =>
                  setCampaignType(
                    e.target.value as
                      | "startup"
                      | "charity"
                  )
                }
              >
                <option value="startup">
                  Startup
                </option>
                <option value="charity">
                  Charytatywna
                </option>
              </select>
            </div>

            {/* Tytuł zbiórki */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Tytuł zbiórki
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded p-2 text-black focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-500"
                placeholder="Krótki tytuł kampanii"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
              />
            </div>

            {/* Opis */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Opisz sytuację i przedstaw nam bliżej problem
              </label>
              <textarea
                className="w-full border border-gray-300 rounded p-2 h-32 resize-none text-black focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-500"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Tutaj wpisz opis..."
              />
            </div>

            {/* Kwota zbiórki */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Kwota zbiórki (USDC)
              </label>
              <input
                type="number"
                step="0.01"
                className="
                  w-full border border-gray-300
                  rounded p-2 text-black focus:outline-none
                  focus:ring-2 focus:ring-green-300
                  focus:border-green-500
                "
                placeholder="np. 500.00"
                value={targetAmount}
                onChange={(e) =>
                  setTargetAmount(e.target.value)
                }
              />
            </div>

            {/* Akceptowany token */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Akceptowany token
              </label>
              <select
                className="w-full border border-gray-300 rounded p-2 text-black focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-500"
                value={acceptedToken}
                onChange={(e) =>
                  setAcceptedToken(e.target.value)
                }
              >
                <option value={USDC_ADDRESS}>
                  USDC (Sepolia)
                </option>
              </select>
            </div>

            {/* Data zakończenia */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Data zakończenia
              </label>
              <input
                type="datetime-local"
                className="w-full border border-gray-300 rounded p-2 text-black focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-500"
                value={endTime}
                onChange={(e) =>
                  setEndTime(e.target.value)
                }
              />
            </div>

            {/* Upload image */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Zdjęcie (opcjonalne)
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full text-gray-700"
                onChange={(e) => {
                  const file =
                    e.target.files?.[0] ?? null;
                  setImageFile(file);
                }}
              />
            </div>

            {error && (
              <div className="text-red-600 font-medium">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
              >
                Anuluj
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`
                  px-6 py-3 font-semibold rounded transition ${
                    submitting
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-green-500 text-white hover:bg-green-600"
                  }
                `}
              >
                {submitting
                  ? "Tworzę…"
                  : "Utwórz zbiórkę"}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview */}
        <div className="w-full lg:w-1/2 bg-white rounded-lg p-6 shadow-xl border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Podgląd karty
          </h2>
          <div className="border rounded-lg overflow-hidden">
            <div className="w-full h-48 bg-gray-100 relative">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Podgląd"
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Brak zdjęcia
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-xl font-bold text-[#1F4E79] mb-2">
                {title || "Tytuł kampanii"}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {description ||
                  "Opis kampanii pojawi się tutaj."}
              </p>
              <div className="text-sm text-gray-700 mb-1">
                <strong>Typ:</strong>{" "}
                {campaignType === "startup"
                  ? "Startup"
                  : "Charytatywna"}
              </div>
              <div className="text-sm text-gray-700 mb-1">
                <strong>Kwota:</strong>{" "}
                {targetAmount || "0.00"} USDC
              </div>
              <div className="text-sm text-gray-700 mb-1">
                <strong>Akceptowany token:</strong>{" "}
                USDC (Sepolia)
              </div>
              <div className="text-sm text-gray-700">
                <strong>Zakończenie:</strong>{" "}
                {endTime
                  ? new Date(endTime).toLocaleString(
                      "pl-PL"
                    )
                  : "—"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
