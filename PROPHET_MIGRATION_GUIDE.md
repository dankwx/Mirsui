# 🔮 Prophet - Sistema de Previsões Simplificado

## 📋 Resumo das Mudanças

O sistema de previsões do Music Prophet foi completamente redesenhado para ser mais simples e intuitivo. Agora os usuários podem prever se uma música vai **crescer** ou **cair** em popularidade, com recompensas baseadas na diferença entre a popularidade atual e a prevista.

## 🎯 Novas Funcionalidades

### 1. Tipos de Previsão
- **📈 Vai Crescer (Increase)**: Prever que a popularidade da música vai aumentar
- **📉 Vai Cair (Decrease)**: Prever que a popularidade da música vai diminuir (30% de bônus!)

### 2. Sistema de Recompensas Dinâmico
As recompensas agora são calculadas baseadas em múltiplos fatores:

#### Fatores que Aumentam a Recompensa:
- **Diferença de Popularidade**: Quanto maior a diferença prevista, maior a recompensa
  - Multiplicador base: `1.0 + (diferença / 50.0)`
  
- **Nível de Confiança**: Menor confiança = maior recompensa (maior risco)
  - Multiplicador: `2.0 - (confiança / 100.0)`
  - Exemplo: 50% confiança = 1.5x, 10% confiança = 1.9x
  
- **Tipo de Previsão**: Prever queda é mais difícil
  - Decrease: 1.3x (30% bônus)
  - Increase: 1.0x (sem bônus)

#### Fórmula de Cálculo:
```
Pontos Ganhos = Pontos Apostados × Precisão × 
                (1 + Diferença/50) × 
                (2 - Confiança/100) × 
                Bônus Dificuldade
```

### 3. Validações Inteligentes
- Para previsões de crescimento: meta deve ser maior que popularidade atual
- Para previsões de queda: meta deve ser menor que popularidade atual
- Retorno mínimo de 10% se acertar a direção (cresceu ou caiu)

## 🗄️ Mudanças no Banco de Dados

### Novas Colunas na Tabela `music_predictions`:

1. **`prediction_type`** (VARCHAR(20), NOT NULL, DEFAULT 'increase')
   - Valores: 'increase' ou 'decrease'
   - Define o tipo de previsão

2. **`initial_popularity`** (INTEGER)
   - Armazena a popularidade da música no momento da previsão
   - Usado para calcular a diferença real vs esperada

### Funções SQL Adicionadas:

1. **`calculate_prediction_points()`**
   - Calcula pontos ganhos baseado em todos os fatores
   - Retorna 0 se errou a direção da previsão
   - Garante retorno mínimo de 10% se acertou a direção

2. **`process_expired_predictions()`** (atualizada)
   - Agora usa a nova função de cálculo
   - Suporta os novos campos de tipo de previsão

## 📦 Arquivos Modificados

### Frontend:
- ✅ `components/MusicProphet/NewPredictionModal.tsx`
  - Adicionado seletor de tipo de previsão
  - Novo cálculo de recompensa estimada
  - Validações de lógica de previsão

- ✅ `components/MusicProphet/PredictionCard.tsx`
  - Exibição do tipo de previsão (badge colorido)
  - Mostra progressão: inicial → atual → meta
  - Exibe diferença de popularidade

- ✅ `components/MusicProphet/MusicProphetComponent.tsx`
  - Interface atualizada com novos campos

### Backend:
- ✅ `app/api/predictions/route.ts`
  - Validações de tipo de previsão
  - Validações de lógica (meta vs inicial)
  - Salvamento de campos novos

- ✅ `utils/musicProphetService.ts`
  - Interface atualizada com novos campos
  - Suporte ao prediction_type

### Database:
- ✅ `migration_prophet_simplified.sql`
  - Script completo de migração
  - Funções de cálculo de pontos
  - Constraints e índices

## 🚀 Como Aplicar a Migração

### 1. Backup do Banco (IMPORTANTE!)
```sql
-- Fazer backup da tabela antes de migrar
CREATE TABLE music_predictions_backup AS 
SELECT * FROM music_predictions;
```

### 2. Executar a Migração
Execute o arquivo `migration_prophet_simplified.sql` no Supabase SQL Editor:

```bash
# Opção 1: Via Supabase Dashboard
1. Abra o Supabase Dashboard
2. Vá em SQL Editor
3. Cole o conteúdo de migration_prophet_simplified.sql
4. Execute

# Opção 2: Via CLI do Supabase (se configurado)
supabase db push
```

### 3. Verificar a Migração
```sql
-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'music_predictions' 
AND column_name IN ('prediction_type', 'initial_popularity');

-- Verificar se as funções foram criadas
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('calculate_prediction_points', 'process_expired_predictions');
```

### 4. Atualizar Dados Existentes (Opcional)
Se você tem previsões antigas, pode atualizar para o novo sistema:

```sql
-- Definir tipo de previsão baseado na meta vs popularidade atual
UPDATE music_predictions 
SET prediction_type = CASE 
    WHEN target_popularity > current_popularity THEN 'increase'
    ELSE 'decrease'
END
WHERE prediction_type IS NULL;

-- Definir popularidade inicial (usar a atual como referência)
UPDATE music_predictions 
SET initial_popularity = current_popularity
WHERE initial_popularity IS NULL;
```

## 🎮 Como Usar (Fluxo do Usuário)

1. **Escolher Música**: Buscar e selecionar uma música
2. **Escolher Tipo**: Decidir se vai crescer (📈) ou cair (📉)
3. **Definir Meta**: Escolher qual será a popularidade na data alvo
4. **Selecionar Data**: Até quando a previsão deve se realizar
5. **Apostar Pontos**: Definir quantos pontos quer arriscar (10-1000)
6. **Definir Confiança**: Quanto menor, maior a recompensa se acertar!

## 📊 Exemplos de Recompensas

### Exemplo 1: Previsão Conservadora
- **Música**: Popularidade atual 50
- **Tipo**: Crescer
- **Meta**: 60 (+10)
- **Confiança**: 80%
- **Pontos**: 100
- **Recompensa**: ~120 pts (20% lucro)

### Exemplo 2: Previsão Arriscada
- **Música**: Popularidade atual 40
- **Tipo**: Crescer
- **Meta**: 70 (+30)
- **Confiança**: 30%
- **Pontos**: 200
- **Recompensa**: ~612 pts (206% lucro!)

### Exemplo 3: Previsão de Queda (com bônus)
- **Música**: Popularidade atual 80
- **Tipo**: Cair
- **Meta**: 50 (-30)
- **Confiança**: 50%
- **Pontos**: 150
- **Recompensa**: ~585 pts (290% lucro com bônus de 30%!)

## 🔧 Configurações Importantes

### Limites do Sistema:
- **Pontos mínimos por aposta**: 10
- **Pontos máximos por aposta**: 1000
- **Confiança**: 1% - 100%
- **Período máximo**: 1 ano no futuro
- **Retorno mínimo**: 10% dos pontos apostados (se acertar direção)

## 🐛 Troubleshooting

### Erro: "Tipo de previsão inválido"
- Certifique-se que está enviando 'increase' ou 'decrease'

### Erro: "Meta deve ser maior/menor que a atual"
- Verifique se a lógica está correta:
  - Crescer: meta > inicial
  - Cair: meta < inicial

### Previsões antigas não aparecem corretamente
- Execute o script de atualização de dados existentes (seção 4)

## 📝 Notas Técnicas

### Compatibilidade com Versão Anterior:
- O campo `prediction_type` tem default 'increase'
- Previsões antigas continuam funcionando
- É recomendado executar o script de atualização para dados completos

### Performance:
- Adicionado índice em `prediction_type` para queries rápidas
- Função `calculate_prediction_points()` é otimizada para execução em massa

### Segurança:
- Todas as validações são feitas no backend
- Constraints no banco previnem dados inválidos
- Check constraints garantem integridade dos dados

## 🎉 Conclusão

O novo sistema é mais simples, intuitivo e recompensador! Usuários agora podem:
- Fazer previsões mais diversificadas
- Ganhar mais pontos com previsões arriscadas
- Ter bônus por prever quedas (mais difícil)
- Entender melhor o sistema de recompensas

---

**Última atualização**: 14/11/2025
**Versão**: 2.0 - Sistema Simplificado
