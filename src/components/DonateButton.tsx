// src/components/DonateButton.tsx
'use client';

import React, { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { USDC_ABI } from '../blockchain/usdcContractAbi';
import { CROWDFUND_ABI } from '../blockchain/crowdfundAbi';
import { parseUnits } from 'viem';

interface DonateButtonProps {
  campaignId: number;
  donationAmount: string;
  className?: string;
  children?: React.ReactNode;
}

const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
const CROWDFUND_ADDRESS = '0x774Ebb8388d01c54E8334B090e3cED93F748e79d';

const DonateButton: React.FC<DonateButtonProps> = ({
  campaignId,
  donationAmount,
  className,
  children
}) => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [step, setStep] = useState<'idle' | 'approving' | 'donating' | 'done'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);

  const amount = parseUnits(donationAmount || '0', 6);

  const handleDonateFlow = async () => {
    try {
      if (campaignId === undefined || campaignId < 1 || isNaN(Number(campaignId))) {
        throw new Error('Invalid campaignId provided to DonateButton. Must be >= 1');
      }

      setStep('approving');

      const approveTxHash = await writeContractAsync({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [CROWDFUND_ADDRESS, amount],
      });

      console.log('[USDC Approve Tx]', approveTxHash);

      setStep('donating');

      const donateTxHash = await writeContractAsync({
        address: CROWDFUND_ADDRESS,
        abi: CROWDFUND_ABI,
        functionName: 'donate',
        args: [campaignId, amount],
      });

      console.log('[Donate Tx]', donateTxHash);

      setTxHash(donateTxHash);
      setStep('done');
    } catch (err) {
      console.error('[Donate Flow Error]', err);
      setStep('idle');
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={handleDonateFlow}
        disabled={step !== 'idle'}
        className={`px-6 py-3 bg-[#68CC89] text-white text-lg font-semibold rounded-lg hover:bg-[#5BBE7A] transition disabled:opacity-50 ${className || ''}`}
      >
        {step === 'idle' && (children || 'Donate')}
        {step === 'approving' && 'Approving...'}
        {step === 'donating' && 'Donating...'}
        {step === 'done' && 'Thank you! ✅'}
      </button>

      {txHash && (
        <p className="text-sm text-[#1F4E79]">
          TX:{' '}
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {txHash.slice(0, 10)}...
          </a>
        </p>
      )}
    </div>
  );
};

export default DonateButton;
