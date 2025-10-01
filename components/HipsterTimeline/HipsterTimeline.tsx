import React from 'react'
import { getTrackTimelineData, getAvatarEmoji } from '@/utils/hipsterTimelineService'
import HipsterTimelineClient from './HipsterTimelineClient'

interface HipsterTimelineProps {
    trackId: string
    trackTitle: string
    artistName: string
    trackUri?: string
}

export default async function HipsterTimeline({ trackId, trackTitle, artistName, trackUri }: HipsterTimelineProps) {
    // Se não tiver trackUri, criar um mock baseado no trackId
    const uri = trackUri || `spotify:track:${trackId}`
    
    // Buscar dados reais da timeline
    const { timelineData, earlyAdopters, events } = await getTrackTimelineData(uri)
    
    // Se não houver dados reais, mostrar mensagem
    if (timelineData.length === 0) {
        return (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Timeline ainda não disponível
                </h3>
                <p className="text-gray-500">
                    Esta música ainda não foi reivindicada por usuários suficientes para gerar uma timeline.
                </p>
            </div>
        )
    }

    return (
        <HipsterTimelineClient 
            timelineData={timelineData}
            earlyAdopters={earlyAdopters}
            events={events}
            trackTitle={trackTitle}
            artistName={artistName}
        />
    )
}
