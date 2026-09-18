'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, ImageIcon, Link2, Pencil } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import FotoDePerfil from '@/components/FotoDePerfil'
import ModalChangeAvatar from '@/components/ModalChangeAvatar/ModalChangeAvatar'
import RecordCover from '@/components/Club/RecordCover'
import shellStyles from '@/components/Club/ClubShell.module.css'
import recipes from '@/components/Club/club-recipes.module.css'
import FollowersFollowingSection from './UserFollowers'
import FollowButton from './FollowButton'
import { updateDescription, updateDisplayName } from './actions'
import { trackHref } from './trackHref'
import type { Achievement, Rating, Song, User } from '@/types/profile'
import type { ProfileStats } from '@/utils/profileStats'
import styles from './ProfileHeader.module.css'

interface ProfileHeaderProps {
    userData: User & {
        totalFollowers: User[]
        totalFollowing: User[]
        achievements: Achievement[]
        rating: Rating[]
    }
    stats: ProfileStats
    badge: { value: string; label: string } | null
    favorites: Song[]
    isLoggedIn: boolean
    isOwnProfile: boolean
}

function initialsOf(value: string) {
    return value
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
}

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
        <div className={`${recipes.stat} ${accent ? recipes.statAccent : ''}`}>
            <div className={recipes.statValue}>{value}</div>
            <div className={recipes.statLabel}>{label}</div>
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
    const fallbackInitials = initialsOf(
        currentDisplayName || userData.username || 'Mirsui'
    )

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
        <section className={styles.section}>
            <div
                className={`${shellStyles.container} ${styles.layout} ${favorites.length === 0 ? styles.noFavorites : ''}`}
            >
                <div className={styles.identityColumn}>
                    <div className={styles.identity}>
                        {canEdit ? (
                            <button
                                type="button"
                                onClick={() => setShowAvatarModal(true)}
                                aria-label="Trocar foto"
                                className={styles.avatarButton}
                            >
                                <FotoDePerfil
                                    src={userData.avatar_url}
                                    className={styles.avatarImage}
                                >
                                    <span className={styles.avatarFallback}>
                                        {fallbackInitials}
                                    </span>
                                </FotoDePerfil>
                            </button>
                        ) : (
                            <div className={styles.avatar}>
                                <FotoDePerfil
                                    src={userData.avatar_url}
                                    className={styles.avatarImage}
                                >
                                    <span className={styles.avatarFallback}>
                                        {fallbackInitials}
                                    </span>
                                </FotoDePerfil>
                            </div>
                        )}

                        <div className={styles.identityCopy}>
                            <h1>{currentDisplayName}</h1>
                            <div className={styles.username}>
                                @{userData.username}
                            </div>
                            {currentDescription && (
                                <p className={styles.bio}>{currentDescription}</p>
                            )}
                        </div>
                    </div>

                    <div className={styles.stats}>
                        <Numero value={stats.total} label="no acervo" />
                        {badge && (
                            <Numero
                                value={badge.value}
                                label={badge.label}
                                accent
                            />
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

                    <div className={styles.actions}>
                        {canEdit ? (
                            <button
                                type="button"
                                onClick={() => setOpenEdit(true)}
                                className={recipes.button}
                            >
                                <Pencil size={15} aria-hidden="true" />
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
                            type="button"
                            onClick={handleShare}
                            className={recipes.textLink}
                            aria-live="polite"
                        >
                            {copied ? (
                                <>
                                    <Check size={15} aria-hidden="true" />
                                    Link copiado
                                </>
                            ) : (
                                <>
                                    <Link2 size={15} aria-hidden="true" />
                                    Copiar link
                                </>
                            )}
                        </button>
                        {stats.since && (
                            <span className={styles.since}>
                                salvando desde {stats.since}
                            </span>
                        )}
                    </div>
                </div>

                {favorites.length > 0 && (
                    <div className={styles.favorites}>
                        <p className={styles.favoritesLabel}>Favoritas do perfil</p>
                        <div className={styles.favoritesGrid}>
                            {favorites.map((song) => (
                                <Link
                                    key={song.id}
                                    href={trackHref(song)}
                                    aria-label={`${song.track_title}, ${song.artist_name}`}
                                    className={styles.favoriteLink}
                                >
                                    <RecordCover
                                        src={song.track_thumbnail}
                                        alt={`Capa de ${song.track_title}`}
                                        className={recipes.sleeve}
                                    />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {canEdit && (
                <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                    <DialogContent
                        className={styles.dialogContent}
                        overlayClassName={styles.dialogOverlay}
                        closeClassName={styles.dialogClose}
                    >
                        <DialogHeader className={styles.dialogHeader}>
                            <DialogTitle className={styles.dialogTitle}>
                                Editar perfil
                            </DialogTitle>
                        </DialogHeader>
                        <form action={handleEditSubmit} className={styles.editForm}>
                            <div className={styles.field}>
                                <label htmlFor="profile-display-name">Nome de exibição</label>
                                <input
                                    id="profile-display-name"
                                    name="display_name"
                                    placeholder="Seu nome"
                                    defaultValue={currentDisplayName}
                                    required
                                />
                            </div>
                            <div className={styles.field}>
                                <label htmlFor="profile-description">Bio</label>
                                <textarea
                                    id="profile-description"
                                    name="description"
                                    placeholder="Escreva algo sobre você..."
                                    defaultValue={currentDescription || ''}
                                    rows={3}
                                />
                            </div>
                            <div className={styles.editActions}>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className={`${recipes.button} ${styles.saveButton}`}
                                >
                                    {isSaving ? 'Salvando...' : 'Salvar'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOpenEdit(false)
                                        setShowAvatarModal(true)
                                    }}
                                    className={recipes.outlineButton}
                                >
                                    <ImageIcon size={15} aria-hidden="true" />
                                    Alterar foto
                                </button>
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
