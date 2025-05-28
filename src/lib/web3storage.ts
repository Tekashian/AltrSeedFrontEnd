// src/lib/web3storage.ts

import { Web3Storage, type Filelike } from 'web3.storage'

/**
 * Zwraca klienta Web3.Storage
 */
export function getWeb3StorageClient(): Web3Storage {
  const token = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN
  const space = process.env.NEXT_PUBLIC_WEB3_STORAGE_SPACE_ID

  if (!token) {
    throw new Error('Brakuje NEXT_PUBLIC_WEB3_STORAGE_TOKEN w .env.local')
  }
  // jeśli nie używasz konkretnych Spaces, możesz pominąć space ↓
  if (!space) {
    throw new Error('Brakuje NEXT_PUBLIC_WEB3_STORAGE_SPACE_ID w .env.local')
  }

  return new Web3Storage({
    token,
    endpoint: new URL('https://api.web3.storage'),
    space, // jeśli nie masz Spaces, usuń tę linię
  })
}

/**
 * Uploaduje dowolne pliki i zwraca CID katalogu.
 */
export async function uploadToWeb3Storage(files: Filelike[]): Promise<string> {
  const client = getWeb3StorageClient()
  const cid = await client.put(files)
  return cid
}
