// src/components/RefundButton.tsx
'use client';

import React, { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';
import { CROWDFUND_ABI } from '../blockchain/crowdfundAbi';

const CROWDFUND_ADDRESS = '0x774Ebb8388d01c54E8334B090e3cED93F748e79d';

interface RefundButtonProps {
  campaignId: number;
  refundAmount: string;
}

const RefundButton: React.FC<RefundButtonProps> = ({ campaignId, refundAmount }) => {
  const [step, setStep] = useState<'idle' | 'refunding' | 'done'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const { writeContractAsync } = useWriteContract();

  // parseUnits expects string amount and decimals; refundAmount isn't used by claimRefund
  const amount = parseUnits(refundAmount || '0', 6);

  const handleRefund = async () => {
    try {
      setStep('refunding');
      const tx = await writeContractAsync({
        address: CROWDFUND_ADDRESS,
        abi: CROWDFUND_ABI,
        functionName: 'claimRefund',
        args: [BigInt(campaignId)],
      });
      setTxHash(tx);
      setStep('done');
    } catch (err) {
      console.error('[Refund Error]', err);
      setStep('idle');
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Wrapper limited to the button and its tooltip */}
      <div className="relative inline-block group">
        {/* Tooltip: appears only when hovering the button */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-white text-gray-800 text-xs whitespace-nowrap rounded px-2 py-1 border border-gray-300 shadow">
            Koszt prowizji: 20%
          </div>
          <div
            className="w-0 h-0 border-l-4 border-r-4 border-t-4 
                       border-l-transparent border-r-transparent border-t-white mx-auto"
          />
        </div>

        <button
          onClick={handleRefund}
          disabled={step !== 'idle'}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
        >
          {step === 'idle' && 'Refund'}
          {step === 'refunding' && 'Refunding...'}
          {step === 'done' && 'Refunded ✅'}
        </button>
      </div>

      {txHash && (
        <p className="text-sm text-green-500">
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

export default RefundButton;
