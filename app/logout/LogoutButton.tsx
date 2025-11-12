'use client'

import { useRouter } from 'next/navigation'
import { useTransition, type ReactNode } from 'react'
import { SignOut } from './actions'
import { cn } from '@/lib/utils'

type LogoutButtonProps = {
    children?: ReactNode
    className?: string
    onComplete?: () => void
}

export default function LogoutButton({
    children = 'Log Out',
    className,
    onComplete,
}: LogoutButtonProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleClick = () => {
        startTransition(async () => {
            try {
                await SignOut()
            } catch (error) {
                console.error('Erro ao encerrar sessão', error)
            } finally {
                router.refresh()
                onComplete?.()
            }
        })
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isPending}
            className={cn(
                'w-full text-left text-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-60',
                className,
            )}
        >
            {isPending ? 'Saindo...' : children}
        </button>
    )
}
