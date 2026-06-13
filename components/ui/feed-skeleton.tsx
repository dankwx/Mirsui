import { Skeleton } from '@/components/ui/skeleton'

export function FeedPostSkeleton() {
    return (
        <div className="grid grid-cols-[72px_1fr] gap-3.5 border-b border-mir-line py-[22px] sm:grid-cols-[96px_1fr] sm:gap-[18px]">
            <Skeleton className="h-24 w-24 rounded-[9px] bg-mir-fill2" />
            <div className="flex flex-col">
                <div className="flex items-center gap-2.5">
                    <Skeleton className="h-6 w-6 rounded-full bg-mir-fill2" />
                    <Skeleton className="h-3.5 w-28 bg-mir-fill2" />
                    <Skeleton className="h-3 w-12 bg-mir-fill2" />
                </div>
                <Skeleton className="mt-3 h-5 w-48 bg-mir-fill2" />
                <Skeleton className="mt-2 h-4 w-32 bg-mir-fill2" />
                <div className="mt-3 flex items-center gap-4">
                    <Skeleton className="h-3.5 w-20 bg-mir-fill2" />
                    <Skeleton className="h-3.5 w-24 bg-mir-fill2" />
                    <div className="ml-auto flex gap-2">
                        <Skeleton className="h-8 w-20 rounded-lg bg-mir-fill2" />
                        <Skeleton className="h-8 w-9 rounded-lg bg-mir-fill2" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export function FeedSkeleton() {
    return (
        <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-10">
            <header className="pt-10">
                <Skeleton className="h-3 w-16 bg-mir-fill2" />
                <Skeleton className="mt-3 h-10 w-[420px] max-w-full bg-mir-fill2" />
                <Skeleton className="mt-3 h-4 w-[520px] max-w-full bg-mir-fill2" />
                <Skeleton className="mt-6 h-10 w-72 rounded-full bg-mir-fill2" />
            </header>

            <div className="grid grid-cols-1 items-start gap-[34px] pb-[70px] pt-[30px] lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-[46px]">
                <div className="flex flex-col">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <FeedPostSkeleton key={index} />
                    ))}
                </div>
                <div className="rounded-[14px] border border-mir-line bg-mir-surface p-5">
                    <Skeleton className="h-4 w-32 bg-mir-fill2" />
                    <Skeleton className="mt-3 h-3 w-full bg-mir-fill2" />
                    <div className="mt-4 space-y-3">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <Skeleton className="h-3 w-4 bg-mir-fill2" />
                                <Skeleton className="h-10 w-10 rounded-md bg-mir-fill2" />
                                <div className="flex-1">
                                    <Skeleton className="mb-1 h-3.5 w-full bg-mir-fill2" />
                                    <Skeleton className="h-3 w-2/3 bg-mir-fill2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
