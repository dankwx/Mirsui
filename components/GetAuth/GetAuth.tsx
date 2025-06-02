import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import Deslog from '@/app/logout/page' // Assumindo que este é um componente de cliente que lida com o logout
import LoginModalButton from '../LoginModalButton/LoginModalButton'

export default async function GetAuth() {
    const supabase = createClient()

    const { data, error } = await supabase.auth.getUser()

    // Define o nome de usuário ou 'User' se não estiver disponível
    const username = data.user?.user_metadata?.username || 'User'

    return (
        <div className="flex">
            {!data.user ? (
                // Se o usuário não estiver logado, exibe o botão do modal de login
                <LoginModalButton />
            ) : (
                // Se o usuário estiver logado, exibe o nome de usuário e o menu de dropdown
                <div className="flex items-center">
                    {' '}
                    {/* Adicionado flex e items-center para alinhar */}
                    {/* Exibe o nome de usuário como um texto simples */}
                    <span className="mr-2">{username}</span>
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger className="outline-none">
                            {/* Ícone de seta para baixo */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-chevron-down outline-none focus:outline-none"
                            >
                                <path d="m6 9 6 6 6-6" />
                            </svg>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                {/* Link para o perfil do usuário */}
                                <Link href={`/user/${username}`}>Perfil</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Ajuda</DropdownMenuItem>
                            <DropdownMenuItem>
                                Política de Privacidade
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer">
                                {/* Componente para deslogar o usuário */}
                                <Deslog />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </div>
    )
}
