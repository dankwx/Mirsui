'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, ImageIcon, X } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface CreatePlaylistDialogProps {
    onCreatePlaylist: (name: string, description: string, thumbnail?: File) => Promise<void>
    isLoading?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
    hideButton?: boolean
}

export default function CreatePlaylistDialog({ 
    onCreatePlaylist, 
    isLoading = false,
    open: externalOpen,
    onOpenChange: externalOnOpenChange,
    hideButton = false
}: CreatePlaylistDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
    
    const { toast } = useToast()

    // Use external state if provided, otherwise use internal state
    const open = externalOpen !== undefined ? externalOpen : internalOpen
    const setOpen = externalOnOpenChange || setInternalOpen

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            
            // Validar tipo de arquivo
            if (!file.type.startsWith('image/')) {
                toast({
                    title: "Erro",
                    description: "Por favor, selecione apenas arquivos de imagem.",
                    variant: "destructive",
                })
                return
            }

            // Validar tamanho do arquivo (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: "Erro",
                    description: "A imagem deve ter no máximo 5MB.",
                    variant: "destructive",
                })
                return
            }

            setThumbnailFile(file)

            // Criar preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setThumbnailPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeThumbnail = () => {
        setThumbnailFile(null)
        setThumbnailPreview(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!name.trim()) {
            toast({
                title: "Error",
                description: "Playlist name is required",
                variant: "destructive"
            })
            return
        }

        try {
            await onCreatePlaylist(name.trim(), description.trim(), thumbnailFile || undefined)
            setName('')
            setDescription('')
            setThumbnailFile(null)
            setThumbnailPreview(null)
            setOpen(false)
            toast({
                title: "Success",
                description: "Playlist created successfully!"
            })
        } catch (error) {
            console.error('Error creating playlist:', error)
            toast({
                title: "Error",
                description: "Failed to create playlist",
                variant: "destructive"
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!hideButton && (
                <DialogTrigger asChild>
                    <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Playlist
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Playlist</DialogTitle>
                        <DialogDescription>
                            Create a new playlist to organize your favorite tracks.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Playlist Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="My Awesome Playlist"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your playlist..."
                                rows={3}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="thumbnail">Thumbnail (Optional)</Label>
                            <div className="flex items-center gap-4">
                                {thumbnailPreview ? (
                                    <div className="relative">
                                        <img
                                            src={thumbnailPreview}
                                            alt="Thumbnail preview"
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="destructive"
                                            className="absolute -top-2 -right-2 h-6 w-6"
                                            onClick={removeThumbnail}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <Input
                                        id="thumbnail"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleThumbnailChange}
                                        className="w-full"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        JPG, PNG, GIF (máximo 5MB)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!name.trim() || isLoading}>
                            {isLoading ? 'Creating...' : 'Create Playlist'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}