interface FollowersFollowingSectionProps {
    totalFollowers: number
    totalFollowing: number
}

const FollowersFollowingSection: React.FC<FollowersFollowingSectionProps> = ({
    totalFollowers,
    totalFollowing,
}) => {
    return (
        <div className="flex items-center space-x-4 font-sans bg-neutral-200 rounded-md ml-6 px-6 mr-2">
            <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-gray-800">{totalFollowers}</span>
                <span className="text-sm text-gray-600">Seguidores</span>
            </div>
            <div className="w-px h-10 bg-gray-300"></div>
            <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-gray-800">{totalFollowing}</span>
                <span className="text-sm text-gray-600">Seguindo</span>
            </div>
        </div>
    )
}

export default FollowersFollowingSection