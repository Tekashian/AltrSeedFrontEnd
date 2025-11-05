// src/components/UpdateCampaignButton.tsx
'use client'

import React, { useState } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { CROWDFUND_ABI } from '../app/abi/CrowdfundAbi'

const CROWDFUND_ADDRESS = '0x774Ebb8388d01c54E8334B090e3cED93F748e79d'

interface UpdateCampaignButtonProps {
  campaignId: number
  currentMetadata?: {
    title: string
    description: string
    image: string
  }
  className?: string
  onSuccess?: () => void
}

const UpdateCampaignButton: React.FC<UpdateCampaignButtonProps> = ({
  campaignId,
  currentMetadata,
  className,
  onSuccess
}) => {
  const { address } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [step, setStep] = useState<'idle' | 'uploading' | 'updating' | 'done'>('idle')
  const [txHash, setTxHash] = useState<string | null>(null)
  
  // Form state
  const [title, setTitle] = useState(currentMetadata?.title || '')
  const [description, setDescription] = useState(currentMetadata?.description || '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState(currentMetadata?.image || '')

  React.useEffect(() => {
    if (!imageFile) return
    const url = URL.createObjectURL(imageFile)
    setImagePreview(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  const handleUpdate = async () => {
    try {
      if (!title.trim() || !description.trim()) {
        alert('Tytuł i opis są wymagane')
        return
      }

      setStep('uploading')

      // Upload new image if provided
      let imageCID = ''
      if (imageFile) {
        const form = new FormData()
        form.append('file', imageFile)
        const res = await fetch('/api/upload', { method: 'POST', body: form })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Błąd uploadu pliku')
        imageCID = typeof data.cid === 'object' && data.cid['/'] ? data.cid['/'] : String(data.cid)
      }

      // Create updated metadata
      const metadata = {
        title: title.trim(),
        description: description.trim(),
        image: imageCID ? `https://ipfs.io/ipfs/${imageCID}` : currentMetadata?.image || '',
      }

      // Upload metadata to IPFS
      const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' })
      const file = new File([blob], 'metadata.json', { type: 'application/json' })
      const fm = new FormData()
      fm.append('file', file)
      const mr = await fetch('/api/upload', { method: 'POST', body: fm })
      const md = await mr.json()
      if (!mr.ok) throw new Error(md.error || 'Błąd uploadu metadanych')
      const metadataCID = typeof md.cid === 'object' && md.cid['/'] ? md.cid['/'] : String(md.cid)

      setStep('updating')

      // Update campaign on blockchain
      const updateTxHash = await writeContractAsync({
        address: CROWDFUND_ADDRESS,
        abi: CROWDFUND_ABI,
        functionName: 'updateDataCID',
        args: [BigInt(campaignId + 1), metadataCID],
      })

      console.log('[Update Campaign Tx]', updateTxHash)

      setTxHash(updateTxHash)
      setStep('done')
      
      if (onSuccess) {
        onSuccess()
      }

      setTimeout(() => {
        setIsModalOpen(false)
        setStep('idle')
        setTxHash(null)
      }, 3000)

    } catch (err) {
      console.error('[Update Campaign Error]', err)
      setStep('idle')
      alert('❌ Wystąpił błąd podczas aktualizacji kampanii: ' + (err as Error).message)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`px-4 py-2 bg-[#00ADEF] text-white rounded-lg hover:bg-[#0088CC] transition ${className || ''}`}
      >
        Edytuj kampanię
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#1F4E79]">Edytuj kampanię</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                  disabled={step !== 'idle'}
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-medium text-black mb-1">Tytuł</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded p-2 text-black"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={step !== 'idle'}
                  />
                </div>

                <div>
                  <label className="block font-medium text-black mb-1">Opis</label>
                  <textarea
                    className="w-full border border-gray-300 rounded p-2 h-32 text-black"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={step !== 'idle'}
                  />
                </div>

                <div>
                  <label className="block font-medium text-black mb-1">Nowe zdjęcie (opcjonalne)</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full text-black"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    disabled={step !== 'idle'}
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Podgląd"
                        className="w-32 h-32 object-cover rounded"
                      />
                    </div>
                  )}
                </div>

                {txHash && (
                  <div className="p-3 bg-blue-50 rounded">
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
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded text-black hover:bg-gray-50"
                    disabled={step !== 'idle'}
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={step !== 'idle' || !title.trim() || !description.trim()}
                    className={`px-6 py-2 rounded text-white ${
                      step !== 'idle' || !title.trim() || !description.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#00ADEF] hover:bg-[#0088CC]'
                    }`}
                  >
                    {step === 'idle' && 'Zaktualizuj'}
                    {step === 'uploading' && 'Uploading...'}
                    {step === 'updating' && 'Updating...'}
                    {step === 'done' && 'Updated ✅'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default UpdateCampaignButton