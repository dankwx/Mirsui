interface MirsuiLogoProps {
    size?: number
    className?: string
}

export default function MirsuiLogo({ size = 38, className }: MirsuiLogoProps) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 100 100"
            aria-hidden="true"
        >
            <circle cx="50" cy="50" r="49" fill="#16120c" />
            <path
                d="M50 1 a49 49 0 0 1 0 98 a24.5 24.5 0 0 1 0-49 a24.5 24.5 0 0 0 0-49z"
                fill="#cdef36"
            />
            <circle cx="50" cy="25.5" r="7.2" fill="#16120c" />
            <circle cx="50" cy="74.5" r="7.2" fill="#cdef36" />
        </svg>
    )
}
