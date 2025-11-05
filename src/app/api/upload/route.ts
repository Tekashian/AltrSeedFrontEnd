// src/app/api/upload/route.ts
import { NextResponse } from "next/server";
import { create, type Client } from "@web3-storage/w3up-client";
import { Signer } from "@web3-storage/w3up-client/principal/ed25519";
import { StoreMemory } from "@web3-storage/w3up-client/stores/memory";
import * as Proof from "@web3-storage/w3up-client/proof";

// wymuszamy Node.js runtime, bo używamy blob + ed25519
export const runtime = "nodejs";

// obsługa POST → przyjmuje FormData z polem "file"
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file") as Blob;
    if (!file) {
      return NextResponse.json(
        { error: "Brak pliku w polu ‘file’" },
        { status: 400 }
      );
    }

    // 1) inicjalizacja klienta z KEY/PROOF
    const principal = Signer.parse(process.env.STORACHA_KEY!);
    const store = new StoreMemory();
    const client: Client = await create({ principal, store });

    const proof = await Proof.parse(process.env.STORACHA_PROOF!);
    const space = await client.addSpace(proof);
    await client.setCurrentSpace(process.env.NEXT_PUBLIC_SPACE_DID! as `did:${string}:${string}`);

    // 2) upload pliku
    // Blob w Node.js nie ma nazwy – tworzymy File-like, żeby zachować nazwę
    const filename = (file as any).name || "upload";
    const fileWithName = new File([file], filename);
    const cid = await client.uploadFile(fileWithName);

    return NextResponse.json({ cid });
  } catch (e: any) {
    console.error("[api/upload] błąd:", e);
    return NextResponse.json(
      { error: e.message || "Nieznany błąd" },
      { status: 500 }
    );
  }
}
