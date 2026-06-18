'use client'

import { useRouter } from 'next/navigation'
import { useTransition, type ReactNode } from 'react'
import { signOut } from '@/app/auth/actions'
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
                await signOut()
                // O redirect já é feito pela action signOut
                onComplete?.()
            } catch (error) {
                console.error('Erro ao encerrar sessão', error)
                // Em caso de erro, tentar redirecionar manualmente
                router.push('/')
                router.refresh()
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
