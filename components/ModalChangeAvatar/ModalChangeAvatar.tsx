'use client'

import React, { useState } from 'react'
import { Check, ImageIcon, LoaderCircle, Upload, X } from 'lucide-react'
import FotoDePerfil from '@/components/FotoDePerfil'
import recipes from '@/components/Club/club-recipes.module.css'
import styles from './ModalChangeAvatar.module.css'

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

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0]
        if (!selectedFile) return

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
        reader.onloadend = () => setPreviewUrl(reader.result as string)
        reader.readAsDataURL(selectedFile)
    }

    // O upload passa pelo backend, que valida a sessão antes de escrever no
    // Storage. O caminho continua sendo <uuid>/profile-picture.
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
            setTimeout(() => {
                onAvatarClick(false)
                setUploadSuccess(false)
                setFile(null)
                setPreviewUrl(null)
            }, 1500)
        } catch (uploadError) {
            console.error('Erro ao enviar a foto de perfil:', uploadError)
            setError(
                uploadError instanceof Error
                    ? uploadError.message
                    : 'Erro ao enviar a foto'
            )
        } finally {
            setUploading(false)
        }
    }

    const closeModal = () => onAvatarClick(false)

    return (
        <div
            onClick={closeModal}
            className={styles.overlay}
            role="presentation"
        >
            <div
                onClick={(event) => event.stopPropagation()}
                className={styles.card}
                role="dialog"
                aria-modal="true"
                aria-label="Trocar foto"
            >
                <div className={styles.header}>
                    <div>
                        <h3>Trocar foto</h3>
                        {username && <p>@{username}</p>}
                    </div>
                    <button
                        type="button"
                        onClick={closeModal}
                        className={styles.close}
                        aria-label="Fechar"
                    >
                        <X size={16} aria-hidden="true" />
                    </button>
                </div>

                <div className={styles.body}>
                    <div className={styles.preview}>
                        <FotoDePerfil
                            src={previewUrl || avatar_url}
                            className={styles.previewImage}
                        >
                            <ImageIcon size={36} aria-hidden="true" />
                        </FotoDePerfil>
                    </div>

                    <label className={styles.filePicker}>
                        <Upload size={18} aria-hidden="true" />
                        <span>{file ? file.name : 'Escolher uma imagem'}</span>
                        <input
                            type="file"
                            accept={ALLOWED_TYPES.join(',')}
                            onChange={handleFileChange}
                            className={styles.fileInput}
                        />
                    </label>

                    {error ? (
                        <p className={styles.error} role="alert">
                            {error}
                        </p>
                    ) : (
                        <p className={styles.help}>
                            JPG, PNG, WEBP ou GIF, até 5MB. A imagem fica
                            quadrada, recortada em círculo.
                        </p>
                    )}
                </div>

                <div className={styles.footer}>
                    <button
                        type="button"
                        onClick={closeModal}
                        disabled={uploading}
                        className={recipes.outlineButton}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className={`${recipes.button} ${styles.save}`}
                    >
                        {uploading ? (
                            <>
                                <LoaderCircle size={16} className={styles.spinner} aria-hidden="true" />
                                Enviando...
                            </>
                        ) : uploadSuccess ? (
                            <>
                                <Check size={16} aria-hidden="true" />
                                Enviado
                            </>
                        ) : (
                            <>
                                <Upload size={16} aria-hidden="true" />
                                Salvar foto
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
