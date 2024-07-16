'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

interface UserProfileProps {
    username: string
    displayName: string
    updateUsernameAction?: (
        formData: FormData
    ) => Promise<{ success: boolean; newUsername?: string }>
    isOwnProfile: boolean
}

export default function UserProfile({
    username,
    displayName,
    updateUsernameAction,
    isOwnProfile,
}: UserProfileProps) {
    const [open, setOpen] = useState(false)
    const [currentUsername, setCurrentUsername] = useState(username)

    const handleSubmit = async (formData: FormData) => {
        if (updateUsernameAction) {
            const result = await updateUsernameAction(formData)
            if (result.success && result.newUsername) {
                setCurrentUsername(result.newUsername)
                setOpen(false)
            }
        }
    }

    return (
        <div className="flex flex-col">
            <p className="font-sans text-3xl font-bold">{displayName}</p>
            {isOwnProfile ? (
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger className="m-0 justify-start items-start p-0" asChild>
                        <Button variant="link" className="p-0">
                            {currentUsername}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Change Username</DialogTitle>
                        </DialogHeader>
                        <form action={handleSubmit}>
                            <Input
                                name="username"
                                placeholder="New username"
                                defaultValue={currentUsername}
                            />
                            <Button type="submit" className="mt-4">
                                Update Username
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            ) : (
                <p>{currentUsername}</p>
            )}
        </div>
    )
}
