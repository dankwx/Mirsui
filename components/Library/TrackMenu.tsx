'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { MoreVertical, Trash2, ExternalLink } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface PlaylistTrack {
    id: string
    track_title: string
    artist_name: string
    album_name: string
    track_url: string
}

interface TrackMenuProps {
    track: PlaylistTrack
    onRemove: (trackId: string) => Promise<void>
}

export default function TrackMenu({ track, onRemove }: TrackMenuProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    
    const { toast } = useToast()

    const handleRemove = async () => {
        setIsLoading(true)
        try {
            await onRemove(track.id)
            setDeleteDialogOpen(false)
            toast({
                title: "Success",
                description: "Track removed from playlist!"
            })
        } catch (error) {
            console.error('Error removing track:', error)
            toast({
                title: "Error",
                description: "Failed to remove track",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleOpenExternal = () => {
        if (track.track_url) {
            window.open(track.track_url, '_blank')
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
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
                        handleOpenExternal()
                    }}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in Spotify
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        onClick={(e) => {
                            e.stopPropagation()
                            setDeleteDialogOpen(true)
                        }}
                        className="text-destructive focus:text-destructive"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove from playlist
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Remove Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Track</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove "{track.track_title}" by {track.artist_name} from this playlist?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleRemove}
                            disabled={isLoading}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isLoading ? 'Removing...' : 'Remove Track'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}