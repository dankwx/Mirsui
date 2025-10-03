'use client'

import { useState } from 'react'
import html2canvas from 'html2canvas'

type Song = {
    id: string
    track_title: string
    artist_name: string
    album_name: string
    claimedat: string | null
    discover_rating: number | null
    popularity: number
    track_thumbnail: string | null
}

type UserData = {
    display_name: string
    username: string
    avatar_url?: string | null
}

export const useCertificateGeneratorSimple = () => {
    const [isGenerating, setIsGenerating] = useState(false)

    const generateCertificate = async (song: Song, userData: UserData) => {
        setIsGenerating(true)
        
        try {
            // Criar um canvas diretamente para testar
            const canvas = document.createElement('canvas')
            canvas.width = 840  // Voltando para 840
            canvas.height = 560 // Voltando para 560
            const ctx = canvas.getContext('2d')
            
            if (!ctx) {
                throw new Error('Não foi possível criar contexto do canvas')
            }

            // Fundo gradiente
            const gradient = ctx.createLinearGradient(0, 0, 840, 560) // Voltando para 840x560
            gradient.addColorStop(0, '#667eea')
            gradient.addColorStop(1, '#764ba2')
            
            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, 840, 560) // Voltando para 840x560

            // Data formatada
            const claimDate = song.claimedat 
                ? new Date(song.claimedat).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                })
                : 'Unknown date'

            // Definir fonte
            ctx.fillStyle = '#ffffff'
            ctx.textAlign = 'left'
            ctx.textBaseline = 'top'

            // Header - Logo
            ctx.font = 'bold 40px Arial, sans-serif' // Mantendo fonte aumentada
            ctx.fillStyle = '#10b981'
            ctx.fillText('SOUNDSAGE', 42, 42) // Voltando posições originais

            // Subtítulo
            ctx.font = '14px Arial, sans-serif' // Mantendo fonte aumentada
            ctx.fillStyle = '#ffffff'
            ctx.globalAlpha = 0.8
            ctx.fillText('Music Discovery Platform', 42, 84) // Voltando posições
            ctx.globalAlpha = 1

            // Data no canto superior direito
            ctx.textAlign = 'right'
            ctx.font = '12px Arial, sans-serif' // Mantendo fonte aumentada
            ctx.fillStyle = '#ffffff'
            ctx.globalAlpha = 0.7
            ctx.fillText('Early Adopter', 798, 42) // Voltando para 840-42
            ctx.fillText(`Discovered ${claimDate}`, 798, 56) // Voltando posições
            ctx.globalAlpha = 1

            // Área da capa do álbum (placeholder) - voltando tamanho original
            ctx.fillStyle = '#1f2937'
            ctx.fillRect(42, 126, 196, 196) // Voltando para 196x196

            // Se não há thumbnail, desenhar ícone musical
            if (!song.track_thumbnail) {
                ctx.font = 'bold 50px Arial, sans-serif' // Mantendo fonte aumentada
                ctx.fillStyle = '#4ecdc4'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillText('♪', 140, 224) // Voltando para centro original (42+196/2, 126+196/2)
            }

            // Badge "DISCOVERED" - voltando posição original
            ctx.fillStyle = '#10b981'
            ctx.fillRect(210, 133, 84, 21) // Voltando tamanho original
            ctx.font = 'bold 10px Arial, sans-serif' // Mantendo fonte um pouco aumentada
            ctx.fillStyle = '#ffffff'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('🎵 DISCOVERED', 252, 143.5) // Voltando posição original

            // Informações da música
            ctx.textAlign = 'left'
            ctx.textBaseline = 'top'

            // Badge do usuário - voltando tamanho original
            ctx.fillStyle = 'rgba(255,255,255,0.15)'
            ctx.fillRect(280, 126, 210, 42) // Voltando tamanho original
            
            // Inicial do usuário
            ctx.fillStyle = '#10b981'
            ctx.fillRect(287, 133, 28, 28) // Voltando tamanho original
            ctx.font = 'bold 16px Arial, sans-serif' // Mantendo fonte aumentada
            ctx.fillStyle = '#ffffff'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(userData.username.charAt(0).toUpperCase(), 301, 147) // Voltando posição

            // Nome do usuário - usando username
            ctx.textAlign = 'left'
            ctx.textBaseline = 'top'
            ctx.font = 'bold 13px Arial, sans-serif' // Mantendo fonte aumentada
            ctx.fillStyle = '#ffffff'
            ctx.fillText(`@${userData.username}`, 322, 134) // Voltando posição
            
            ctx.font = '10px Arial, sans-serif' // Mantendo fonte aumentada
            ctx.globalAlpha = 0.8
            ctx.fillText('Music Discoverer', 322, 148) // Voltando posição
            ctx.globalAlpha = 1

            // Título da música
            ctx.font = 'bold 28px Arial, sans-serif' // Mantendo fonte aumentada
            ctx.fillStyle = '#ffffff'
            const titleText = song.track_title.length > 30 ? song.track_title.substring(0, 30) + '...' : song.track_title
            ctx.fillText(titleText, 280, 189) // Voltando posição original

            // Artista
            ctx.font = '16px Arial, sans-serif' // Mantendo fonte aumentada
            ctx.globalAlpha = 0.9
            ctx.fillText(`by ${song.artist_name}`, 280, 224) // Voltando posição original
            ctx.globalAlpha = 1

            // Álbum
            ctx.font = 'italic 13px Arial, sans-serif' // Mantendo fonte aumentada
            ctx.globalAlpha = 0.7
            ctx.fillText(song.album_name, 280, 248) // Voltando posição original
            ctx.globalAlpha = 1

            // Stats - voltando tamanho original
            let statsY = 280 // Voltando posição original
            if (song.discover_rating) {
                ctx.fillStyle = 'rgba(255,255,255,0.1)'
                ctx.fillRect(280, statsY, 126, 56) // Voltando tamanho original
                
                ctx.font = 'bold 10px Arial, sans-serif' // Mantendo fonte aumentada
                ctx.fillStyle = '#ffffff'
                ctx.globalAlpha = 0.8
                ctx.fillText('DISCOVERY SCORE', 287, statsY + 7) // Voltando posição
                ctx.globalAlpha = 1
                
                ctx.font = 'bold 20px Arial, sans-serif' // Mantendo fonte aumentada
                ctx.fillStyle = '#10b981'
                ctx.fillText(song.discover_rating.toString(), 287, statsY + 25) // Voltando posição
                
                statsY += 70 // Voltando
            }

            if (song.popularity) {
                ctx.fillStyle = 'rgba(255,255,255,0.1)'
                ctx.fillRect(420, 280, 126, 56) // Voltando posição original
                
                ctx.font = 'bold 10px Arial, sans-serif' // Mantendo fonte aumentada
                ctx.fillStyle = '#ffffff'
                ctx.globalAlpha = 0.8
                ctx.fillText('POPULARITY', 427, 287) // Voltando posição
                ctx.globalAlpha = 1
                
                ctx.font = 'bold 20px Arial, sans-serif' // Mantendo fonte aumentada
                ctx.fillStyle = '#06d6a0'
                ctx.fillText(`${song.popularity}%`, 427, 305) // Voltando posição
            }

            // Badge de conquista - voltando tamanho original
            const achievementText = song.popularity && song.popularity < 50 ? '🎯 Underground Hero' : 
                                  song.popularity && song.popularity < 80 ? '🚀 Trendsetter' : '🔥 Hit Predictor'
            
            ctx.fillStyle = '#ff6b6b'
            ctx.fillRect(280, 364, 175, 28) // Voltando tamanho original
            ctx.font = 'bold 12px Arial, sans-serif' // Mantendo fonte aumentada
            ctx.fillStyle = '#ffffff'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(achievementText, 367.5, 378) // Voltando posição original

            // Footer - voltando posições originais
            ctx.textAlign = 'left'
            ctx.textBaseline = 'top'
            ctx.font = '10px Arial, sans-serif' // Mantendo fonte aumentada
            ctx.fillStyle = '#ffffff'
            ctx.globalAlpha = 0.6
            ctx.fillText('Generated by SoundSage', 42, 504) // Voltando posição
            ctx.fillText(new Date().toLocaleDateString('pt-BR'), 42, 518) // Voltando posição

            ctx.textAlign = 'right'
            ctx.fillText('#EarlyAdopter #MusicDiscovery', 798, 504) // Voltando posição
            ctx.globalAlpha = 1

            // Se há thumbnail, tentar carregar
            if (song.track_thumbnail) {
                try {
                    const img = new Image()
                    img.crossOrigin = 'anonymous'
                    
                    await new Promise((resolve, reject) => {
                        img.onload = () => {
                            ctx.drawImage(img, 42, 126, 196, 196) // Voltando para tamanho original da capa
                            resolve(true)
                        }
                        img.onerror = () => {
                            console.log('Erro ao carregar imagem, usando fallback')
                            resolve(false)
                        }
                        img.src = song.track_thumbnail!
                        
                        // Timeout para evitar travamentos
                        setTimeout(() => {
                            console.log('Timeout na imagem, usando fallback')
                            resolve(false)
                        }, 2000)
                    })
                } catch (error) {
                    console.log('Erro ao processar imagem:', error)
                }
            }

            // Criar link para download
            const link = document.createElement('a')
            const sanitizedTitle = song.track_title
                .replace(/[^a-z0-9]/gi, '_')
                .toLowerCase()
                .substring(0, 30)
            
            link.download = `soundsage-discovery-${sanitizedTitle}.png`
            
            // Converter canvas para blob
            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob)
                    link.href = url
                    
                    // Trigger download
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    
                    // Cleanup
                    setTimeout(() => URL.revokeObjectURL(url), 1000)
                } else {
                    throw new Error('Falha ao converter canvas para blob')
                }
            }, 'image/png', 1.0)

            return { 
                success: true, 
                fileName: link.download,
                message: `Discovery card gerado com sucesso! Download: ${link.download}`
            }
        } catch (error) {
            console.error('Error generating discovery card:', error)
            return { 
                success: false, 
                error: 'Erro ao gerar discovery card. Tente novamente.' 
            }
        } finally {
            setIsGenerating(false)
        }
    }

    return {
        generateCertificate,
        isGenerating
    }
}