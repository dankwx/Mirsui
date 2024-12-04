'use client'

import React, { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
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
import { LoaderCircle, Upload, Check } from 'lucide-react'

// Ensure these environment variables are set in your .env.local
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            setFile(selectedFile)

            const reader = new FileReader()
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string)
            }
            reader.readAsDataURL(selectedFile)
        }
    }

    const handleUpload = async () => {
        if (!file || !id) return

        try {
            setUploading(true)

            const filePath = `${id}/profile-picture`

            const { error } = await supabase.storage
                .from('user-profile-images')
                .upload(filePath, file, {
                    cacheControl: '300',
                    upsert: true,
                })

            if (error) throw error

            const {
                data: { publicUrl },
            } = supabase.storage
                .from('user-profile-images')
                .getPublicUrl(filePath)

            console.log('Profile picture URL:', publicUrl)

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', id)

            setUploadSuccess(true)

            // Reset state and close modal after success
            setTimeout(() => {
                onAvatarClick(false)
                setUploadSuccess(false)
                setFile(null)
                setPreviewUrl(null)
            }, 1500)
        } catch (error) {
            console.error('Error uploading profile picture:', error)
            alert('Failed to upload profile picture')
        } finally {
            setUploading(false)
        }
    }

    return (
        <Dialog open={true} onOpenChange={(open) => onAvatarClick(open)}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Change Profile Picture</DialogTitle>
                    <DialogDescription>
                        Upload a new profile picture for {username}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid w-full gap-4">
                    {(previewUrl || avatar_url) && (
                        <div className="flex justify-center">
                            <img
                                src={previewUrl || avatar_url || ''}
                                alt="Preview"
                                className="h-32 w-32 rounded-full object-cover"
                            />
                        </div>
                    )}

                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full"
                    />
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onAvatarClick(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="min-w-[120px]"
                    >
                        {uploading ? (
                            <>
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : uploadSuccess ? (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                Uploaded
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
