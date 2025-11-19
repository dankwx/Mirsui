-- Teste direto da função RPC para debug
-- Substitua 'SEU_USER_ID' pelo seu user_id real

-- Ver o que a função retorna
SELECT * FROM get_user_predictions_v2('50be58ab-228f-418a-ab43-c2ef21297743');

-- Verificar se há dados na tabela
SELECT 
    mp.id,
    mp.user_id,
    mp.prediction_track_id,
    pt.track_title,
    pt.artist_name,
    mp.status,
    mp.predicted_date
FROM music_predictions_v2 mp
JOIN prediction_tracks pt ON mp.prediction_track_id = pt.id
WHERE mp.user_id = '50be58ab-228f-418a-ab43-c2ef21297743'
ORDER BY mp.created_at DESC;

-- Ver a definição atual da função
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'get_user_predictions_v2';
