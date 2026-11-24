import styles from './ClubShell.module.css'

export default function ClubShell({
    children,
    className,
    palette,
}: {
    children: React.ReactNode
    className?: string
    palette?: 'grafite' | 'mostarda'
}) {
    return (
        <div
            className={className ? `${styles.shell} ${className}` : styles.shell}
            data-club-theme="light"
            data-home-palette={palette}
        >
            {children}
        </div>
    )
}
