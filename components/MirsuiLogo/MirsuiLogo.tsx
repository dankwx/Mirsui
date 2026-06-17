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
            <rect width="100" height="100" rx="22" fill="#13110f" />
            <g transform="translate(50 50) scale(0.64) translate(-50 -50)">
                <path
                    d="M50 10 A40 40 0 0 1 50 90 A20 20 0 0 0 50 50 A20 20 0 0 1 50 10 Z"
                    fill="#ece8e0"
                />
                <circle cx="50" cy="30" r="7" fill="#84b86a" />
            </g>
        </svg>
    )
}
