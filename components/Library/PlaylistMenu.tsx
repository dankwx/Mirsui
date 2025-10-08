'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MoreVertical, Edit, Trash2, ImageIcon } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface Playlist {
    id: string
    name: string
    description: string | null
    thumbnail_url: string | null
    track_count: number
    created_at: string
    updated_at?: string
    tracks?: any[]
}

interface PlaylistMenuProps {
    playlist: Playlist
    onUpdate: (id: string, name: string, description: string) => Promise<void>
    onDelete: (id: string) => Promise<void>
    onChangeThumbnail?: (playlist: Playlist) => void
    variant?: 'card' | 'details' // Nova prop para controlar o estilo
}

export default function PlaylistMenu({ playlist, onUpdate, onDelete, onChangeThumbnail, variant = 'card' }: PlaylistMenuProps) {
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    
    const [editName, setEditName] = useState(playlist.name)
    const [editDescription, setEditDescription] = useState(playlist.description || '')
    
    const { toast } = useToast()

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!editName.trim()) {
            toast({
                title: "Error",
                description: "Playlist name is required",
                variant: "destructive"
            })
            return
        }

        setIsLoading(true)
        try {
            await onUpdate(playlist.id, editName.trim(), editDescription.trim())
            setEditDialogOpen(false)
            toast({
                title: "Success",
                description: "Playlist updated successfully!"
            })
        } catch (error) {
            console.error('Error updating playlist:', error)
            toast({
                title: "Error",
                description: "Failed to update playlist",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        setIsLoading(true)
        try {
            await onDelete(playlist.id)
            setDeleteDialogOpen(false)
            toast({
                title: "Success",
                description: "Playlist deleted successfully!"
            })
        } catch (error) {
            console.error('Error deleting playlist:', error)
            toast({
                title: "Error",
                description: "Failed to delete playlist",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className={
                            variant === 'card' 
                                ? "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                : "h-8 w-8"
                        }
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                        }}
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        setEditDialogOpen(true)
                    }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Playlist
                    </DropdownMenuItem>
                    {onChangeThumbnail && variant === 'details' && (
                        <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            onChangeThumbnail(playlist)
                        }}>
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Change Thumbnail
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        onClick={(e) => {
                            e.stopPropagation()
                            setDeleteDialogOpen(true)
                        }}
                        className="text-destructive focus:text-destructive"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Playlist
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleEdit}>
                        <DialogHeader>
                            <DialogTitle>Edit Playlist</DialogTitle>
                            <DialogDescription>
                                Update your playlist name and description.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Playlist Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="My Awesome Playlist"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    placeholder="Describe your playlist..."
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setEditDialogOpen(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!editName.trim() || isLoading}>
                                {isLoading ? 'Updating...' : 'Update Playlist'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Playlist</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;{playlist.name}&quot;? This action cannot be undone.
                            {playlist.track_count > 0 && (
                                <span className="block mt-2 font-medium text-destructive">
                                    This will permanently delete {playlist.track_count} track{playlist.track_count !== 1 ? 's' : ''}.
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isLoading ? 'Deleting...' : 'Delete Playlist'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}