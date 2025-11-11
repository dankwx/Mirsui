import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login, signup } from '../../app/login/actions'

interface LoginModalProps {
    trigger: React.ReactNode
    onLogin: (email: string, password: string) => void
}

const LoginModal: React.FC<LoginModalProps> = ({ trigger, onLogin }) => {
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [username, setUsername] = React.useState('')
    const [isRegistering, setIsRegistering] = React.useState(false)
    const [isForgotPassword, setIsForgotPassword] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        const formData = new FormData()
        formData.append('email', email)
        formData.append('password', password)
        
        try {
            if (isRegistering) {
                formData.append('username', username)
                const result = await signup(formData)
                // If result exists, it means there was an error (redirect throws on success)
                if (result?.error) {
                    setError(result.error)
                } else {
                    // Handle successful signup
                    onLogin(email, password)
                }
            } else {
                const result = await login(formData)
                // If result exists, it means there was an error (redirect throws on success)
                if (result?.error) {
                    setError(result.error)
                } else {
                    // Handle successful login
                    onLogin(email, password)
                }
            }
        } catch (error) {
            // Next.js redirect() throws an error to perform the redirect
            // This is expected behavior and means the operation was successful
            // The redirect will be handled automatically
        }
    }

    const handleForgotPassword = (e: React.FormEvent) => {
        e.preventDefault()
        // Implement forgot password logic here
        console.log('Forgot password for email:', email)
    }

    const renderForm = () => (
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right text-slate-900 font-medium">
                    Email
                </Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="col-span-3 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50 backdrop-blur-md border-white/50 shadow-sm placeholder:text-slate-500"
                    value={email}
                    placeholder="email@email.com"
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div
                className={`grid origin-top grid-cols-4 items-center gap-4 transition-all duration-300 ease-in-out ${!isForgotPassword ? 'max-h-20 scale-y-100 opacity-100' : 'max-h-0 scale-y-0 opacity-0'}`}
            >
                <Label htmlFor="password" className="text-right text-slate-900 font-medium">
                    Password
                </Label>
                <Input
                    id="password"
                    name="password"
                    className="col-span-3 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50 backdrop-blur-md border-white/50 shadow-sm placeholder:text-slate-500"
                    required={!isForgotPassword}
                    type="password"
                    placeholder="*******"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <div
                className={`grid origin-top grid-cols-4 items-center gap-4 transition-all duration-300 ease-in-out ${isRegistering && !isForgotPassword ? 'max-h-20 scale-y-100 opacity-100' : 'max-h-0 scale-y-0 opacity-0'}`}
            >
                <Label htmlFor="username" className="text-right text-slate-900 font-medium">
                    Username
                </Label>
                <Input
                    id="username"
                    name="username"
                    className="col-span-3 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50 backdrop-blur-md border-white/50 shadow-sm placeholder:text-slate-500"
                    required={isRegistering}
                    type="text"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
        </div>
    )

    return (
        <Dialog modal={false}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white/40 backdrop-blur-3xl border-white/40 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-slate-900">
                        {isForgotPassword
                            ? 'Forgot Password'
                            : isRegistering
                              ? 'Register'
                              : 'Log In'}
                    </DialogTitle>
                    <DialogDescription className="text-slate-700">
                        {isForgotPassword
                            ? "Enter your email address and we'll send you a link to reset your password."
                            : 'By continuing, you agree to our User Agreement and acknowledge that you understand the Privacy Policy.'}
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={
                        isForgotPassword ? handleForgotPassword : handleSubmit
                    }
                >
                    {renderForm()}
                    {error && (
                        <div className="mt-2 text-sm text-red-700 bg-red-100/60 backdrop-blur-md px-3 py-2 rounded-lg border border-red-300/40">
                            {error}
                        </div>
                    )}
                    <DialogFooter className="mt-4">
                        <Button 
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300"
                        >
                            {isForgotPassword
                                ? 'Reset Password'
                                : isRegistering
                                  ? 'Register'
                                  : 'Login'}
                        </Button>
                    </DialogFooter>
                </form>
                <div className="mt-4 flex justify-between bg-white/30 backdrop-blur-xl rounded-xl p-3 border border-white/40">
                    <DialogDescription
                        className="cursor-pointer text-purple-700 hover:text-purple-800 font-medium transition-colors"
                        onClick={() => {
                            setIsRegistering(!isRegistering)
                            setIsForgotPassword(false)
                            setError(null)
                        }}
                    >
                        {isRegistering
                            ? 'Already have an account? Log in'
                            : "Don't have an account? Register"}
                    </DialogDescription>
                    {!isRegistering && (
                        <DialogDescription
                            className="cursor-pointer text-purple-700 hover:text-purple-800 font-medium transition-colors"
                            onClick={() => {
                                setIsForgotPassword(!isForgotPassword)
                                setIsRegistering(false)
                                setError(null)
                            }}
                        >
                            {isForgotPassword
                                ? 'Back to Login'
                                : 'Forgot Password?'}
                        </DialogDescription>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default LoginModal
