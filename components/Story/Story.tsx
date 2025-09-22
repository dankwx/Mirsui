'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { 
    Play, 
    Pause, 
    SkipForward, 
    SkipBack, 
    Heart, 
    MessageCircle, 
    Share2,
    X,
    Volume2,
    VolumeX,
    Music,
    Target,
    Award,
    Zap,
    Crown
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface StoryData {
    id: number
    user: {
        username: string
        avatar: string
        isVerified: boolean
        badge: string
    }
    type: 'claim' | 'playlist' | 'milestone' | 'discovery'
    content: {
        track?: {
            title: string
            artist: string
            image: string
            duration: number
            position: number
        }
        message: string
        timestamp: string
        background: string
    }
    hasNew: boolean
}

interface StoryViewerProps {
    stories: StoryData[]
    initialStoryIndex?: number
    isOpen: boolean
    onClose: () => void
}

const mockStories: StoryData[] = [
    {
        id: 1,
        user: {
            username: 'musiclover_23',
            avatar: '🎵',
            isVerified: true,
            badge: 'Hipster Legend'
        },
        type: 'claim',
        content: {
            track: {
                title: 'Vampire',
                artist: 'Olivia Rodrigo',
                image: 'https://i.scdn.co/image/ab67616d0000b273e85259a1cae29a8d91f2093d',
                duration: 210,
                position: 1
            },
            message: 'Claimei essa antes de explodir! 🚀',
            timestamp: '2h',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        hasNew: true
    },
    {
        id: 2,
        user: {
            username: 'vinylhunter',
            avatar: '🎧',
            isVerified: false,
            badge: 'Crate Digger'
        },
        type: 'discovery',
        content: {
            track: {
                title: 'Flowers',
                artist: 'Miley Cyrus',
                image: 'https://i.scdn.co/image/ab67616d0000b273dc9dcb7e4a97b4552e9c3d0e',
                duration: 200,
                position: 3
            },
            message: 'Gem encontrada! Ainda com baixa popularidade 💎',
            timestamp: '4h',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        },
        hasNew: true
    },
    {
        id: 3,
        user: {
            username: 'trendsetter',
            avatar: '✨',
            isVerified: true,
            badge: 'Taste Maker'
        },
        type: 'milestone',
        content: {
            message: 'Acabei de chegar aos 1000 claims! 🎉',
            timestamp: '6h',
            background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
        },
        hasNew: false
    }
]

const StoryViewer: React.FC<StoryViewerProps> = ({ stories, initialStoryIndex = 0, isOpen, onClose }) => {
    const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex)
    const [progress, setProgress] = useState(0)
    const [isPlaying, setIsPlaying] = useState(true)
    const [isMuted, setIsMuted] = useState(false)

    const currentStory = stories[currentStoryIndex]

    const nextStory = () => {
        if (currentStoryIndex < stories.length - 1) {
            setCurrentStoryIndex(currentStoryIndex + 1)
            setProgress(0)
        } else {
            onClose()
        }
    }

    const prevStory = () => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(currentStoryIndex - 1)
            setProgress(0)
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'claim': return <Target className="h-4 w-4" />
            case 'playlist': return <Music className="h-4 w-4" />
            case 'milestone': return <Award className="h-4 w-4" />
            case 'discovery': return <Zap className="h-4 w-4" />
            default: return <Music className="h-4 w-4" />
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'claim': return 'text-purple-400'
            case 'playlist': return 'text-green-400'
            case 'milestone': return 'text-yellow-400'
            case 'discovery': return 'text-blue-400'
            default: return 'text-white'
        }
    }

    React.useEffect(() => {
        if (!isPlaying || !isOpen) return

        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    nextStory()
                    return 0
                }
                return prev + 1
            })
        }, 50) // 5 seconds total (100 * 50ms)

        return () => clearInterval(timer)
    }, [isPlaying, isOpen, currentStoryIndex])

    if (!currentStory) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-sm p-0 border-0 bg-transparent">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="relative w-full h-[600px] rounded-2xl overflow-hidden shadow-2xl"
                    style={{ background: currentStory.content.background }}
                >
                    {/* Progress bars */}
                    <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
                        {stories.map((_, index) => (
                            <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-white transition-all duration-75"
                                    style={{ 
                                        width: index < currentStoryIndex ? '100%' : 
                                               index === currentStoryIndex ? `${progress}%` : '0%'
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Header */}
                    <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-white">
                                <AvatarFallback className="text-lg">
                                    {currentStory.user.avatar}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-semibold text-sm">
                                        {currentStory.user.username}
                                    </span>
                                    {currentStory.user.isVerified && <Crown className="h-3 w-3 text-yellow-400" />}
                                    <div className={`flex items-center gap-1 ${getTypeColor(currentStory.type)}`}>
                                        {getTypeIcon(currentStory.type)}
                                    </div>
                                </div>
                                <span className="text-white/80 text-xs">{currentStory.content.timestamp}</span>
                            </div>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={onClose}
                            className="text-white hover:bg-white/20"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-center items-center p-6 pt-20">
                        {currentStory.content.track ? (
                            <div className="text-center space-y-6">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="relative"
                                >
                                    <img 
                                        src={currentStory.content.track.image}
                                        alt={currentStory.content.track.title}
                                        className="w-48 h-48 rounded-2xl shadow-2xl mx-auto"
                                    />
                                    <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center">
                                        <Button
                                            variant="ghost"
                                            size="lg"
                                            className="h-16 w-16 rounded-full bg-white/20 text-white hover:bg-white/30"
                                            onClick={() => setIsPlaying(!isPlaying)}
                                        >
                                            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                                        </Button>
                                    </div>
                                    <Badge className="absolute -top-3 -right-3 bg-purple-500 text-white">
                                        #{currentStory.content.track.position}
                                    </Badge>
                                </motion.div>

                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="space-y-2"
                                >
                                    <h3 className="text-white font-bold text-xl">
                                        {currentStory.content.track.title}
                                    </h3>
                                    <p className="text-white/80 text-lg">
                                        {currentStory.content.track.artist}
                                    </p>
                                </motion.div>

                                <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="text-white text-center px-4 font-medium text-lg"
                                >
                                    {currentStory.content.message}
                                </motion.p>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-center space-y-6"
                            >
                                <div className="bg-white/20 p-8 rounded-full mx-auto w-32 h-32 flex items-center justify-center">
                                    {getTypeIcon(currentStory.type)}
                                    <span className="text-6xl ml-2">{currentStory.user.avatar}</span>
                                </div>
                                <p className="text-white text-center px-4 font-medium text-xl">
                                    {currentStory.content.message}
                                </p>
                            </motion.div>
                        )}
                    </div>

                    {/* Navigation areas */}
                    <div className="absolute inset-0 flex">
                        <div className="w-1/3 h-full" onClick={prevStory} />
                        <div className="w-1/3 h-full" onClick={() => setIsPlaying(!isPlaying)} />
                        <div className="w-1/3 h-full" onClick={nextStory} />
                    </div>

                    {/* Bottom controls */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-white hover:bg-white/20"
                            >
                                <Heart className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-white hover:bg-white/20"
                            >
                                <MessageCircle className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-white hover:bg-white/20"
                            >
                                <Share2 className="h-5 w-5" />
                            </Button>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsMuted(!isMuted)}
                            className="text-white hover:bg-white/20"
                        >
                            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        </Button>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    )
}

export default function StoryComponent() {
    const [selectedStoryIndex, setSelectedStoryIndex] = useState(0)
    const [isViewerOpen, setIsViewerOpen] = useState(false)

    const openStory = (index: number) => {
        setSelectedStoryIndex(index)
        setIsViewerOpen(true)
    }

    return (
        <>
            <div className="grid grid-cols-3 gap-3">
                {mockStories.map((story, index) => (
                    <motion.div
                        key={story.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex flex-col items-center gap-2 cursor-pointer"
                        onClick={() => openStory(index)}
                    >
                        <div className={`relative p-0.5 rounded-full ${
                            story.hasNew ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300'
                        }`}>
                            <Avatar className="h-12 w-12 border-2 border-white">
                                <AvatarFallback className="text-sm">
                                    {story.user.avatar}
                                </AvatarFallback>
                            </Avatar>
                            {story.hasNew && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
                            )}
                        </div>
                        <span className="text-xs font-medium text-center leading-tight">
                            {story.user.username}
                        </span>
                    </motion.div>
                ))}
            </div>

            <StoryViewer
                stories={mockStories}
                initialStoryIndex={selectedStoryIndex}
                isOpen={isViewerOpen}
                onClose={() => setIsViewerOpen(false)}
            />
        </>
    )
}
