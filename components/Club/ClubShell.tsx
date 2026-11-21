import styles from './ClubShell.module.css'

export default function ClubShell({
    children,
    className,
    defaultTheme = 'auto',
    palette,
}: {
    children: React.ReactNode
    className?: string
    defaultTheme?: 'auto' | 'light'
    palette?: 'grafite' | 'mostarda'
}) {
    return (
        <div
            className={className ? `${styles.shell} ${className}` : styles.shell}
            data-club-theme={defaultTheme}
            data-home-palette={palette}
        >
            {children}
        </div>
    )
}
