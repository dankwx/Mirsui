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
import { sign } from 'crypto'

interface LoginModalProps {
    trigger: React.ReactNode
    onLogin: (email: string, password: string) => void
}

const LoginModal: React.FC<LoginModalProps> = ({ trigger, onLogin }) => {
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [username, setUsername] = React.useState('')



    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Log In</DialogTitle>
                    <DialogDescription>
                        By continuing, you agree to our User Agreement and
                        acknowledge that you understand the Privacy Policy.
                    </DialogDescription>
                </DialogHeader>
                <form>
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
                                className="col-span-3"
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
                                className="col-span-3"
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
                    <DialogDescription className="pt-4 text-blue-600">
                        Don't have an account? Register
                    </DialogDescription>
                    <DialogFooter>
                        <Button type='submit' formAction={login}>
                            Login
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default LoginModal
