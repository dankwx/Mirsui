'use client'

import { LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { pillButtonClass } from '@/components/ui/pill-button'
import LoginModal from '../ModalLogin/ModalLogin'

export default function LoginModalButton() {
    const handleLogin = (email: string, password: string) => {
        // Lógica de login aqui
        console.log('Login attempt:', email, password)
    }

    return (
        <LoginModal
            trigger={
                <Button
                    type="button"
                    className={pillButtonClass('primary')}
                >
                    <LogIn className="h-4 w-4 text-white/90 transition-transform duration-200 group-hover:translate-x-1" />
                    <span>Entrar</span>
                </Button>
            }
            onLogin={handleLogin}
        />
    )
}
