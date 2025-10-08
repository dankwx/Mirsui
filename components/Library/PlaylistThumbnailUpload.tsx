'use client'

import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoaderCircle, Upload, Check, ImageIcon } from 'lucide-react'
import { uploadPlaylistThumbnail } from '@/utils/libraryService.client'
import { useToast } from '@/components/ui/use-toast'

interface PlaylistThumbnailUploadProps {
    playlistId: string
    playlistName: string
    currentThumbnail?: string | null
    isOpen: boolean
    onClose: () => void
    onSuccess: (thumbnailUrl: string) => void
}

export default function PlaylistThumbnailUpload({
    playlistId,
    playlistName,
    currentThumbnail,
    isOpen,
    onClose,
    onSuccess,
}: PlaylistThumbnailUploadProps) {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const { toast } = useToast()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            
            // Validar tipo de arquivo
            if (!selectedFile.type.startsWith('image/')) {
                toast({
                    title: "Erro",
                    description: "Por favor, selecione apenas arquivos de imagem.",
                    variant: "destructive",
                })
                return
            }

            // Validar tamanho do arquivo (máximo 5MB)
            if (selectedFile.size > 5 * 1024 * 1024) {
                toast({
                    title: "Erro",
                    description: "A imagem deve ter no máximo 5MB.",
                    variant: "destructive",
                })
                return
            }

            setFile(selectedFile)

            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string)
            }
            reader.readAsDataURL(selectedFile)
        }
    }

    const handleUpload = async () => {
        if (!file || !playlistId) return

        try {
            setUploading(true)

            const result = await uploadPlaylistThumbnail(playlistId, file)

            if (result.success && result.thumbnailUrl) {
                setUploadSuccess(true)
                onSuccess(result.thumbnailUrl)
                
                toast({
                    title: "Sucesso!",
                    description: "Thumbnail da playlist atualizada com sucesso.",
                })

                // Reset state and close modal after success
                setTimeout(() => {
                    handleClose()
                }, 1500)
            } else {
                toast({
                    title: "Erro",
                    description: result.error || "Falha ao fazer upload da imagem",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error('Error uploading playlist thumbnail:', error)
            toast({
                title: "Erro",
                description: "Erro inesperado ao fazer upload da imagem",
                variant: "destructive",
            })
        } finally {
            setUploading(false)
        }
    }

    const handleClose = () => {
        setFile(null)
        setPreviewUrl(null)
        setUploadSuccess(false)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Alterar Thumbnail da Playlist</DialogTitle>
                    <DialogDescription>
                        Faça upload de uma imagem para a playlist "{playlistName}"
                    </DialogDescription>
                </DialogHeader>

                <div className="grid w-full gap-4">
                    {(previewUrl || currentThumbnail) && (
                        <div className="flex justify-center">
                            <div className="relative h-32 w-32 rounded-lg overflow-hidden bg-muted">
                                <img
                                    src={previewUrl || currentThumbnail || ''}
                                    alt="Preview"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>
                    )}

                    {!previewUrl && !currentThumbnail && (
                        <div className="flex justify-center">
                            <div className="h-32 w-32 rounded-lg bg-muted flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </div>
                    )}

                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full"
                    />
                    
                    <p className="text-sm text-muted-foreground text-center">
                        Formatos aceitos: JPG, PNG, GIF (máximo 5MB)
                    </p>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={uploading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="min-w-[120px]"
                    >
                        {uploading ? (
                            <>
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                Enviando...
                            </>
                        ) : uploadSuccess ? (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                Enviado
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Enviar
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}