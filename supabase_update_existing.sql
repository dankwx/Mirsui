-- Script para adicionar thumbnail_url à tabela playlists existente
-- Execute este script se você já tem o banco configurado e quer apenas adicionar o campo thumbnail

-- Adicionar a coluna thumbnail_url se ela não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'playlists' 
        AND column_name = 'thumbnail_url'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.playlists ADD COLUMN thumbnail_url TEXT;
    END IF;
END $$;

-- Remover a função existente primeiro (necessário para alterar o tipo de retorno)
DROP FUNCTION IF EXISTS get_user_playlists(uuid);

-- Recriar a função get_user_playlists para incluir thumbnail_url
CREATE OR REPLACE FUNCTION get_user_playlists(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    description TEXT,
    thumbnail_url TEXT,
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
        p.thumbnail_url,
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