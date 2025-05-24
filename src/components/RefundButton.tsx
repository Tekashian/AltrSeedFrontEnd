// src/components/RefundButton.tsx
'use client';

import React, { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';
import { CROWDFUND_ABI } from '../blockchain/crowdfundAbi';

const CROWDFUND_ADDRESS = '0x768b51618dBb234629B84a224f630E2a23Ee2Bbc';

interface RefundButtonProps {
  campaignId: number;
  refundAmount: string;
}

const RefundButton: React.FC<RefundButtonProps> = ({ campaignId, refundAmount }) => {
  const [step, setStep] = useState<'idle' | 'refunding' | 'done'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const { writeContractAsync } = useWriteContract();

  const amount = parseUnits(refundAmount || '0', 6);

  const handleRefund = async () => {
    try {
      setStep('refunding');
      const tx = await writeContractAsync({
        address: CROWDFUND_ADDRESS,
        abi: CROWDFUND_ABI,
        functionName: 'claimRefund',
        args: [campaignId],
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
      <button
        onClick={handleRefund}
        disabled={step !== 'idle'}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
      >
        {step === 'idle' && 'Refund'}
        {step === 'refunding' && 'Refunding...'}
        {step === 'done' && 'Refunded ✅'}
      </button>

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
