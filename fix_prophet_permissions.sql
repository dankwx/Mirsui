-- Correção de permissões para permitir visualização pública das previsões
-- Data: 2025-11-19
-- Problema: Previsões não estão sendo carregadas devido a políticas RLS muito restritivas

-- ============================================
-- 1. ATUALIZAR POLÍTICAS RLS
-- ============================================

-- Remover política antiga que só permitia ver próprias previsões
DROP POLICY IF EXISTS "Users can view own predictions" ON music_predictions_v2;

-- Nova política: qualquer um pode ver previsões de qualquer usuário
CREATE POLICY "Anyone can view predictions" 
    ON music_predictions_v2 
    FOR SELECT 
    USING (true);

-- Manter política de criar: apenas suas próprias
DROP POLICY IF EXISTS "Users can create own predictions" ON music_predictions_v2;
CREATE POLICY "Users can create own predictions" 
    ON music_predictions_v2 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Manter política de update (sistema)
DROP POLICY IF EXISTS "System can update predictions" ON music_predictions_v2;
CREATE POLICY "System can update predictions" 
    ON music_predictions_v2 
    FOR UPDATE 
    USING (true);

-- ============================================
-- 2. ATUALIZAR PERMISSÕES GRANT
-- ============================================

-- Permitir acesso anônimo às functions RPC
GRANT EXECUTE ON FUNCTION get_user_predictions_v2(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_prediction_stats_v2(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION process_expired_predictions_v2() TO authenticated;

-- Permitir leitura da tabela para todos
GRANT SELECT ON music_predictions_v2 TO anon, authenticated;
GRANT SELECT ON prediction_tracks TO anon, authenticated;

-- Apenas authenticated pode inserir
GRANT INSERT ON music_predictions_v2 TO authenticated;

-- ============================================
-- 3. VERIFICAÇÃO
-- ============================================

-- Verificar as políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'music_predictions_v2';

-- Verificar as permissões
SELECT grantee, table_name, privilege_type 
FROM information_schema.table_privileges 
WHERE table_name = 'music_predictions_v2';

COMMENT ON POLICY "Anyone can view predictions" ON music_predictions_v2 IS 'Permite visualização pública das previsões para transparência e competição social';
