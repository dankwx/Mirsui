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
import UserBadges from './UserBadges'
import UserRating from './UserRating'

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
        <div className="flex h-fit flex-col">
            <div className="flex">
                <p className="h-fit font-sans text-3xl font-bold">
                    {displayName}
                </p>
                <UserRating />
            </div>

            {isOwnProfile ? (
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger
                        className="m-0 items-start justify-start p-0"
                        asChild
                    >
                        <div>
                            <Button
                                variant="link"
                                className="m-0 h-fit w-fit p-0"
                            >
                                {currentUsername}
                            </Button>
                        </div>
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
            <UserBadges />
        </div>
    )
}
