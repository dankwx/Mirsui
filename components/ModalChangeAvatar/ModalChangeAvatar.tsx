'use client'

import React, { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// Ensure these environment variables are set in your .env.local
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface UserProps {
    username: string | null
    id: string
}

export default function ModalChangeAvatar({ username, id }: UserProps) {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            setFile(selectedFile)

            // Create a preview of the selected image
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

            // Generate a unique file path
            const filePath = `${id}/profile-picture`

            // Upload to Supabase Storage
            const { error } = await supabase.storage
                .from('user-profile-images')
                .upload(filePath, file, {
                    cacheControl: '300', // The image will be cached for 5 minutes
                    upsert: true, // Allow overwriting existing file
                })

            if (error) throw error

            // Generate and log the public URL
            const {
                data: { publicUrl },
            } = supabase.storage
                .from('user-profile-images')
                .getPublicUrl(filePath)

            console.log('Profile picture URL:', publicUrl)

            // Update user's profile with the new avatar URL if needed
            // You might want to add this to your user profile in the database
            // const { error: updateError } = await supabase
            //     .from('users')
            //     .update({ avatar_url: publicUrl })
            //     .eq('id', id)

            setUploadSuccess(true)
        } catch (error) {
            console.error('Error uploading profile picture:', error)
            alert('Failed to upload profile picture')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="mx-auto max-w-md p-6">
            <h2 className="mb-4 text-2xl font-bold">Change Profile Picture</h2>

            {previewUrl && (
                <div className="mb-4">
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="mx-auto mb-4 h-32 w-32 rounded-full object-cover"
                    />
                </div>
            )}

            <div className="mb-4">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full"
                />
            </div>

            <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full rounded bg-blue-500 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
                {uploading ? 'Uploading...' : 'Upload Profile Picture'}
            </button>

            {uploadSuccess && (
                <p className="mt-4 text-center text-green-500">
                    Profile picture uploaded successfully!
                </p>
            )}

            {username && (
                <p className="mt-4 text-center text-gray-600">
                    Editing profile for: {username}
                </p>
            )}
        </div>
    )
}
