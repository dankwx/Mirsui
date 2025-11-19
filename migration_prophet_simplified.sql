-- Migration: Simplificar sistema de previsões
-- Data: 2025-11-14
-- Objetivo: Simplificar lógica de previsões para aumentar/diminuir popularidade com recompensas baseadas na diferença

-- 1. Adicionar nova coluna para tipo de previsão (aumentar ou diminuir)
ALTER TABLE public.music_predictions 
ADD COLUMN IF NOT EXISTS prediction_type VARCHAR(20) NOT NULL DEFAULT 'increase';

-- 2. Adicionar comentário explicativo
COMMENT ON COLUMN public.music_predictions.prediction_type IS 'Tipo de previsão: increase (vai ficar mais popular) ou decrease (vai ficar menos popular)';

-- 3. Remover constraint antigo se existir e recriar
ALTER TABLE public.music_predictions
DROP CONSTRAINT IF EXISTS valid_prediction_type;

ALTER TABLE public.music_predictions
ADD CONSTRAINT valid_prediction_type CHECK (prediction_type IN ('increase', 'decrease'));

-- 4. Adicionar coluna para popularidade inicial (para calcular diferença)
ALTER TABLE public.music_predictions
ADD COLUMN IF NOT EXISTS initial_popularity INTEGER;

COMMENT ON COLUMN public.music_predictions.initial_popularity IS 'Popularidade da música no momento da previsão (para calcular diferença)';

-- 5. Remover constraint antigo de popularidade alvo (se existir)
ALTER TABLE public.music_predictions
DROP CONSTRAINT IF EXISTS valid_target_popularity;

-- 6. Atualizar constraint de target_popularity para permitir valores menores que o inicial
ALTER TABLE public.music_predictions
ADD CONSTRAINT valid_target_popularity CHECK (
    (target_popularity >= 0 AND target_popularity <= 100)
);

-- 7. Remover funções antigas (se existirem) antes de recriar
DROP FUNCTION IF EXISTS process_expired_predictions();
DROP FUNCTION IF EXISTS calculate_prediction_points(VARCHAR, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER);

-- 8. Função SIMPLIFICADA para calcular pontos ganhos baseado apenas na diferença real
CREATE OR REPLACE FUNCTION calculate_prediction_points(
    p_prediction_type VARCHAR,
    p_initial_popularity INTEGER,
    p_target_popularity INTEGER,
    p_final_popularity INTEGER,
    p_points_bet INTEGER,
    p_prediction_confidence INTEGER
) RETURNS INTEGER AS $$
DECLARE
    v_actual_difference INTEGER;
    v_base_multiplier NUMERIC;
    v_difficulty_bonus NUMERIC;
    v_points_earned INTEGER;
BEGIN
    -- Calcular diferença real
    v_actual_difference := p_final_popularity - p_initial_popularity;
    
    -- Verificar se a previsão está correta (direção)
    IF p_prediction_type = 'increase' AND v_actual_difference <= 0 THEN
        RETURN 0; -- Errou: previu crescimento mas caiu ou ficou igual
    END IF;
    
    IF p_prediction_type = 'decrease' AND v_actual_difference >= 0 THEN
        RETURN 0; -- Errou: previu queda mas cresceu ou ficou igual
    END IF;
    
    -- Multiplicador base (quanto maior a diferença real, maior a recompensa)
    -- Fórmula: 1 ponto apostado = diferença de popularidade * multiplicadores
    v_base_multiplier := 1.0 + (ABS(v_actual_difference)::NUMERIC / 10.0);
    
    -- Bônus de dificuldade (previsões de decrease são mais difíceis)
    v_difficulty_bonus := CASE 
        WHEN p_prediction_type = 'decrease' THEN 1.3
        ELSE 1.0
    END;
    
    -- Calcular pontos ganhos
    -- Pontos = Aposta * (1 + diferença/10) * bônus_dificuldade
    v_points_earned := ROUND(
        p_points_bet * 
        v_base_multiplier * 
        v_difficulty_bonus
    );
    
    -- Garantir no mínimo 10% de retorno se acertou a direção
    IF v_points_earned < (p_points_bet * 0.1) THEN
        v_points_earned := ROUND(p_points_bet * 0.1);
    END IF;
    
    RETURN v_points_earned;
END;
$$ LANGUAGE plpgsql;

-- 9. Atualizar função de processar previsões expiradas
CREATE OR REPLACE FUNCTION process_expired_predictions()
RETURNS TABLE(
    prediction_id INTEGER,
    track_title TEXT,
    status_result VARCHAR,
    points_result INTEGER
) AS $$
DECLARE
    v_prediction RECORD;
    v_current_popularity INTEGER;
    v_points_earned INTEGER;
BEGIN
    -- Buscar previsões expiradas e pendentes
    FOR v_prediction IN
        SELECT 
            mp.id,
            mp.user_id,
            mp.prediction_track_id,
            mp.initial_popularity,
            mp.target_popularity,
            mp.points_bet,
            mp.prediction_confidence,
            mp.prediction_type,
            pt.track_title,
            pt.spotify_id
        FROM music_predictions mp
        JOIN prediction_tracks pt ON mp.prediction_track_id = pt.id
        WHERE mp.status = 'pending'
        AND mp.predicted_viral_date < CURRENT_DATE
    LOOP
        -- Buscar popularidade atual do Spotify (aqui seria ideal fazer uma chamada à API)
        -- Por enquanto, vamos usar a popularidade da tabela prediction_tracks
        SELECT popularity INTO v_current_popularity
        FROM prediction_tracks
        WHERE id = v_prediction.prediction_track_id;
        
        -- Calcular pontos ganhos
        v_points_earned := calculate_prediction_points(
            v_prediction.prediction_type,
            v_prediction.initial_popularity,
            v_prediction.target_popularity,
            v_current_popularity,
            v_prediction.points_bet,
            v_prediction.prediction_confidence
        );
        
        -- Atualizar previsão
        UPDATE music_predictions
        SET 
            status = CASE 
                WHEN v_points_earned > 0 THEN 'won'
                ELSE 'lost'
            END,
            final_popularity = v_current_popularity,
            points_earned = v_points_earned
        WHERE id = v_prediction.id;
        
        -- Se ganhou pontos, creditar ao usuário
        IF v_points_earned > 0 THEN
            PERFORM credit_user_points(
                v_prediction.user_id,
                v_points_earned,
                'Previsão correta: ' || v_prediction.track_title,
                v_prediction.id
            );
        END IF;
        
        -- Retornar resultado
        prediction_id := v_prediction.id;
        track_title := v_prediction.track_title;
        status_result := CASE 
            WHEN v_points_earned > 0 THEN 'won'
            ELSE 'lost'
        END;
        points_result := v_points_earned;
        
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 10. Adicionar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_music_predictions_type 
ON public.music_predictions(prediction_type);

-- 11. Comentários finais
COMMENT ON TABLE public.music_predictions IS 'Tabela de previsões musicais - Sistema simplificado com previsões de aumento ou diminuição de popularidade';
