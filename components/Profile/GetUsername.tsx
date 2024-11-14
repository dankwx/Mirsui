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
import { PencilIcon } from 'lucide-react' // Importe o ícone de lápis
import FollowersFollowingSection from './UserFollowers'
import FollowButton from './FollowButton'

interface User {
    id: string
    first_name: string
    last_name: string
    avatar_url: string | null
    username: string | null
}

interface Rating {
    id: string
    rating: number
}

interface Achievments {
    achievement_id: string
    title: string
    description: string
    achieved_at: string
}

interface UserProfileProps {
    username: string
    displayName: string
    description: string | null
    updateDisplayNameAction?: (
        formData: FormData
    ) => Promise<{ success: boolean; newDisplayName?: string }>
    updateDescriptionAction?: (
        formData: FormData
    ) => Promise<{ success: boolean; newDescription?: string | null }>
    isOwnProfile: boolean
    isLoggedIn: boolean
    totalFollowers: User[]
    totalFollowing: User[]
    rating: Rating[]
    userAchievments: Achievments[]
    followingId: string
    initialIsFollowing: boolean
}

export default function UserProfile({
    username,
    displayName,
    description,
    updateDisplayNameAction,
    updateDescriptionAction,
    isOwnProfile,
    isLoggedIn,
    totalFollowers,
    totalFollowing,
    rating,
    userAchievments,
    followingId,
    initialIsFollowing,
}: UserProfileProps) {
    const [openDisplayName, setOpenDisplayName] = useState(false)
    const [openDescription, setOpenDescription] = useState(false)
    const [currentDisplayName, setCurrentDisplayName] = useState(displayName)
    const [currentDescription, setCurrentDescription] = useState<string | null>(
        description || null
    )

    const handleDisplayNameSubmit = async (formData: FormData) => {
        if (updateDisplayNameAction) {
            try {
                const result = await updateDisplayNameAction(formData)
                if (result.success && result.newDisplayName) {
                    setCurrentDisplayName(result.newDisplayName)
                    setOpenDisplayName(false)
                } else {
                    console.error('Failed to update display name')
                }
            } catch (error) {
                console.error('Error in updateDisplayNameAction:', error)
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
                <div className="flex flex-col">
                    {isOwnProfile ? (
                        <Dialog
                            open={openDisplayName}
                            onOpenChange={setOpenDisplayName}
                        >
                            <DialogTrigger
                                className="m-0 items-center text-left"
                                asChild
                            >
                                <div className="flex flex-row text-left">
                                    <Button
                                        variant="link"
                                        className="m-0 h-fit w-fit items-center justify-center p-0 text-right font-sans text-3xl font-bold"
                                    >
                                        {currentDisplayName}
                                    </Button>
                                    <p className="ml-2 items-start justify-center text-left text-gray-600">
                                        {username}
                                    </p>
                                </div>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Change DisplayName
                                    </DialogTitle>
                                </DialogHeader>
                                <form action={handleDisplayNameSubmit}>
                                    <Input
                                        name="display_name"
                                        placeholder="New displayname"
                                        defaultValue={currentDisplayName}
                                    />
                                    <Button type="submit" className="mt-4">
                                        Update Displayname
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <>
                            <p className="items-start justify-start text-left">
                                {username}
                            </p>
                            <p className="h-fit font-sans text-3xl font-bold">
                                {currentDisplayName}
                            </p>
                        </>
                    )}
                    <FollowersFollowingSection
                        totalFollowers={totalFollowers}
                        totalFollowing={totalFollowing}
                        rating={rating}
                    />
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
                                    <DialogTitle>
                                        Change Description
                                    </DialogTitle>
                                </DialogHeader>
                                <form action={handleDescriptionSubmit}>
                                    <Textarea
                                        name="description"
                                        placeholder="New description"
                                        defaultValue={
                                            currentDescription ===
                                            'No description'
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
                </div>

                {!isOwnProfile && isLoggedIn && (
                    <FollowButton
                        followingId={followingId}
                        initialIsFollowing={initialIsFollowing}
                    />
                )}
            </div>

            <UserBadges userAchievments={userAchievments} />
        </div>
    )
}
