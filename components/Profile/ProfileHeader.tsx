// components/Profile/ProfileHeader.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Pencil, Check, ImageIcon, Link2 } from 'lucide-react'
import ModalChangeAvatar from '../ModalChangeAvatar/ModalChangeAvatar'
import FollowersFollowingSection from './UserFollowers'
import FollowButton from './FollowButton'
import { updateDisplayName, updateDescription } from './actions'
import { trackHref } from './trackHref'
import type { User, Achievement, Rating, Song } from '@/types/profile'
import type { ProfileStats } from '@/utils/profileStats'

/* Raio de canto desta página, para não virar sopa:
 *   capa de faixa      4px
 *   avatar             círculo
 *   botão / filtro     pílula
 *   painel e diálogo   12px
 */

interface ProfileHeaderProps {
    userData: User & {
        totalFollowers: User[]
        totalFollowing: User[]
        achievements: Achievement[]
        rating: Rating[]
    }
    stats: ProfileStats
    /** destaque real do perfil; null quando o acervo ainda está vazio */
    badge: { value: string; label: string } | null
    favorites: Song[]
    isLoggedIn: boolean
    isOwnProfile: boolean
}

const AVATAR_GRADIENT =
    'radial-gradient(130% 130% at 30% 22%,#f3ecdb 0%,#cdef36 20%,#c14a26 52%,#16120c 88%)'

function Numero({
    value,
    label,
    accent = false,
}: {
    value: number | string
    label: string
    accent?: boolean
}) {
    return (
        <div className="min-w-0">
            <div
                className={`text-[30px] font-extrabold leading-none tracking-[-0.03em] tabular-nums ${
                    accent ? 'text-mir-acc' : 'text-mir-text'
                }`}
            >
                {value}
            </div>
            <div className="mt-1.5 font-mono text-[10.5px] lowercase tracking-[0.06em] text-mir-text3">
                {label}
            </div>
        </div>
    )
}

export default function ProfileHeader({
    userData,
    stats,
    badge,
    favorites,
    isLoggedIn,
    isOwnProfile,
}: ProfileHeaderProps) {
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
        <section className="w-full border-b border-mir-line bg-mir-bg">
            <div className="mx-auto grid w-full max-w-[1200px] gap-x-16 gap-y-10 px-5 py-9 sm:px-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
                {/* identidade */}
                <div className="min-w-0">
                    <div className="flex items-start gap-5 sm:gap-6">
                        <button
                            type="button"
                            onClick={canEdit ? () => setShowAvatarModal(true) : undefined}
                            aria-label={canEdit ? 'Trocar avatar' : undefined}
                            disabled={!canEdit}
                            className={`h-[76px] w-[76px] flex-none overflow-hidden rounded-full ring-1 ring-mir-line2 sm:h-[92px] sm:w-[92px] ${
                                canEdit
                                    ? 'cursor-pointer transition hover:ring-mir-acc'
                                    : 'cursor-default'
                            }`}
                            style={{
                                background: userData.avatar_url
                                    ? '#16120c'
                                    : AVATAR_GRADIENT,
                            }}
                        >
                            {userData.avatar_url && (
                                <img
                                    src={userData.avatar_url}
                                    alt={currentDisplayName}
                                    className="h-full w-full object-cover"
                                />
                            )}
                        </button>

                        <div className="min-w-0 flex-1 pt-0.5">
                            <h1 className="m-0 break-words text-[clamp(30px,5.2vw,46px)] font-extrabold leading-[1.02] tracking-[-0.04em] text-mir-text">
                                {currentDisplayName}
                            </h1>
                            <div className="mt-1.5 font-mono text-[13px] text-mir-text3">
                                @{userData.username}
                            </div>
                            {currentDescription && (
                                <p className="mt-2.5 max-w-[52ch] text-[14.5px] leading-relaxed text-mir-text2">
                                    {currentDescription}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* números */}
                    <div className="mt-7 flex flex-wrap items-start gap-x-10 gap-y-6 border-t border-mir-line pt-6">
                        <Numero value={stats.total} label="no acervo" />
                        {badge && (
                            <Numero value={badge.value} label={badge.label} accent />
                        )}
                        <Numero value={stats.artists} label="artistas" />
                        <FollowersFollowingSection
                            followers={userData.totalFollowers}
                            following={userData.totalFollowing}
                            rating={userData.rating}
                            isOwnProfile={isOwnProfile}
                            isLoggedIn={isLoggedIn}
                            currentUserId={userData.id}
                        />
                    </div>

                    {/* ações */}
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        {canEdit ? (
                            <button
                                onClick={() => setOpenEdit(true)}
                                className="inline-flex items-center gap-2 rounded-full bg-mir-acc px-5 py-2.5 text-[13.5px] font-bold text-mir-on-acc transition hover:brightness-105 active:translate-y-px"
                            >
                                <Pencil className="h-[14px] w-[14px]" />
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
                            className="inline-flex items-center gap-2 rounded-full border border-mir-line2 px-5 py-2.5 text-[13.5px] font-bold text-mir-text2 transition hover:border-mir-acc hover:text-mir-acc active:translate-y-px"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-[14px] w-[14px] text-mir-acc" />
                                    Link copiado
                                </>
                            ) : (
                                <>
                                    <Link2 className="h-[14px] w-[14px]" />
                                    Copiar link
                                </>
                            )}
                        </button>
                        {stats.since && (
                            <span className="font-mono text-[11.5px] text-mir-text3">
                                salvando desde {stats.since}
                            </span>
                        )}
                    </div>
                </div>

                {/* favoritas: as quatro que a pessoa escolheu a dedo */}
                {favorites.length > 0 && (
                    <div>
                        <div className="mb-3 font-mono text-[11px] lowercase tracking-[0.06em] text-mir-text3">
                            favoritas do perfil
                        </div>
                        {/* 2x2 em vez de 4 numa fileira: quatro capas de 80px
                            viram miniaturas de miniatura, e favorita escolhida
                            a dedo é a coisa que merece ser vista. */}
                        <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-2 sm:gap-3">
                            {favorites.map((song) => (
                                <Link
                                    key={song.id}
                                    href={trackHref(song)}
                                    title={`${song.track_title}, ${song.artist_name}`}
                                    className="group block overflow-hidden rounded-[4px] bg-mir-card ring-1 ring-mir-line transition hover:ring-mir-acc"
                                >
                                    {song.track_thumbnail ? (
                                        <img
                                            src={song.track_thumbnail}
                                            alt={song.track_title}
                                            className="aspect-square w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                                        />
                                    ) : (
                                        <div className="flex aspect-square w-full items-end p-2 text-[11px] font-bold leading-tight text-mir-text2">
                                            {song.track_title}
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {canEdit && (
                <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                    <DialogContent className="border border-mir-line bg-mir-surface text-mir-text shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:rounded-[12px]">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold tracking-tight text-mir-text">
                                Editar perfil
                            </DialogTitle>
                        </DialogHeader>
                        <form action={handleEditSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="font-mono text-[10.5px] lowercase tracking-[0.06em] text-mir-text3">
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
                                <label className="font-mono text-[10.5px] lowercase tracking-[0.06em] text-mir-text3">
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
                                    className="flex-1 rounded-full bg-mir-acc text-[13.5px] font-semibold text-mir-on-acc hover:bg-mir-acc hover:brightness-105"
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
                                    className="rounded-full border border-mir-line2 text-[13.5px] font-semibold text-mir-text2 hover:bg-mir-fill1 hover:text-mir-text"
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
