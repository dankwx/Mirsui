'use client'

import React, { useState } from 'react'
import { LoaderCircle, Upload, Check, ImageIcon } from 'lucide-react'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

interface UserProps {
    username: string | null
    id: string
    onAvatarClick: (isClicked: boolean) => void
    avatar_url?: string | null
}

export default function ModalChangeAvatar({
    username,
    id,
    onAvatarClick,
    avatar_url,
}: UserProps) {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]

            if (!ALLOWED_TYPES.includes(selectedFile.type)) {
                setError('Formato inválido. Use JPG, PNG, WEBP ou GIF.')
                return
            }
            if (selectedFile.size > MAX_BYTES) {
                setError('A imagem deve ter no máximo 5MB.')
                return
            }

            setError(null)
            setFile(selectedFile)

            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string)
            }
            reader.readAsDataURL(selectedFile)
        }
    }

    // O upload vai pelo backend (service role), não direto no bucket com a anon
    // key: o caminho do arquivo é `<uuid>/profile-picture`, previsível, e o
    // Storage aceitava escrita anônima — dava pra trocar a foto de qualquer um.
    const handleUpload = async () => {
        if (!file || !id) return

        try {
            setUploading(true)
            setError(null)

            const body = new FormData()
            body.append('file', file)

            const response = await fetch(`/api/profiles/${id}/avatar`, {
                method: 'POST',
                body,
            })
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data?.error || 'Erro ao enviar a foto')
            }

            setUploadSuccess(true)

            // Reset state and close modal after success
            setTimeout(() => {
                onAvatarClick(false)
                setUploadSuccess(false)
                setFile(null)
                setPreviewUrl(null)
            }, 1500)
        } catch (err) {
            console.error('Erro ao enviar a foto de perfil:', err)
            setError(
                err instanceof Error ? err.message : 'Erro ao enviar a foto'
            )
        } finally {
            setUploading(false)
        }
    }

    const closeModal = () => onAvatarClick(false)

    return (
        <div
            onClick={closeModal}
            className="anim-fade fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-[rgba(8,6,3,0.72)] px-5 py-12 backdrop-blur-md"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="anim-pop w-full max-w-[460px] overflow-hidden rounded-[18px] border border-mir-line2/80 bg-[#1c160e] shadow-[0_40px_80px_-30px_rgba(0,0,0,.7)]"
            >
                {/* HEADER */}
                <div className="flex items-start justify-between gap-4 border-b border-mir-line px-6 py-[22px]">
                    <div>
                        <div className="mb-[7px] font-mono text-[10px] tracking-[0.18em] text-mir-acc">
                            FOTO DE PERFIL
                        </div>
                        <h3 className="m-0 text-[25px] font-black tracking-[-0.035em]">
                            Trocar foto
                        </h3>
                        {username && (
                            <div className="mt-1 font-mono text-[12px] text-mir-text2/[0.8]">
                                @{username}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={closeModal}
                        className="flex h-[34px] w-[34px] flex-none cursor-pointer items-center justify-center rounded-full border border-mir-line2 bg-transparent text-base leading-[0] text-mir-text/70"
                    >
                        ✕
                    </button>
                </div>

                {/* BODY */}
                <div className="flex flex-col items-center gap-5 px-6 pb-6 pt-6">
                    {/* PREVIEW */}
                    <div className="relative h-[140px] w-[140px] flex-none overflow-hidden rounded-full border border-mir-line2/70 bg-[#241c12] shadow-[0_28px_56px_-20px_rgba(0,0,0,.8)]">
                        {previewUrl || avatar_url ? (
                            <img
                                src={previewUrl || avatar_url || ''}
                                alt="Preview"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-mir-text2/50">
                                <ImageIcon className="h-9 w-9" />
                            </div>
                        )}
                    </div>

                    {/* FILE PICKER */}
                    <label className="group flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-mir-line2/70 bg-[#241c12] px-[18px] py-[18px] transition-colors duration-150 hover:border-mir-acc/60 hover:bg-[#2a2114]">
                        <Upload className="h-[18px] w-[18px] flex-none text-mir-text2/50 transition-colors duration-150 group-hover:text-mir-acc" />
                        <span className="text-[14px] font-medium tracking-[-0.01em] text-mir-text">
                            {file ? file.name : 'Escolher uma imagem'}
                        </span>
                        <input
                            type="file"
                            accept={ALLOWED_TYPES.join(',')}
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>

                    {error ? (
                        <p className="text-center font-mono text-[11px] leading-[1.6] text-red-400/90">
                            {error}
                        </p>
                    ) : (
                        <p className="text-center font-mono text-[11px] leading-[1.6] text-mir-text2/[0.66]">
                            JPG, PNG, WEBP ou GIF, até 5MB. A imagem fica
                            quadrada, recortada em círculo.
                        </p>
                    )}
                </div>

                {/* FOOTER */}
                <div className="flex items-center justify-end gap-3 border-t border-mir-line px-6 py-[18px]">
                    <button
                        type="button"
                        onClick={closeModal}
                        disabled={uploading}
                        className="cursor-pointer rounded-full border border-mir-line2 bg-transparent px-5 py-[10px] text-[13px] font-semibold tracking-[-0.01em] text-mir-text/80 transition-colors hover:border-mir-line2 hover:text-mir-text disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="flex min-w-[140px] cursor-pointer items-center justify-center gap-2 rounded-full bg-mir-acc px-5 py-[10px] text-[13px] font-black tracking-[-0.01em] text-mir-on-acc transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {uploading ? (
                            <>
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                Enviando...
                            </>
                        ) : uploadSuccess ? (
                            <>
                                <Check className="h-4 w-4" />
                                Enviado
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4" />
                                Salvar foto
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
