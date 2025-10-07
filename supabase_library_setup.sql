-- SQL para configurar as tabelas de biblioteca no Supabase
-- Execute este script no SQL Editor do Supabase

-- Tabela de playlists
CREATE TABLE public.playlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de músicas das playlists
CREATE TABLE public.playlist_tracks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    track_title VARCHAR(255) NOT NULL,
    artist_name VARCHAR(255) NOT NULL,
    album_name VARCHAR(255) NOT NULL,
    track_thumbnail TEXT,
    track_url TEXT NOT NULL,
    duration VARCHAR(10),
    track_position INTEGER NOT NULL, -- usando track_position ao invés de position (palavra reservada)
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_playlists_user_id ON public.playlists(user_id);
CREATE INDEX idx_playlist_tracks_playlist_id ON public.playlist_tracks(playlist_id);
CREATE INDEX idx_playlist_tracks_position ON public.playlist_tracks(track_position);

-- RLS (Row Level Security) - apenas o dono pode ver/editar suas playlists
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para playlists
CREATE POLICY "Users can view their own playlists" ON public.playlists
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own playlists" ON public.playlists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists" ON public.playlists
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists" ON public.playlists
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas de segurança para playlist_tracks
CREATE POLICY "Users can view tracks from their playlists" ON public.playlist_tracks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM playlists 
            WHERE playlists.id = playlist_tracks.playlist_id 
            AND playlists.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert tracks to their playlists" ON public.playlist_tracks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM playlists 
            WHERE playlists.id = playlist_tracks.playlist_id 
            AND playlists.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update tracks in their playlists" ON public.playlist_tracks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM playlists 
            WHERE playlists.id = playlist_tracks.playlist_id 
            AND playlists.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete tracks from their playlists" ON public.playlist_tracks
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM playlists 
            WHERE playlists.id = playlist_tracks.playlist_id 
            AND playlists.user_id = auth.uid()
        )
    );

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_playlists_updated_at 
    BEFORE UPDATE ON playlists 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Função para contar tracks de uma playlist
CREATE OR REPLACE FUNCTION get_playlist_track_count(playlist_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER 
        FROM playlist_tracks 
        WHERE playlist_id = playlist_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar playlists do usuário com contagem de tracks
CREATE OR REPLACE FUNCTION get_user_playlists(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    track_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.description,
        p.created_at,
        p.updated_at,
        COALESCE(
            (SELECT COUNT(*)::INTEGER FROM playlist_tracks pt WHERE pt.playlist_id = p.id),
            0
        ) as track_count
    FROM playlists p
    WHERE p.user_id = user_uuid
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar tracks de uma playlist
CREATE OR REPLACE FUNCTION get_playlist_tracks(playlist_uuid UUID)
RETURNS TABLE (
    id UUID,
    track_title VARCHAR(255),
    artist_name VARCHAR(255),
    album_name VARCHAR(255),
    track_thumbnail TEXT,
    track_url TEXT,
    duration VARCHAR(10),
    track_position INTEGER,
    added_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pt.id,
        pt.track_title,
        pt.artist_name,
        pt.album_name,
        pt.track_thumbnail,
        pt.track_url,
        pt.duration,
        pt.track_position,
        pt.added_at
    FROM playlist_tracks pt
    WHERE pt.playlist_id = playlist_uuid
    ORDER BY pt.track_position ASC, pt.added_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Inserir dados de exemplo (opcional - pode remover se não quiser dados de teste)
-- Playlist de exemplo (substitua 'USER_ID_AQUI' pelo ID real de um usuário)
/*
INSERT INTO playlists (name, description, user_id) VALUES 
('My Discoveries', 'My favorite music discoveries', 'USER_ID_AQUI'),
('Chill Vibes', 'Relaxing music for work', 'USER_ID_AQUI'),
('Workout Mix', 'High energy tracks for exercise', 'USER_ID_AQUI');

-- Tracks de exemplo para a primeira playlist
INSERT INTO playlist_tracks (playlist_id, track_title, artist_name, album_name, track_thumbnail, track_url, duration, track_position) VALUES 
(
    (SELECT id FROM playlists WHERE name = 'My Discoveries' LIMIT 1),
    'Blinding Lights',
    'The Weeknd',
    'After Hours',
    'https://i.scdn.co/image/ab67616d0000b273c02e7d6c47c7e49ce1019ace',
    'https://open.spotify.com/track/0VjIjW4GlULA0FGJSXmZRz',
    '3:20',
    1
),
(
    (SELECT id FROM playlists WHERE name = 'My Discoveries' LIMIT 1),
    'Watermelon Sugar',
    'Harry Styles',
    'Fine Line',
    'https://i.scdn.co/image/ab67616d0000b273d9985092cd88d96640bfd1ca',
    'https://open.spotify.com/track/6UelLqGlWMcVH1E5c4H7lY',
    '2:54',
    2
);
*/