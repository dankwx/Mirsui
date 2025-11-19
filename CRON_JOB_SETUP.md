# 🤖 Sistema de Cron Job para Previsões Musicais

## 📋 Visão Geral

O sistema de previsões precisa de um job automatizado para processar previsões expiradas diariamente. Existem 3 opções de implementação:

---

## 🔷 Opção 1: Supabase Edge Functions + Cron (RECOMENDADO)

### Vantagens:
- ✅ Totalmente serverless
- ✅ Integrado com Supabase
- ✅ Não precisa de servidor externo
- ✅ Escala automaticamente

### Como Configurar:

1. **Instalar Supabase CLI:**
```bash
npm install -g supabase
```

2. **Criar Edge Function:**
```bash
supabase functions new process-predictions
```

3. **Arquivo `supabase/functions/process-predictions/index.ts`:**
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Processar previsões expiradas
    const { data, error } = await supabase
      .rpc('process_expired_predictions_v2')
    
    if (error) throw error
    
    console.log(`✅ Processadas ${data?.length || 0} previsões`)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: data?.length || 0,
        results: data 
      }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error('❌ Erro:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
```

4. **Deploy:**
```bash
supabase functions deploy process-predictions
```

5. **Configurar Cron no Supabase Dashboard:**
   - Vá em Database > Extensions
   - Ative `pg_cron`
   - Execute no SQL Editor:

```sql
-- Agendar para rodar todo dia às 00:05
SELECT cron.schedule(
    'process-expired-predictions',
    '5 0 * * *',
    $$
    SELECT net.http_post(
        url:='https://seu-projeto.supabase.co/functions/v1/process-predictions',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer SEU_ANON_KEY"}'::jsonb
    );
    $$
);

-- Ver jobs agendados
SELECT * FROM cron.job;

-- Remover job (se necessário)
-- SELECT cron.unschedule('process-expired-predictions');
```

---

## 🔷 Opção 2: Vercel Cron Jobs

### Vantagens:
- ✅ Fácil de configurar
- ✅ Integrado com deploy
- ✅ Gratuito no plano Pro

### Como Configurar:

1. **Criar rota API `app/api/cron/process-predictions/route.ts`:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
    // Verificar auth do cron
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const supabase = await createClient()
        
        const { data, error } = await supabase
            .rpc('process_expired_predictions_v2')
        
        if (error) throw error
        
        return NextResponse.json({
            success: true,
            processed: data?.length || 0,
            results: data
        })
    } catch (error) {
        console.error('Erro no cron:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
```

2. **Criar `vercel.json` na raiz:**
```json
{
  "crons": [
    {
      "path": "/api/cron/process-predictions",
      "schedule": "5 0 * * *"
    }
  ]
}
```

3. **Adicionar secret no `.env.local`:**
```
CRON_SECRET=seu_secret_super_secreto_aqui
```

4. **Configurar no Vercel:**
   - Settings > Environment Variables
   - Adicionar `CRON_SECRET`

---

## 🔷 Opção 3: GitHub Actions

### Vantagens:
- ✅ Totalmente gratuito
- ✅ Controle total
- ✅ Logs detalhados

### Como Configurar:

1. **Criar `.github/workflows/process-predictions.yml`:**
```yaml
name: Process Expired Predictions

on:
  schedule:
    - cron: '5 0 * * *'  # Todo dia às 00:05 UTC
  workflow_dispatch:  # Permite rodar manualmente

jobs:
  process:
    runs-on: ubuntu-latest
    
    steps:
      - name: Process Predictions
        run: |
          curl -X POST \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://seu-dominio.vercel.app/api/cron/process-predictions
```

2. **Adicionar secret no GitHub:**
   - Settings > Secrets and variables > Actions
   - Adicionar `CRON_SECRET`

---

## 🔷 Opção 4: Node.js Cron (Se você tem servidor próprio)

### Como Configurar:

1. **Instalar dependências:**
```bash
npm install node-cron
```

2. **Criar `scripts/process-predictions.js`:**
```javascript
const cron = require('node-cron')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Rodar todo dia às 00:05
cron.schedule('5 0 * * *', async () => {
  console.log('🔄 Processando previsões expiradas...')
  
  try {
    const { data, error } = await supabase
      .rpc('process_expired_predictions_v2')
    
    if (error) throw error
    
    console.log(`✅ Processadas ${data?.length || 0} previsões`)
    console.log('Resultados:', data)
  } catch (error) {
    console.error('❌ Erro:', error)
  }
})

console.log('⏰ Cron job iniciado - Aguardando execução às 00:05')
```

3. **Rodar:**
```bash
node scripts/process-predictions.js
```

---

## 📊 Monitoramento e Logs

### Ver últimas previsões processadas:
```sql
SELECT 
    id,
    prediction_type,
    status,
    points_earned,
    evaluated_at
FROM music_predictions_v2
WHERE evaluated_at IS NOT NULL
ORDER BY evaluated_at DESC
LIMIT 10;
```

### Ver previsões pendentes:
```sql
SELECT 
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE predicted_date < CURRENT_DATE) as expired
FROM music_predictions_v2
WHERE status = 'pending';
```

### Testar processamento manualmente:
```sql
SELECT * FROM process_expired_predictions_v2();
```

---

## 🎯 Recomendação Final

**Para SoundSage, recomendo: Opção 1 (Supabase Edge Functions + pg_cron)**

Motivos:
1. Totalmente integrado
2. Sem custos adicionais
3. Fácil de manter
4. Logs nativos do Supabase

**Setup rápido:**
```sql
-- Basta executar isso no SQL Editor do Supabase após deploy da edge function:
SELECT cron.schedule(
    'process-expired-predictions',
    '5 0 * * *',
    $$SELECT net.http_post(
        url:='https://seu-projeto.supabase.co/functions/v1/process-predictions',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer SEU_ANON_KEY"}'::jsonb
    )$$
);
```

Pronto! Sistema 100% automatizado! 🚀
