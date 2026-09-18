import styles from './ClubShell.module.css'

export default function ClubShell({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className={styles.shell} data-club-theme="auto">
            {children}
        </div>
    )
}
