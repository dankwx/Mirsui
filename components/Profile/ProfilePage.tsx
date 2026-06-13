// components/Profile/ProfilePage.tsx
'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Pencil, Share2, Check, ImageIcon } from 'lucide-react'
import ModalChangeAvatar from '../ModalChangeAvatar/ModalChangeAvatar'
import FollowersFollowingSection from './UserFollowers'
import FollowButton from './FollowButton'
import { updateDisplayName, updateDescription } from './actions'
import type { User, Achievement, Rating } from '@/types/profile'

interface ProfileStats {
    tracks: number
    early: number
    artists: number
}

interface ProfilePageProps {
    userData: User & {
        totalFollowers: User[]
        totalFollowing: User[]
        achievements: Achievement[]
        rating: Rating[]
    }
    stats: ProfileStats
    isLoggedIn: boolean
    isOwnProfile: boolean
}

export default function ProfilePage({
    userData,
    stats,
    isLoggedIn,
    isOwnProfile,
}: ProfilePageProps) {
    const [showAvatarModal, setShowAvatarModal] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [copied, setCopied] = useState(false)
    const [currentDisplayName, setCurrentDisplayName] = useState(
        userData.display_name || userData.username || ''
    )
    const [currentDescription, setCurrentDescription] = useState(
        userData.description || null
    )

    const canEdit = isOwnProfile && isLoggedIn

    const initials = (currentDisplayName || userData.username || 'U')
        .slice(0, 2)
        .toLowerCase()

    const handleEditSubmit = async (formData: FormData) => {
        if (!canEdit) return
        setIsSaving(true)

        try {
            const nameResult = await updateDisplayName(formData)
            if (nameResult.success && nameResult.newDisplayName) {
                setCurrentDisplayName(nameResult.newDisplayName)
            }

            const descResult = await updateDescription(formData)
            if (descResult.success) {
                setCurrentDescription(descResult.newDescription || null)
            }

            setOpenEdit(false)
        } catch (error) {
            console.error('Error updating profile:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.error('Error copying link:', error)
        }
    }

    return (
        <header className="flex flex-col gap-6 pb-9 pt-10 sm:flex-row sm:items-center sm:gap-9">
            <Avatar
                className={`h-[132px] w-[132px] flex-none rounded-full border border-mir-line2 bg-mir-card ${
                    canEdit ? 'cursor-pointer transition hover:brightness-110' : ''
                }`}
                onClick={canEdit ? () => setShowAvatarModal(true) : undefined}
            >
                <AvatarImage
                    src={userData.avatar_url || undefined}
                    className="rounded-full object-cover"
                />
                <AvatarFallback className="rounded-full bg-[radial-gradient(120%_120%_at_30%_22%,#322c22,#1b1813)] text-[44px] font-extrabold tracking-tight text-mir-text">
                    {initials}
                </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
                <h1 className="text-[clamp(30px,4.4vw,42px)] font-extrabold leading-none tracking-tight text-mir-text">
                    {currentDisplayName}{' '}
                    <span className="ml-1 font-mono text-[13px] font-medium tracking-normal text-mir-text3">
                        @{userData.username}
                    </span>
                </h1>

                {currentDescription && (
                    <p className="mt-3 max-w-[54ch] text-[15px] leading-normal text-mir-text2">
                        {currentDescription}
                    </p>
                )}

                <div className="mt-5 flex flex-wrap gap-8">
                    <div className="flex flex-col gap-1">
                        <span className="text-[22px] font-extrabold leading-none tracking-tight tabular-nums text-mir-text">
                            {stats.tracks}
                        </span>
                        <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-mir-text3">
                            faixas
                        </span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[22px] font-extrabold leading-none tracking-tight tabular-nums text-mir-acc">
                            {stats.early}
                        </span>
                        <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-mir-text3">
                            antecipadas
                        </span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[22px] font-extrabold leading-none tracking-tight tabular-nums text-mir-text">
                            {stats.artists}
                        </span>
                        <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-mir-text3">
                            artistas
                        </span>
                    </div>

                    <FollowersFollowingSection
                        followers={userData.totalFollowers}
                        following={userData.totalFollowing}
                        rating={userData.rating}
                        isOwnProfile={isOwnProfile}
                        isLoggedIn={isLoggedIn}
                        currentUserId={userData.id}
                    />
                </div>
            </div>

            <div className="flex flex-row gap-2.5 self-stretch sm:flex-col sm:self-start sm:pt-1.5">
                {canEdit ? (
                    <button
                        onClick={() => setOpenEdit(true)}
                        className="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-[9px] bg-mir-acc px-[18px] py-[9px] text-[13.5px] font-semibold text-mir-on-acc transition hover:brightness-105 active:translate-y-px sm:flex-none"
                    >
                        <Pencil className="h-[15px] w-[15px]" />
                        Editar perfil
                    </button>
                ) : (
                    isLoggedIn && (
                        <FollowButton
                            followingId={userData.id}
                            initialIsFollowing={userData.isFollowing || false}
                            type="text"
                        />
                    )
                )}
                <button
                    onClick={handleShare}
                    className="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-[9px] border border-mir-line2 px-[18px] py-[9px] text-[13.5px] font-semibold text-mir-text2 transition hover:border-mir-text3 hover:bg-mir-fill1 hover:text-mir-text active:translate-y-px sm:flex-none"
                >
                    {copied ? (
                        <>
                            <Check className="h-[15px] w-[15px] text-mir-acc" />
                            Copiado!
                        </>
                    ) : (
                        <>
                            <Share2 className="h-[15px] w-[15px]" />
                            Compartilhar
                        </>
                    )}
                </button>
            </div>

            {canEdit && (
                <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                    <DialogContent className="border border-mir-line bg-mir-surface text-mir-text shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:rounded-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold tracking-tight text-mir-text">
                                Editar perfil
                            </DialogTitle>
                        </DialogHeader>
                        <form action={handleEditSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-mir-text3">
                                    nome de exibição
                                </label>
                                <Input
                                    name="display_name"
                                    placeholder="Seu nome"
                                    defaultValue={currentDisplayName}
                                    required
                                    className="border-mir-line2 bg-mir-fill1 text-mir-text placeholder:text-mir-text3 focus-visible:ring-mir-acc/50"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-mir-text3">
                                    bio
                                </label>
                                <Textarea
                                    name="description"
                                    placeholder="Escreva algo sobre você..."
                                    defaultValue={currentDescription || ''}
                                    rows={3}
                                    className="border-mir-line2 bg-mir-fill1 text-mir-text placeholder:text-mir-text3 focus-visible:ring-mir-acc/50"
                                />
                            </div>
                            <div className="flex items-center gap-2.5 pt-1">
                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 rounded-[9px] bg-mir-acc text-[13.5px] font-semibold text-mir-on-acc hover:bg-mir-acc hover:brightness-105"
                                >
                                    {isSaving ? 'Salvando...' : 'Salvar'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setOpenEdit(false)
                                        setShowAvatarModal(true)
                                    }}
                                    className="rounded-[9px] border border-mir-line2 text-[13.5px] font-semibold text-mir-text2 hover:bg-mir-fill1 hover:text-mir-text"
                                >
                                    <ImageIcon className="mr-2 h-4 w-4" />
                                    Alterar avatar
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            )}

            {showAvatarModal && (
                <ModalChangeAvatar
                    username={userData.username}
                    id={userData.id}
                    avatar_url={userData.avatar_url}
                    onAvatarClick={setShowAvatarModal}
                />
            )}
        </header>
    )
}
