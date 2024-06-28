"use client"

import { useState, useEffect } from 'react';

interface VideoData {
    id: string;
    title: string;
    thumbnailUrl: string;
}

const GetYoutube: React.FC = () => {
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [videoData, setVideoData] = useState<VideoData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!videoUrl) return;

        // Regex para extrair o ID do vídeo do YouTube
        const videoIdRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

        const match = videoUrl.match(videoIdRegex);
        if (match && match[1]) {
            const videoId = match[1];
            const apiKey = 'AIzaSyBFQKXiPBiluxE3jtWnTvZH3A9K76A8afc'; // Substitua pela sua chave de API do Google

            // Requisição para obter informações básicas do vídeo (incluindo o título)
            fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`)
                .then(response => response.json())
                .then(data => {
                    if (data.items.length === 0) {
                        setError('Video não encontrado');
                        setVideoData(null);
                    } else {
                        const title = data.items[0].snippet.title;
                        
                        // Requisição para obter informações da miniatura do vídeo
                        fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`)
                            .then(response => response.json())
                            .then(data => {
                                const thumbnailUrl = data.items[0].snippet.thumbnails.default.url;
                                setVideoData({ id: videoId, title, thumbnailUrl });
                                setError(null);
                            })
                            .catch(error => {
                                console.error('Erro ao buscar miniatura do vídeo do YouTube:', error);
                                setError('Erro ao buscar miniatura do vídeo do YouTube');
                                setVideoData(null);
                            });
                    }
                })
                .catch(error => {
                    console.error('Erro ao buscar vídeo do YouTube:', error);
                    setError('Erro ao buscar vídeo do YouTube');
                    setVideoData(null);
                });
        } else {
            setError('URL inválida do YouTube');
            setVideoData(null);
        }
    }, [videoUrl]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setVideoUrl(event.target.value);
    };

    return (
        <main>
            <div>
                <input type="text" value={videoUrl} onChange={handleInputChange} placeholder="Insira a URL do vídeo do YouTube" />
                {error && <p>{error}</p>}
                {videoData && (
                    <div>
                        <h2>Título do vídeo:</h2>
                        <p>{videoData.title}</p>
                        <h2>Thumbnail do vídeo:</h2>
                        <img src={videoData.thumbnailUrl} alt="Thumbnail do vídeo" />
                    </div>
                )}
            </div>
        </main>
    );
};

export default GetYoutube;
