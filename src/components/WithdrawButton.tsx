// src/components/WithdrawButton.tsx
'use client'

import React, { useState } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { CROWDFUND_ABI } from '../blockchain/crowdfundAbi'

interface WithdrawButtonProps {
  campaignId: number
  className?: string
  children?: React.ReactNode
}

const CROWDFUND_ADDRESS = '0x774Ebb8388d01c54E8334B090e3cED93F748e79d'

const WithdrawButton: React.FC<WithdrawButtonProps> = ({
  campaignId,
  className,
  children
}) => {
  const { address } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const [step, setStep] = useState<'idle' | 'withdrawing' | 'done'>('idle')
  const [txHash, setTxHash] = useState<string | null>(null)

  const handleWithdrawFlow = async () => {
    try {
      if (campaignId === undefined || campaignId < 1 || isNaN(Number(campaignId))) {
        throw new Error('Invalid campaignId provided to WithdrawButton. Must be >= 1')
      }

      setStep('withdrawing')

      const withdrawTxHash = await writeContractAsync({
        address: CROWDFUND_ADDRESS,
        abi: CROWDFUND_ABI,
        functionName: 'withdrawFunds',
        args: [campaignId],
      })

      console.log('[Withdraw Tx]', withdrawTxHash)

      setTxHash(withdrawTxHash)
      setStep('done')
    } catch (err) {
      console.error('[Withdraw Flow Error]', err)
      setStep('idle')
    }
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={handleWithdrawFlow}
        disabled={step !== 'idle'}
        className={`px-6 py-3 bg-[#1F4E79] text-white text-lg font-semibold rounded-lg hover:bg-[#163D60] transition disabled:opacity-50 ${
          className || ''
        }`}
      >
        {step === 'idle' && (children || 'Withdraw')}
        {step === 'withdrawing' && 'Withdrawing...'}
        {step === 'done' && 'Withdrawn ✅'}
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

export default WithdrawButton
