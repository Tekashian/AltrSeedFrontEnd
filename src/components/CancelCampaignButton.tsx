// src/components/CancelCampaignButton.tsx
'use client'

import React, { useState } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { CROWDFUND_ABI } from '../blockchain/crowdfundAbi'

const CROWDFUND_ADDRESS = '0x774Ebb8388d01c54E8334B090e3cED93F748e79d'

interface CancelCampaignButtonProps {
  campaignId: number
  className?: string
  children?: React.ReactNode
  onSuccess?: () => void
}

const CancelCampaignButton: React.FC<CancelCampaignButtonProps> = ({
  campaignId,
  className,
  children,
  onSuccess
}) => {
  const { address } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const [step, setStep] = useState<'idle' | 'cancelling' | 'done'>('idle')
  const [txHash, setTxHash] = useState<string | null>(null)

  const handleCancel = async () => {
    try {
      if (campaignId === undefined || campaignId < 0 || isNaN(Number(campaignId))) {
        throw new Error('Invalid campaignId provided to CancelCampaignButton.')
      }

      const confirmed = window.confirm(
        'Czy na pewno chcesz anulować tę kampanię? Ta akcja jest nieodwracalna. Wszyscy darczyńcy będą mogli odebrać swoje wpłaty.'
      )
      
      if (!confirmed) return

      setStep('cancelling')

      const cancelTxHash = await writeContractAsync({
        address: CROWDFUND_ADDRESS,
        abi: CROWDFUND_ABI,
        functionName: 'cancelCampaign',
        args: [BigInt(campaignId + 1)], // Contract uses 1-based indexing, convert to BigInt
      })

      console.log('[Cancel Campaign Tx]', cancelTxHash)

      setTxHash(cancelTxHash)
      setStep('done')
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error('[Cancel Campaign Error]', err)
      setStep('idle')
      alert('❌ Wystąpił błąd podczas anulowania kampanii: ' + (err as Error).message)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={handleCancel}
        disabled={step !== 'idle'}
        className={`px-6 py-3 bg-red-600 text-white text-lg font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50 ${
          className || ''
        }`}
      >
        {step === 'idle' && (children || 'Cancel Campaign')}
        {step === 'cancelling' && 'Cancelling...'}
        {step === 'done' && 'Cancelled ✅'}
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

export default CancelCampaignButton