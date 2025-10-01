-- RPC para buscar posts do feed com contadores de interações
CREATE OR REPLACE FUNCTION get_feed_posts_with_interactions(
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id INTEGER,
    track_url TEXT,
    track_title TEXT,
    artist_name TEXT,
    album_name TEXT,
    popularity INTEGER,
    track_thumbnail TEXT,
    user_id UUID,
    position INTEGER,
    claimedat TIMESTAMP WITH TIME ZONE,
    track_uri TEXT,
    discover_rating INTEGER,
    claim_message TEXT,
    youtube_url TEXT,
    username VARCHAR,
    display_name VARCHAR,
    avatar_url TEXT,
    likes_count BIGINT,
    comments_count BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.track_url,
        t.track_title,
        t.artist_name,
        t.album_name,
        t.popularity,
        t.track_thumbnail,
        t.user_id,
        t.position,
        t.claimedat,
        t.track_uri,
        t.discover_rating,
        t.claim_message,
        t.youtube_url,
        p.username,
        p.display_name,
        p.avatar_url,
        COALESCE(likes.count, 0) as likes_count,
        COALESCE(comments.count, 0) as comments_count
    FROM tracks t
    LEFT JOIN profiles p ON t.user_id = p.id
    LEFT JOIN (
        SELECT track_id, COUNT(*) as count
        FROM track_likes
        GROUP BY track_id
    ) likes ON t.id = likes.track_id
    LEFT JOIN (
        SELECT track_id, COUNT(*) as count
        FROM track_comments
        GROUP BY track_id
    ) comments ON t.id = comments.track_id
    WHERE t.claimedat IS NOT NULL
    ORDER BY t.claimedat DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- RPC para verificar se usuário curtiu uma track
CREATE OR REPLACE FUNCTION check_user_liked_track(
    p_track_id INTEGER,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    liked BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM track_likes 
        WHERE track_id = p_track_id AND user_id = p_user_id
    ) INTO liked;
    
    RETURN liked;
END;
$$;

-- RPC para buscar comentários de uma track
CREATE OR REPLACE FUNCTION get_track_comments(
    p_track_id INTEGER,
    p_limit INTEGER DEFAULT 10,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id INTEGER,
    track_id INTEGER,
    user_id UUID,
    comment_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    username VARCHAR,
    display_name VARCHAR,
    avatar_url TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tc.id,
        tc.track_id,
        tc.user_id,
        tc.comment_text,
        tc.created_at,
        tc.updated_at,
        p.username,
        p.display_name,
        p.avatar_url
    FROM track_comments tc
    LEFT JOIN profiles p ON tc.user_id = p.id
    WHERE tc.track_id = p_track_id
    ORDER BY tc.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;