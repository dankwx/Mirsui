interface FollowersFollowingSectionProps {
    totalFollowers: number
    totalFollowing: number
}

const FollowersFollowingSection: React.FC<FollowersFollowingSectionProps> = ({
    totalFollowers,
    totalFollowing,
}) => {
    return (
        <div className="flex">
            <p className='mr-2'>Seguidores: {totalFollowers}</p>
            <p>Seguindo: {totalFollowing}</p>
            
            {/* <button className='bg-neutral-300 h-fit m-2'>follow</button>
            <button className='bg-neutral-300 h-fit m-2'>unfollow</button> */}
        </div>
    )
}

export default FollowersFollowingSection
