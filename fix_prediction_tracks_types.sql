-- Corrigir tipos de dados na tabela prediction_tracks para compatibilidade com a função RPC
-- Data: 2025-11-19

-- Alterar colunas VARCHAR para TEXT
ALTER TABLE prediction_tracks 
    ALTER COLUMN track_title TYPE TEXT,
    ALTER COLUMN artist_name TYPE TEXT,
    ALTER COLUMN album_name TYPE TEXT,
    ALTER COLUMN track_thumbnail TYPE TEXT,
    ALTER COLUMN track_url TYPE TEXT,
    ALTER COLUMN track_uri TYPE TEXT,
    ALTER COLUMN spotify_id TYPE TEXT;

-- Verificar a estrutura atualizada
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'prediction_tracks'
ORDER BY ordinal_position;
