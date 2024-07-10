"use client"

import { useState } from 'react'
import { login, signup } from './actions'
import LoginModal from '@/components/ModalLogin/page'

export default function LoginPage() {
    const [registrationStep, setRegistrationStep] = useState(1)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        displayName: ''
    })

    const handleLogin = (email: string, password: string) => {
        console.log('Login attempt:', email, password)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault()
        setRegistrationStep(2)
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        const formDataObj = new FormData()
        Object.entries(formData).forEach(([key, value]) => {
            formDataObj.append(key, value)
        })
        await signup(formDataObj)
    }

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const formDataObj = new FormData()
        formDataObj.append('email', formData.email)
        formDataObj.append('password', formData.password)
        await login(formDataObj)
    }

    return (
        <div>
            <LoginModal
                trigger={<button>Abrir Login</button>}
                onLogin={handleLogin}
            />
            {registrationStep === 1 ? (
                <form onSubmit={handleNextStep}>
                    <label htmlFor="email">Email:</label>
                    <input id="email" name="email" type="email" required 
                           value={formData.email} onChange={handleInputChange} />

                    <label htmlFor="password">Password:</label>
                    <input id="password" name="password" type="password" required 
                           value={formData.password} onChange={handleInputChange} />

                    <label htmlFor="username">Username:</label>
                    <input id="username" name="username" type="text" required 
                           value={formData.username} onChange={handleInputChange} />

                    <button type="submit">Próxima etapa</button>
                </form>
            ) : (
                <form onSubmit={handleSignup}>
                    <label htmlFor="displayName">Display Name:</label>
                    <input id="displayName" name="displayName" type="text" required 
                           value={formData.displayName} onChange={handleInputChange} />

                    <button type="submit">Finalizar registro</button>
                </form>
            )}
            <form onSubmit={handleLoginSubmit}>
                <button type="submit">Log in</button>
            </form>
        </div>
    )
}