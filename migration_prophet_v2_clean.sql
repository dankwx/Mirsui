-- Migration: Criar nova tabela music_predictions_v2 limpa e simplificada
-- Data: 2025-11-14
-- Objetivo: Sistema clean sem dados legados, com estrutura otimizada

-- ============================================
-- 1. CRIAR NOVA TABELA LIMPA
-- ============================================

CREATE TABLE IF NOT EXISTS public.music_predictions_v2 (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    prediction_track_id INTEGER NOT NULL REFERENCES prediction_tracks(id) ON DELETE CASCADE,
    
    -- Dados da previsão
    prediction_type VARCHAR(20) NOT NULL CHECK (prediction_type IN ('increase', 'decrease')),
    initial_popularity INTEGER NOT NULL, -- Popularidade no momento da previsão
    predicted_date DATE NOT NULL, -- Data limite para verificar
    points_bet INTEGER NOT NULL CHECK (points_bet >= 10 AND points_bet <= 1000),
    
    -- Resultado (preenchido quando expira)
    final_popularity INTEGER NULL, -- Popularidade na data prevista
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost')),
    points_earned INTEGER NULL DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    evaluated_at TIMESTAMP NULL, -- Quando foi avaliada
    
    -- Constraints
    CONSTRAINT unique_user_track_v2 UNIQUE (user_id, prediction_track_id)
);

-- ============================================
-- 2. ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX idx_predictions_v2_user ON music_predictions_v2(user_id);
CREATE INDEX idx_predictions_v2_status ON music_predictions_v2(status);
CREATE INDEX idx_predictions_v2_date ON music_predictions_v2(predicted_date);
CREATE INDEX idx_predictions_v2_type ON music_predictions_v2(prediction_type);

-- ============================================
-- 3. FUNÇÃO PARA CALCULAR PONTOS (SIMPLIFICADA)
-- ============================================

DROP FUNCTION IF EXISTS calculate_prediction_points_v2(VARCHAR, INTEGER, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION calculate_prediction_points_v2(
    p_prediction_type VARCHAR,
    p_initial_popularity INTEGER,
    p_final_popularity INTEGER,
    p_points_bet INTEGER
) RETURNS INTEGER AS $$
DECLARE
    v_difference INTEGER;
    v_multiplier NUMERIC;
    v_difficulty_bonus NUMERIC;
    v_points_earned INTEGER;
BEGIN
    -- Calcular diferença real
    v_difference := p_final_popularity - p_initial_popularity;
    
    -- Verificar se acertou a direção
    IF p_prediction_type = 'increase' AND v_difference <= 0 THEN
        RETURN 0; -- Errou: previu crescimento mas não cresceu
    END IF;
    
    IF p_prediction_type = 'decrease' AND v_difference >= 0 THEN
        RETURN 0; -- Errou: previu queda mas não caiu
    END IF;
    
    -- Multiplicador baseado na diferença (quanto maior, mais pontos)
    -- Cada ponto de diferença = 10% extra
    v_multiplier := 1.0 + (ABS(v_difference)::NUMERIC / 10.0);
    
    -- Bônus para previsões de queda (mais difícil)
    v_difficulty_bonus := CASE 
        WHEN p_prediction_type = 'decrease' THEN 1.3
        ELSE 1.0
    END;
    
    -- Calcular pontos
    v_points_earned := ROUND(
        p_points_bet * v_multiplier * v_difficulty_bonus
    );
    
    -- Garantir retorno mínimo de 10% se acertou
    IF v_points_earned < (p_points_bet * 0.1) THEN
        v_points_earned := ROUND(p_points_bet * 0.1);
    END IF;
    
    RETURN v_points_earned;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- 4. FUNÇÃO PARA PROCESSAR PREVISÕES EXPIRADAS
-- ============================================

DROP FUNCTION IF EXISTS process_expired_predictions_v2();

CREATE OR REPLACE FUNCTION process_expired_predictions_v2()
RETURNS TABLE(
    prediction_id INTEGER,
    user_id_result UUID,
    track_title TEXT,
    status_result VARCHAR,
    points_result INTEGER,
    difference INTEGER
) AS $$
DECLARE
    v_prediction RECORD;
    v_current_popularity INTEGER;
    v_points_earned INTEGER;
    v_difference INTEGER;
BEGIN
    -- Buscar previsões pendentes que expiraram
    FOR v_prediction IN
        SELECT 
            mp.id,
            mp.user_id,
            mp.prediction_track_id,
            mp.initial_popularity,
            mp.points_bet,
            mp.prediction_type,
            pt.track_title,
            pt.popularity as current_popularity
        FROM music_predictions_v2 mp
        JOIN prediction_tracks pt ON mp.prediction_track_id = pt.id
        WHERE mp.status = 'pending'
        AND mp.predicted_date <= CURRENT_DATE
    LOOP
        v_current_popularity := v_prediction.current_popularity;
        v_difference := v_current_popularity - v_prediction.initial_popularity;
        
        -- Calcular pontos ganhos
        v_points_earned := calculate_prediction_points_v2(
            v_prediction.prediction_type,
            v_prediction.initial_popularity,
            v_current_popularity,
            v_prediction.points_bet
        );
        
        -- Atualizar previsão
        UPDATE music_predictions_v2
        SET 
            status = CASE 
                WHEN v_points_earned > 0 THEN 'won'
                ELSE 'lost'
            END,
            final_popularity = v_current_popularity,
            points_earned = v_points_earned,
            evaluated_at = CURRENT_TIMESTAMP
        WHERE id = v_prediction.id;
        
        -- Se ganhou, creditar pontos ao usuário
        IF v_points_earned > 0 THEN
            PERFORM credit_user_points(
                v_prediction.user_id,
                v_points_earned,
                'Previsão correta: ' || v_prediction.track_title,
                v_prediction.id
            );
        END IF;
        
        -- Retornar resultado para log
        prediction_id := v_prediction.id;
        user_id_result := v_prediction.user_id;
        track_title := v_prediction.track_title;
        status_result := CASE WHEN v_points_earned > 0 THEN 'won' ELSE 'lost' END;
        points_result := v_points_earned;
        difference := v_difference;
        
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. FUNÇÃO PARA BUSCAR PREVISÕES DO USUÁRIO
-- ============================================

DROP FUNCTION IF EXISTS get_user_predictions_v2(UUID);

CREATE OR REPLACE FUNCTION get_user_predictions_v2(p_user_id UUID)
RETURNS TABLE(
    prediction_id INTEGER,
    track_id INTEGER,
    track_title TEXT,
    artist_name TEXT,
    track_thumbnail TEXT,
    prediction_type VARCHAR,
    initial_popularity INTEGER,
    current_popularity INTEGER,
    final_popularity INTEGER,
    predicted_date DATE,
    points_bet INTEGER,
    points_earned INTEGER,
    status VARCHAR,
    created_at TIMESTAMP,
    days_remaining INTEGER,
    is_expired BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mp.id,
        pt.id,
        pt.track_title,
        pt.artist_name,
        pt.track_thumbnail,
        mp.prediction_type,
        mp.initial_popularity,
        pt.popularity as current_popularity,
        mp.final_popularity,
        mp.predicted_date,
        mp.points_bet,
        mp.points_earned,
        mp.status,
        mp.created_at,
        (mp.predicted_date - CURRENT_DATE)::INTEGER as days_remaining,
        (mp.predicted_date < CURRENT_DATE) as is_expired
    FROM music_predictions_v2 mp
    JOIN prediction_tracks pt ON mp.prediction_track_id = pt.id
    WHERE mp.user_id = p_user_id
    ORDER BY mp.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. FUNÇÃO PARA ESTATÍSTICAS DO USUÁRIO
-- ============================================

DROP FUNCTION IF EXISTS get_user_prediction_stats_v2(UUID);

CREATE OR REPLACE FUNCTION get_user_prediction_stats_v2(p_user_id UUID)
RETURNS TABLE(
    total_predictions INTEGER,
    correct_predictions INTEGER,
    total_points_bet INTEGER,
    total_points_earned INTEGER,
    net_profit INTEGER,
    accuracy_percentage NUMERIC,
    best_prediction INTEGER,
    average_return NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_predictions,
        COUNT(*) FILTER (WHERE status = 'won')::INTEGER as correct_predictions,
        COALESCE(SUM(points_bet), 0)::INTEGER as total_points_bet,
        COALESCE(SUM(points_earned), 0)::INTEGER as total_points_earned,
        (COALESCE(SUM(points_earned), 0) - COALESCE(SUM(points_bet), 0))::INTEGER as net_profit,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(*) FILTER (WHERE status = 'won')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0 
        END as accuracy_percentage,
        COALESCE(MAX(points_earned), 0)::INTEGER as best_prediction,
        CASE 
            WHEN COUNT(*) FILTER (WHERE status != 'pending') > 0 THEN
                ROUND(
                    (COALESCE(SUM(points_earned), 0)::NUMERIC / 
                    COALESCE(SUM(points_bet) FILTER (WHERE status != 'pending'), 1)::NUMERIC) * 100,
                    2
                )
            ELSE 0
        END as average_return
    FROM music_predictions_v2
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. TRIGGER PARA ATUALIZAR POPULARIDADE (OPCIONAL)
-- ============================================

-- Função para ser chamada por cronjob/webhook do Spotify
CREATE OR REPLACE FUNCTION update_track_popularity(
    p_track_id INTEGER,
    p_new_popularity INTEGER
) RETURNS VOID AS $$
BEGIN
    UPDATE prediction_tracks
    SET 
        popularity = p_new_popularity,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_track_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. POLÍTICAS RLS (Row Level Security)
-- ============================================

ALTER TABLE music_predictions_v2 ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver suas próprias previsões
DROP POLICY IF EXISTS "Users can view own predictions" ON music_predictions_v2;
CREATE POLICY "Users can view own predictions" 
    ON music_predictions_v2 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Usuários podem criar suas próprias previsões
DROP POLICY IF EXISTS "Users can create own predictions" ON music_predictions_v2;
CREATE POLICY "Users can create own predictions" 
    ON music_predictions_v2 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Apenas sistema pode atualizar (via functions)
DROP POLICY IF EXISTS "System can update predictions" ON music_predictions_v2;
CREATE POLICY "System can update predictions" 
    ON music_predictions_v2 
    FOR UPDATE 
    USING (true);

-- ============================================
-- 9. COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================

COMMENT ON TABLE music_predictions_v2 IS 'Sistema de previsões musicais V2 - Simplificado e otimizado';
COMMENT ON COLUMN music_predictions_v2.prediction_type IS 'Tipo: increase (vai crescer) ou decrease (vai cair)';
COMMENT ON COLUMN music_predictions_v2.initial_popularity IS 'Popularidade no momento da aposta';
COMMENT ON COLUMN music_predictions_v2.final_popularity IS 'Popularidade na data avaliada';
COMMENT ON COLUMN music_predictions_v2.points_earned IS 'Pontos ganhos = bet * (1 + diferença/10) * bônus_tipo';

-- ============================================
-- 10. GRANT PERMISSIONS
-- ============================================

GRANT SELECT, INSERT ON music_predictions_v2 TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_predictions_v2(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_prediction_stats_v2(UUID) TO authenticated;

-- ============================================
-- EXEMPLO DE USO NO CRON JOB
-- ============================================

-- Criar extension pg_cron (se ainda não existir)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Agendar processamento diário às 00:05
-- SELECT cron.schedule(
--     'process-expired-predictions',
--     '5 0 * * *', -- Todo dia às 00:05
--     $$SELECT process_expired_predictions_v2()$$
-- );

-- Para executar manualmente:
-- SELECT * FROM process_expired_predictions_v2();
