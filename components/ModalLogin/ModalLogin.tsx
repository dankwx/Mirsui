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
    const [displayName, setDisplayName] = React.useState('')
    const [isRegistering, setIsRegistering] = React.useState(false)
    const [registrationStep, setRegistrationStep] = React.useState(1)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const formData = new FormData()
        formData.append('email', email)
        formData.append('password', password)
        if (isRegistering) {
            formData.append('username', username)
            formData.append('displayName', displayName)
            await signup(formData)
        } else {
            await login(formData)
        }
    }

    const renderAlreadyHaveAccount = () => (
        <DialogDescription
            className="cursor-pointer pt-4 text-blue-600"
            onClick={() => setIsRegistering(false)}
        >
            Already have an account? Log in
        </DialogDescription>
    )

    const renderLoginForm = () => (
        <>
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
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                        Password
                    </Label>
                    <Input
                        id="password"
                        name="password"
                        className="col-span-3 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                        type="password"
                        placeholder="*******"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>
            <DialogDescription className="pt-4 text-blue-600">
                Forgot Password?
            </DialogDescription>
            <DialogDescription
                className="cursor-pointer pt-4 text-blue-600"
                onClick={() => setIsRegistering(true)}
            >
                Don&apos;t have an account? Register
            </DialogDescription>
        </>
    )

    const renderRegistrationForm = () => (
        <>
            <div className="grid gap-4 py-4">
                {registrationStep === 1 ? (
                    <>
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
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="text-right">
                                Password
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                className="col-span-3 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                                type="password"
                                placeholder="*******"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="username" className="text-right">
                                Username
                            </Label>
                            <Input
                                id="username"
                                name="username"
                                className="col-span-3 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                                type="text"
                                placeholder="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    </>
                ) : (
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="displayName" className="text-right">
                            Display Name
                        </Label>
                        <Input
                            id="displayName"
                            name="displayName"
                            className="col-span-3 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                            type="text"
                            placeholder="Display Name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                        />
                    </div>
                )}
            </div>
            {renderAlreadyHaveAccount()}
        </>
    )

    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {isRegistering ? 'Register' : 'Log In'}
                    </DialogTitle>
                    <DialogDescription>
                        By continuing, you agree to our User Agreement and
                        acknowledge that you understand the Privacy Policy.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    {isRegistering
                        ? renderRegistrationForm()
                        : renderLoginForm()}
                    <DialogFooter>
                        {isRegistering && registrationStep === 1 ? (
                            <Button
                                type="button"
                                onClick={() => setRegistrationStep(2)}
                            >
                                Next
                            </Button>
                        ) : (
                            <Button type="submit">
                                {isRegistering ? 'Register' : 'Login'}
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default LoginModal
