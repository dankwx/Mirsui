import { cn } from '@/lib/utils'

type PillVariant = 'primary' | 'secondary' | 'ghost' | 'contrast'
type PillSize = 'md' | 'sm'

const baseClasses =
    'group inline-flex items-center justify-center rounded-full border text-[11px] font-semibold uppercase tracking-[0.28em] transition duration-200 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05030f]'

const sizeClasses: Record<PillSize, string> = {
    md: 'h-11 px-7 gap-2.5',
    sm: 'h-9 px-5 gap-2 text-[10px]',
}

const variantClasses: Record<PillVariant, string> = {
    primary:
        'border-white/20 bg-white/15 text-white shadow-[0_18px_45px_rgba(8,4,24,0.45)] hover:border-white/30 hover:bg-white/20 hover:text-white',
    secondary:
        'border-white/15 bg-white/[0.07] text-white/80 hover:border-white/25 hover:bg-white/[0.12] hover:text-white',
    ghost:
        'border-white/10 bg-transparent text-white/70 hover:border-white/18 hover:bg-white/[0.08] hover:text-white',
    contrast:
        'border-white bg-white text-slate-900 shadow-[0_18px_40px_rgba(255,255,255,0.35)] hover:bg-slate-100 hover:text-slate-900',
}

export function pillButtonClass(
    variant: PillVariant = 'primary',
    size: PillSize = 'md',
    extra?: string
) {
    return cn(baseClasses, sizeClasses[size], variantClasses[variant], extra)
}
