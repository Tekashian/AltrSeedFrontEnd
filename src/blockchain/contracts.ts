// src/blockchain/contracts.ts
import { CROWDFUND_ABI } from './crowdfundAbi'
import { USDC_ABI } from './usdcContractAbi'

// Adres Twojego Crowdfund-a
export const CROWDFUND_CONTRACT_ADDRESS =
  '0x768b51618dBb234629B84a224f630E2a23Ee2Bbc' as const

// Adres kontraktu USDC na Sepolii
export const USDC_CONTRACT_ADDRESS =
  '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as const

export const crowdfundContractConfig = {
  address: CROWDFUND_CONTRACT_ADDRESS,
  abi: CROWDFUND_ABI,
} as const

export const usdcContractConfig = {
  address: USDC_CONTRACT_ADDRESS,
  abi: USDC_ABI,
} as const
