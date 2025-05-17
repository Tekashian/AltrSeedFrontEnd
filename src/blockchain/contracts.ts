// src/blockchain/contracts.ts
import { CROWDFUND_ABI } from './crowdfundAbi';

export const CROWDFUND_CONTRACT_ADDRESS = '0x15c86f9b8Ee364b208653eAb714f4902Ab6112F5' as const;

export const crowdfundContractConfig = {
  address: CROWDFUND_CONTRACT_ADDRESS,
  abi: CROWDFUND_ABI,
} as const;