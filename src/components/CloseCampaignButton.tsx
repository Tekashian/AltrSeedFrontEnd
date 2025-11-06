// src/components/CloseCampaignButton.tsx
'use client'

import React, { useState } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { CROWDFUND_ABI } from '../blockchain/crowdfundAbi'

const CROWDFUND_ADDRESS = '0x774Ebb8388d01c54E8334B090e3cED93F748e79d'

interface CloseCampaignButtonProps {
  campaignId: number
  className?: string
  children?: React.ReactNode
}

const CloseCampaignButton: React.FC<CloseCampaignButtonProps> = ({
  campaignId,
  className,
  children
}) => {
  const { address } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const [step, setStep] = useState<'idle' | 'closing' | 'done'>('idle')
  const [txHash, setTxHash] = useState<string | null>(null)

  const handleCloseFlow = async () => {
    try {
      if (campaignId === undefined || campaignId < 1 || isNaN(Number(campaignId))) {
        throw new Error('Invalid campaignId provided to CloseCampaignButton. Must be >= 1')
      }

      setStep('closing')

      const closeTxHash = await writeContractAsync({
        address: CROWDFUND_ADDRESS,
        abi: CROWDFUND_ABI,
        functionName: 'initiateClosure',
        args: [BigInt(campaignId)],
      })

      console.log('[InitiateClosure Tx]', closeTxHash)

      setTxHash(closeTxHash)
      setStep('done')
    } catch (err) {
      console.error('[Close Campaign Flow Error]', err)
      setStep('idle')
    }
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={handleCloseFlow}
        disabled={step !== 'idle'}
        className={`px-6 py-3 bg-[#FF5555] text-white text-lg font-semibold rounded-lg hover:bg-[#E04E4E] transition disabled:opacity-50 ${
          className || ''
        }`}
      >
        {step === 'idle' && (children || 'Close Campaign')}
        {step === 'closing' && 'Closing...'}
        {step === 'done' && 'Closed ✅'}
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
  )
}

export default CloseCampaignButton
