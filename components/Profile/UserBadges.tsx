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
                    variant="secondary"
                    className="bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300"
                >
                    🏆 {achievment.title}
                </Badge>
            ))}
            {userAchievments.length === 0 && (
                <>
                    <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300"
                    >
                        🎧 Audiophile
                    </Badge>
                    <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300"
                    >
                        📈 Trending Spotter
                    </Badge>
                    <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                        👥 Subscriber Magnet
                    </Badge>
                </>
            )}
        </div>
    )
}

export default UserBadges
