import { cn } from '@/lib/utils'

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-md bg-gray-300 bg-muted/95',
                className
            )}
            {...props}
        />
    )
}

export { Skeleton }
