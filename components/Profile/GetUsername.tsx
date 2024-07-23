'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import UserBadges from './UserBadges'
import UserRating from './UserRating'
import { PencilIcon } from 'lucide-react' // Importe o ícone de lápis
import FollowersFollowingSection from './UserFollowers'
import FollowButton from './FollowButton'

interface UserProfileProps {
    username: string
    displayName: string
    description: string | null
    updateUsernameAction?: (
        formData: FormData
    ) => Promise<{ success: boolean; newUsername?: string }>
    updateDescriptionAction?: (
        formData: FormData
    ) => Promise<{ success: boolean; newDescription?: string | null }>
    isOwnProfile: boolean
    totalFollowers: number
    totalFollowing: number
    followingId: string
    initialIsFollowing: boolean

}

export default function UserProfile({
    username,
    displayName,
    description,
    updateUsernameAction,
    updateDescriptionAction,
    isOwnProfile,
    totalFollowers,
    totalFollowing,
    followingId,
    initialIsFollowing
}: UserProfileProps) {
    const [openUsername, setOpenUsername] = useState(false)
    const [openDescription, setOpenDescription] = useState(false)
    const [currentUsername, setCurrentUsername] = useState(username)
    const [currentDescription, setCurrentDescription] = useState<string | null>(
        description || null
    )

    const handleUsernameSubmit = async (formData: FormData) => {
        if (updateUsernameAction) {
            const result = await updateUsernameAction(formData)
            if (result.success && result.newUsername) {
                setCurrentUsername(result.newUsername)
                setOpenUsername(false)
            }
        }
    }

    const handleDescriptionSubmit = async (formData: FormData) => {
        if (updateDescriptionAction) {
            const newDescription = formData.get('description') as string
            const descriptionToUpdate =
                newDescription.trim() === '' ? null : newDescription

            // Crie um novo FormData com a descrição atualizada
            const updatedFormData = new FormData()
            updatedFormData.append('description', descriptionToUpdate || '')

            const result = await updateDescriptionAction(updatedFormData)

            if (result.success) {
                setCurrentDescription(result.newDescription || null)
                setOpenDescription(false)
            }
        }
    }

    return (
        <div className="flex h-fit flex-col">
            <div className="flex">
                <p className="h-fit font-sans text-3xl font-bold">
                    {displayName}
                </p>
                <FollowersFollowingSection
                    totalFollowers={totalFollowers}
                    totalFollowing={totalFollowing}
                />
               {!isOwnProfile && (
                            <FollowButton
                                followingId={followingId}
                                initialIsFollowing={initialIsFollowing}
                            />
                        )}
                <UserRating />
            </div>
            {isOwnProfile ? (
                <Dialog
                    open={openDescription}
                    onOpenChange={setOpenDescription}
                >
                    <DialogTrigger
                        className="m-0 items-start justify-start p-0"
                        asChild
                    >
                        <div className="flex items-center text-gray-600 hover:text-gray-800">
                            <p className="font-sans text-sm">
                                {currentDescription === null ? (
                                    <span className="italic">
                                        No description
                                    </span>
                                ) : (
                                    currentDescription
                                )}
                            </p>
                            <PencilIcon
                                size={16}
                                className="ml-2 cursor-pointer"
                            />
                        </div>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Change Description</DialogTitle>
                        </DialogHeader>
                        <form action={handleDescriptionSubmit}>
                            <Textarea
                                name="description"
                                placeholder="New description"
                                defaultValue={
                                    currentDescription === 'No description'
                                        ? ''
                                        : currentDescription || ''
                                }
                            />
                            <Button type="submit" className="mt-4">
                                Update Description
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            ) : (
                <p className="font-sans text-sm text-gray-600">
                    {currentDescription === null ? (
                        <span className="italic">No description</span>
                    ) : (
                        currentDescription
                    )}
                </p>
            )}
            {isOwnProfile ? (
                <Dialog open={openUsername} onOpenChange={setOpenUsername}>
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
                        <form action={handleUsernameSubmit}>
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
