// src/blockchain/contracts.ts
import { CROWDFUND_ABI } from './crowdfundAbi';

export const CROWDFUND_CONTRACT_ADDRESS = '0x768b51618dBb234629B84a224f630E2a23Ee2Bbc' as const;

export const crowdfundContractConfig = {
  address: CROWDFUND_CONTRACT_ADDRESS,
  abi: CROWDFUND_ABI,
} as const;