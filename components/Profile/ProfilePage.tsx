// components/Profile/ProfilePage.tsx
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
} from '@/components/ui/dialog'
import { Pencil, Check, ImageIcon, ArrowUpRight } from 'lucide-react'
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
    profileNo: string
    edition: string
    memberSince: number
    faroTop: number
}

const AVATAR_GRADIENT =
    'radial-gradient(130% 130% at 30% 22%,#f3ecdb 0%,#cdef36 20%,#c14a26 52%,#16120c 88%)'

function Stat({
    value,
    label,
    accent = false,
}: {
    value: number | string
    label: string
    accent?: boolean
}) {
    return (
        <div>
            <div
                className={`text-[28px] font-extrabold leading-none tracking-[-0.03em] tabular-nums sm:text-[32px] ${
                    accent ? 'text-[#cdef36]' : 'text-[#ece3d2]'
                }`}
            >
                {value}
            </div>
            <div className="mt-[5px] font-mono text-[10px] uppercase tracking-[0.14em] text-[#ece3d2]/45">
                {label}
            </div>
        </div>
    )
}

export default function ProfilePage({
    userData,
    stats,
    isLoggedIn,
    isOwnProfile,
    profileNo,
    edition,
    memberSince,
    faroTop,
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
        <section className="w-full border-b border-[#ece3d2]/10 bg-[#16120c]">
            <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
                {/* edition strip */}
                <div className="flex items-baseline justify-between pt-5 font-mono text-[11px] tracking-[0.16em] text-[#ece3d2]/40">
                    <span>PERFIL Nº {profileNo}</span>
                    <span>EDIÇÃO {edition}</span>
                </div>

                <header className="flex flex-col gap-9 pb-14 pt-7 sm:flex-row sm:items-start sm:gap-12">
                    {/* avatar + faro sticker */}
                    <div className="relative flex-none self-center sm:self-start">
                        <div
                            onClick={
                                canEdit ? () => setShowAvatarModal(true) : undefined
                            }
                            className={`h-[150px] w-[150px] overflow-hidden rounded-full sm:h-[172px] sm:w-[172px] ${
                                canEdit
                                    ? 'cursor-pointer transition hover:brightness-110'
                                    : ''
                            }`}
                            style={{
                                background: userData.avatar_url
                                    ? '#16120c'
                                    : AVATAR_GRADIENT,
                                boxShadow:
                                    '0 0 0 7px #16120c, 0 0 0 8px rgba(205,239,54,0.45)',
                            }}
                        >
                            {userData.avatar_url && (
                                <img
                                    src={userData.avatar_url}
                                    alt={currentDisplayName}
                                    className="h-full w-full rounded-full object-cover"
                                />
                            )}
                        </div>
                        <div className="absolute -bottom-1.5 -right-4 rotate-[-8deg] rounded-[4px] border-2 border-[#16120c] bg-[#cdef36] px-[11px] py-1.5 text-center font-mono text-[11px] font-bold leading-[1.25] tracking-[0.08em] text-[#16120c]">
                            FARO
                            <br />
                            TOP {faroTop}%
                        </div>
                    </div>

                    {/* identity */}
                    <div className="min-w-0 flex-1">
                        <div className="mb-2.5 font-mono text-[11px] tracking-[0.18em] text-[#cdef36]">
                            OUVINTE ANTECIPADO · DESDE {memberSince}
                        </div>

                        <h1 className="m-0 break-words text-[clamp(56px,11vw,104px)] font-extrabold leading-[0.82] tracking-[-0.05em] text-[#ece3d2]">
                            {currentDisplayName}
                        </h1>

                        <div className="mt-3.5 flex flex-wrap items-center gap-3.5">
                            <span className="font-mono text-[14px] text-[#ece3d2]/60">
                                @{userData.username}
                            </span>
                            {currentDescription && (
                                <>
                                    <span className="h-[5px] w-[5px] rounded-full bg-[#ece3d2]/30" />
                                    <span className="text-[15px] text-[#ece3d2]/[0.78]">
                                        {currentDescription}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* stats */}
                        <div className="mb-6 mt-[18px] flex flex-wrap gap-x-9 gap-y-5 border-y border-[#ece3d2]/10 py-[22px]">
                            <Stat value={stats.tracks} label="FAIXAS" />
                            <Stat value={stats.early} label="ANTECIPADAS" accent />
                            <Stat value={stats.artists} label="ARTISTAS" />
                            <FollowersFollowingSection
                                followers={userData.totalFollowers}
                                following={userData.totalFollowing}
                                rating={userData.rating}
                                isOwnProfile={isOwnProfile}
                                isLoggedIn={isLoggedIn}
                                currentUserId={userData.id}
                            />
                        </div>

                        {/* actions */}
                        <div className="flex flex-wrap gap-3">
                            {canEdit ? (
                                <button
                                    onClick={() => setOpenEdit(true)}
                                    className="inline-flex items-center gap-2 rounded-full bg-[#cdef36] px-[22px] py-3 text-[14px] font-bold text-[#16120c] transition hover:brightness-105 active:translate-y-px"
                                >
                                    <Pencil className="h-[15px] w-[15px]" />
                                    Editar perfil
                                </button>
                            ) : (
                                isLoggedIn && (
                                    <FollowButton
                                        followingId={userData.id}
                                        initialIsFollowing={
                                            userData.isFollowing || false
                                        }
                                        type="text"
                                    />
                                )
                            )}
                            <button
                                onClick={handleShare}
                                className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-[#ece3d2]/30 px-[22px] py-3 text-[14px] font-bold text-[#ece3d2] transition hover:border-[#cdef36] hover:text-[#cdef36] active:translate-y-px"
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-[15px] w-[15px] text-[#cdef36]" />
                                        Copiado!
                                    </>
                                ) : (
                                    <>
                                        <ArrowUpRight className="h-[15px] w-[15px]" />
                                        Compartilhar perfil
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </header>
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
        </section>
    )
}
