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

export const useCertificateGenerator = () => {
    const [isGenerating, setIsGenerating] = useState(false)

    const generateCertificate = async (song: Song, userData: UserData) => {
        setIsGenerating(true)
        
        try {
            // Criar container principal
            const container = document.createElement('div')
            container.style.position = 'fixed'
            container.style.top = '-10000px'
            container.style.left = '-10000px'
            container.style.width = '1200px'
            container.style.height = '800px'
            container.style.backgroundColor = '#667eea'
            container.style.backgroundImage = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            container.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
            container.style.color = '#ffffff'
            container.style.padding = '60px'
            container.style.boxSizing = 'border-box'
            container.style.overflow = 'hidden'

            // Data formatada
            const claimDate = song.claimedat 
                ? new Date(song.claimedat).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                })
                : 'Unknown date'

            const currentYear = new Date().getFullYear()

            // Badge de conquista baseado na popularidade
            let achievementBadge = '🏆 Music Discoverer'
            let achievementColor = '#ff6b6b'
            
            if (song.popularity) {
                if (song.popularity < 50) {
                    achievementBadge = '🎯 Underground Hero'
                    achievementColor = '#10b981'
                } else if (song.popularity < 80) {
                    achievementBadge = '🚀 Trendsetter'
                    achievementColor = '#3b82f6'
                } else {
                    achievementBadge = '🔥 Hit Predictor'
                    achievementColor = '#f59e0b'
                }
            }

            container.innerHTML = `
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
                    <div>
                        <h1 style="margin: 0; font-size: 42px; font-weight: 900; color: #10b981; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">MIRSUI</h1>
                        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8; font-weight: 500;">Music Discovery • ${currentYear}</p>
                    </div>
                    <div style="text-align: right; opacity: 0.7; background: rgba(255,255,255,0.1); padding: 12px 16px; border-radius: 10px;">
                        <p style="margin: 0; font-size: 12px; font-weight: 600;">Early Adopter</p>
                        <p style="margin: 0; font-size: 11px;">Discovered ${claimDate}</p>
                    </div>
                </div>

                <!-- Main Content -->
                <div style="display: flex; gap: 50px; align-items: center; margin-bottom: 40px;">
                    <!-- Album Cover -->
                    <div style="flex-shrink: 0;">
                        <div style="position: relative; width: 280px; height: 280px; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4); background: #1f2937;">
                            ${song.track_thumbnail ? 
                                `<img src="${song.track_thumbnail}" style="width: 100%; height: 100%; object-fit: cover;" crossorigin="anonymous" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                                 <div style="display: none; width: 100%; height: 100%; background: linear-gradient(45deg, #ff6b6b, #4ecdc4); align-items: center; justify-content: center; font-size: 64px; font-weight: bold;">♪</div>` :
                                `<div style="width: 100%; height: 100%; background: linear-gradient(45deg, #ff6b6b, #4ecdc4); display: flex; align-items: center; justify-content: center; font-size: 64px; font-weight: bold;">♪</div>`
                            }
                            <div style="position: absolute; top: 15px; right: 15px; background: rgba(16, 185, 129, 0.9); padding: 8px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; backdrop-filter: blur(10px);">
                                🎵 DISCOVERED
                            </div>
                        </div>
                    </div>

                    <!-- Track Info -->
                    <div style="flex: 1; max-width: 600px;">
                        <!-- User Badge -->
                        <div style="display: inline-flex; align-items: center; background: rgba(255,255,255,0.15); padding: 12px 20px; border-radius: 30px; margin-bottom: 30px;">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background: #10b981; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-weight: bold; font-size: 18px; color: white;">
                                ${(userData.display_name || userData.username).charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p style="margin: 0; font-weight: 600; font-size: 16px;">${userData.display_name || userData.username}</p>
                                <p style="margin: 0; font-size: 12px; opacity: 0.8;">Music Discoverer</p>
                            </div>
                        </div>

                        <!-- Track Title -->
                        <h2 style="margin: 0 0 8px 0; font-size: 36px; font-weight: 800; line-height: 1.2; color: #ffffff; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); max-width: 100%; word-wrap: break-word;">
                            ${song.track_title}
                        </h2>

                        <!-- Artist -->
                        <p style="margin: 0 0 15px 0; font-size: 20px; opacity: 0.9; font-weight: 500;">
                            by ${song.artist_name}
                        </p>

                        <!-- Album -->
                        <p style="margin: 0 0 25px 0; font-size: 16px; opacity: 0.7; font-style: italic;">
                            ${song.album_name}
                        </p>

                        <!-- Stats Grid -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
                            ${song.discover_rating ? `
                            <div style="background: rgba(255,255,255,0.1); padding: 16px 20px; border-radius: 15px;">
                                <p style="margin: 0 0 4px 0; font-size: 12px; opacity: 0.8; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">Discovery Score</p>
                                <p style="margin: 0; font-size: 24px; font-weight: 700; color: #10b981;">${song.discover_rating}</p>
                            </div>` : ''}
                            
                            ${song.popularity ? `
                            <div style="background: rgba(255,255,255,0.1); padding: 16px 20px; border-radius: 15px;">
                                <p style="margin: 0 0 4px 0; font-size: 12px; opacity: 0.8; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">Popularity</p>
                                <p style="margin: 0; font-size: 24px; font-weight: 700; color: #06d6a0;">${song.popularity}%</p>
                            </div>` : ''}
                        </div>

                        <!-- Achievement Badge -->
                        <div style="display: inline-flex; align-items: center; background: ${achievementColor}; padding: 10px 16px; border-radius: 25px; font-size: 13px; font-weight: 600; color: white;">
                            ${achievementBadge}
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div style="display: flex; justify-content: space-between; align-items: center; opacity: 0.6; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
                    <div>
                        <p style="margin: 0; font-size: 11px;">Generated by MIRSUI</p>
                        <p style="margin: 0; font-size: 11px;">${new Date().toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div style="font-size: 11px; text-align: right;">
                        <p style="margin: 0;">#EarlyAdopter #MusicDiscovery</p>
                    </div>
                </div>
            `

            // Adicionar ao DOM temporariamente
            document.body.appendChild(container)

            // Aguardar um pouco para o render e possível carregamento de imagem
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Configurações otimizadas para html2canvas
            const canvas = await html2canvas(container, {
                backgroundColor: '#667eea',
                scale: 2,
                useCORS: true,
                allowTaint: false,
                logging: false,
                width: 1200,
                height: 800,
                foreignObjectRendering: false,
                removeContainer: true
            })

            // Remover elemento temporário
            document.body.removeChild(container)

            // Verificar se o canvas foi gerado corretamente
            if (canvas.width === 0 || canvas.height === 0) {
                throw new Error('Canvas gerado com dimensões inválidas')
            }

            // Criar link para download
            const link = document.createElement('a')
            const sanitizedTitle = song.track_title
                .replace(/[^a-z0-9]/gi, '_')
                .toLowerCase()
                .substring(0, 30)
            
            link.download = `MIRSUI-discovery-${sanitizedTitle}.png`
            
            // Converter canvas para blob e criar URL
            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob)
                    link.href = url
                    
                    // Trigger download
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    
                    // Cleanup URL
                    setTimeout(() => URL.revokeObjectURL(url), 1000)
                } else {
                    throw new Error('Falha ao converter canvas para blob')
                }
            }, 'image/png', 1.0)

            return { 
                success: true, 
                fileName: link.download,
                message: `Discovery card gerado com sucesso! Download iniciado: ${link.download}`
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