"use client"

import { login, signup } from './actions'
import LoginModal from '@/components/ModalLogin/page'

export default function LoginPage() {
    const handleLogin = (email: string, password: string) => {
        // Lógica de login aqui
        console.log('Login attempt:', email, password)
    }
    return (
        <div>
            <LoginModal
                trigger={<button>Abrir Login</button>}
                onLogin={handleLogin}
            />
            <form>
                <label htmlFor="email">Email:</label>
                <input id="email" name="email" type="email" required />

                <label htmlFor="password">Password:</label>
                <input id="password" name="password" type="password" required />

                <label htmlFor="username">Username:</label>
                <input id="username" name="username" type="text" required />

                <button formAction={login}>Log in</button>
                <button formAction={signup}>Sign up</button>
            </form>
        </div>
    )
}
