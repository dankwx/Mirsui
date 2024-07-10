'use client'

import LoginModal from "../ModalLogin/ModalLogin"


export default function LoginModalButton() {
    const handleLogin = (email: string, password: string) => {
        // Lógica de login aqui
        console.log('Login attempt:', email, password)
    }
    return (
        <div>
            <LoginModal
                trigger={<button>Login</button>}
                onLogin={handleLogin}
            />
        </div>
    )
}
