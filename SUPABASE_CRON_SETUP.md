# 🕒 Configurar Cron Job no Supabase

## ✅ Passo a Passo

### 1️⃣ **Executar o SQL de Migração**

Primeiro, execute o arquivo `migration_prophet_v2_clean.sql` no Supabase SQL Editor para criar:
- Tabela `music_predictions_v2`
- Função `process_expired_predictions_v2()`
- Outras funções auxiliares

### 2️⃣ **Criar Cron Job no Supabase**

No painel do Supabase:

1. Vá em **Database** → **Cron Jobs** (ou **Extensions** → **pg_cron**)
2. Clique em **"Create a new cron job"**
3. Preencha:

#### 📝 **Configurações:**

**Name:** `process_predictions_daily`

**Schedule:** `5 0 * * *`  
(Ou use o botão: **"Every night at midnight"** e ajuste para 00:05)

**Type:** `Database function`

**Function:** Selecione `process_expired_predictions_v2`

**Timezone:** `America/Sao_Paulo` (ou GMT-3)

---

## 📋 Função a ser chamada

```sql
process_expired_predictions_v2()
```

Esta função:
- ✅ Busca previsões com `status = 'pending'` e `predicted_date <= hoje`
- ✅ Busca a popularidade atual da track
- ✅ Calcula se ganhou ou perdeu
- ✅ Atualiza o status da previsão
- ✅ Credita pontos ao usuário (se ganhou)
- ✅ Retorna log de resultados

---

## ⏰ Quando vai executar?

**Todo dia às 00:05** (horário de Brasília)

Cron expression: `5 0 * * *`
- `5` = minuto 5
- `0` = hora 0 (meia-noite)
- `* * *` = todo dia, todo mês, qualquer dia da semana

---

## 🧪 Testar Manualmente

Para testar antes de esperar a meia-noite, execute no SQL Editor:

```sql
SELECT * FROM process_expired_predictions_v2();
```

Isso vai processar todas as previsões expiradas imediatamente.

---

## 📊 Ver Logs do Cron

Após criar o cron job:

```sql
-- Ver execuções do cron
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'process_predictions_daily')
ORDER BY start_time DESC 
LIMIT 10;
```

---

## ⚠️ Importante

- A função **NÃO** precisa ser executada via backend
- O Supabase executa automaticamente na hora agendada
- Você pode remover o código de cron do `backend.ts` se quiser (é opcional agora)
- A função já credita pontos automaticamente usando `credit_user_points()`

---

## 🎯 Checklist

- [ ] Executar `migration_prophet_v2_clean.sql`
- [ ] Criar cron job no painel do Supabase
- [ ] Testar manualmente: `SELECT * FROM process_expired_predictions_v2();`
- [ ] Verificar se executou: checar logs do cron
- [ ] (Opcional) Remover cron do backend.ts

---

Pronto! Agora o Supabase cuida de tudo automaticamente! 🚀
