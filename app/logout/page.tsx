import LogoutButton from './LogoutButton'

export default function LogoutPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
            <h1 className="text-2xl font-semibold">Deseja sair?</h1>
            <p className="text-sm text-muted-foreground">
                Confirme abaixo para encerrar sua sessão.
            </p>
            <LogoutButton className="w-auto rounded-md border border-border px-6 py-2 text-base" />
        </main>
    )
}
