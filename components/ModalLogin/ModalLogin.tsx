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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const formData = new FormData()
        formData.append('email', email)
        formData.append('password', password)
        if (isRegistering) {
            formData.append('username', username)
            await signup(formData)
        } else {
            await login(formData)
        }
    }

    const handleForgotPassword = (e: React.FormEvent) => {
        e.preventDefault()
        // Implement forgot password logic here
        console.log("Forgot password for email:", email)
    }

    const renderForm = () => (
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                    Email
                </Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="col-span-3 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary"
                    value={email}
                    placeholder="email@email.com"
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div 
                className={`grid grid-cols-4 items-center gap-4 transition-all duration-300 ease-in-out origin-top
                            ${!isForgotPassword ? 'max-h-20 opacity-100 scale-y-100' : 'max-h-0 opacity-0 scale-y-0'}`}
            >
                <Label htmlFor="password" className="text-right">
                    Password
                </Label>
                <Input
                    id="password"
                    name="password"
                    className="col-span-3 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary"
                    required={!isForgotPassword}
                    type="password"
                    placeholder="*******"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <div 
                className={`grid grid-cols-4 items-center gap-4 transition-all duration-300 ease-in-out origin-top
                            ${isRegistering && !isForgotPassword ? 'max-h-20 opacity-100 scale-y-100' : 'max-h-0 opacity-0 scale-y-0'}`}
            >
                <Label htmlFor="username" className="text-right">
                    Username
                </Label>
                <Input
                    id="username"
                    name="username"
                    className="col-span-3 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary"
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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {isForgotPassword ? 'Forgot Password' : isRegistering ? 'Register' : 'Log In'}
                    </DialogTitle>
                    <DialogDescription>
                        {isForgotPassword 
                            ? 'Enter your email address and we\'ll send you a link to reset your password.' 
                            : 'By continuing, you agree to our User Agreement and acknowledge that you understand the Privacy Policy.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit}>
                    {renderForm()}
                    <DialogFooter>
                        <Button type="submit">
                            {isForgotPassword ? 'Reset Password' : isRegistering ? 'Register' : 'Login'}
                        </Button>
                    </DialogFooter>
                </form>
                <div className="flex justify-between mt-4">
                    <DialogDescription
                        className="cursor-pointer text-blue-600"
                        onClick={() => {
                            setIsRegistering(!isRegistering)
                            setIsForgotPassword(false)
                        }}
                    >
                        {isRegistering ? 'Already have an account? Log in' : "Don't have an account? Register"}
                    </DialogDescription>
                    {!isRegistering && (
                        <DialogDescription
                            className="cursor-pointer text-blue-600"
                            onClick={() => {
                                setIsForgotPassword(!isForgotPassword)
                                setIsRegistering(false)
                            }}
                        >
                            {isForgotPassword ? 'Back to Login' : 'Forgot Password?'}
                        </DialogDescription>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default LoginModal