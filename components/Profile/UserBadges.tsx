import { Badge } from '../ui/badge'

interface Achievments {
    achievement_id: string
    title: string
    description: string
    achieved_at: string
}

interface AchievmentsSectionProps {
    userAchievments: Achievments[]
}

const UserBadges: React.FC<AchievmentsSectionProps> = ({ userAchievments }) => {
    return (
        <div className="flex flex-wrap gap-2">
            {userAchievments.map((achievment) => (
                <Badge
                    key={achievment.achievement_id}
                    variant="outline"
                    className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-1 text-[11px] font-medium uppercase tracking-[0.35em] text-white/65 shadow-[0_12px_28px_rgba(8,4,20,0.45)] hover:border-white/25 hover:text-white"
                >
                    🏆 {achievment.title}
                </Badge>
            ))}
            {userAchievments.length === 0 && (
                <>
                    <Badge
                        variant="outline"
                        className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-1 text-[11px] font-medium uppercase tracking-[0.35em] text-white/65 shadow-[0_12px_28px_rgba(8,4,20,0.45)] hover:border-white/25 hover:text-white"
                    >
                        🎧 Audiophile
                    </Badge>
                    <Badge
                        variant="outline"
                        className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-1 text-[11px] font-medium uppercase tracking-[0.35em] text-white/65 shadow-[0_12px_28px_rgba(8,4,20,0.45)] hover:border-white/25 hover:text-white"
                    >
                        📈 Trending Spotter
                    </Badge>
                    <Badge
                        variant="outline"
                        className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-1 text-[11px] font-medium uppercase tracking-[0.35em] text-white/65 shadow-[0_12px_28px_rgba(8,4,20,0.45)] hover:border-white/25 hover:text-white"
                    >
                        👥 Subscriber Magnet
                    </Badge>
                </>
            )}
        </div>
    )
}

export default UserBadges
