import PublicShell from '@/components/Landing/PublicShell'

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <PublicShell>{children}</PublicShell>
}
