# Migração para a VPS — Vercel e Supabase saem, a Oracle assume tudo

**Status:** em execução. **Fases 0 a 3 concluídas** — o Supabase self-hosted está
de pé na VPS em `https://db.mirsui.com`, com o banco restaurado, mandando e-mail
em português e com os quatro caminhos de auth testados. **Nada em produção foi
tocado:** o site segue na Vercel apontando para a nuvem. **A próxima é a fase
4** (o Next na máquina), que não depende de mais ninguém. Um item continua
bloqueado por fora: os 12 arquivos do Storage, por HTTP 402 na origem. O §13 é o
registro do que foi feito — inclusive o trigger de `auth.users` que o dump não
levou e que só apareceu porque a fase 3 testou um cadastro de verdade.
**Escopo:** frontend Next.js, backend Fastify e banco Supabase, os três na
mesma VPS Oracle Ampere A1 (4 vCPU / 24 GB / Ubuntu).
**Verificado na máquina em 3 de setembro de 2026.** A primeira versão deste
documento foi escrita sem olhar a VPS e errou cinco coisas — portas, servidor
web, firewall, disco e, o pior, o hostname. O §4.1 lista o que existe lá de
verdade, e é ele que manda.
**Motivo:** as quatro cotas do plano gratuito estouraram. O site está fora do
ar há cerca de uma semana e a data de reset não está sob nosso controle.
**Documento irmão:** `REVISITAR.md`. Este plano encerra boa parte dele — ver §11.
**Decisão adjacente:** o Supabase continua sendo Supabase, self-hosted. Não é
migração para Postgres puro. O §3 explica por que essa distinção é o documento
inteiro.

---

## 1. O que este documento decide

Uma coisa: **onde o Mirsui roda.** A resposta é "na VPS que já existe, inteiro".

O que ele *não* decide: nada sobre produto, features ou o conteúdo das páginas.
As otimizações pendentes do `REVISITAR.md` continuam pendentes — o §11 diz
quais deixam de importar e quais sobrevivem.

---

## 2. O estado que forçou isto

Medições de 24 a 26 de agosto de 2026, todas registradas no `REVISITAR.md`:

| cota | limite | onde estava |
|---|---|---|
| Egress do Supabase | 5 GB/mês | 11,9 GB — prazo encurtado para 28/08 |
| Edge Requests (Vercel) | 1 M/mês | ~72 a 150 mil/dia = 2 a 4,5 M/mês |
| Edge Middleware | — | estourado |
| Fast Origin Transfer | 10 GB/mês | teto em ~200 mil visitas de faixa/mês |

A causa principal foi corrigida (`7307d90`, `a9689dd`, `63e5556`, `a7345bc`) e
a queda é real: 1.206.890 → 121.415 → ~72.000 requisições/dia em três dias.
**Não adiantou.** O contador de egress é cumulativo do ciclo e não anda para
trás, e o Edge Request é imune a cache — o §2 do `REVISITAR.md` já provou que a
borda conta toda requisição, HIT ou MISS.

E o volume que resta é robô: distribuição plana nas 24 horas, 1,03 acesso por
id distinto. O §7 do `REVISITAR.md` concluiu que o conserto é **firewall, não
código**. Na Vercel isso é plano pago. Na Cloudflare é grátis, e é a fase 5
deste documento.

### O tamanho real do que vai se mover

Medido em 3 de setembro de 2026, direto do banco de produção:

```
banco                40 MB      17 tabelas, 46 funções, 36 políticas RLS
  observed_tracks              18.164 linhas    12 MB
  track_popularity_history     42.894 linhas   8,7 MB
  (as outras 15 tabelas somam menos de 1 MB)
usuários             15         1 identidade Google, 14 e-mail/senha
storage              5,2 MB     2 buckets, 12 objetos
pg_cron              0 jobs     os crons são node-cron no backend
realtime             não usado
edge functions       não usadas
```

**O acervo inteiro são 45 MB e 15 pessoas.** A migração de dados é um
`pg_dump`. A dificuldade toda está em outro lugar, e é o §3.

---

## 3. A distinção que define o trabalho: Supabase ≠ Postgres

O que o Mirsui consome do Supabase **não é o Postgres**. É:

- **PostgREST** — a API REST que todo `supabase-js` chama. São 43 `.from()` e
  8 `.rpc()` espalhados por 42 arquivos.
- **GoTrue** — auth. `signInWithOAuth` (Google), `verifyOtp`,
  `exchangeCodeForSession`, `resetPasswordForEmail`, `setSession`, `signOut`,
  mais a sessão em cookie do `@supabase/ssr` e o `middleware.ts` inteiro.
- **Storage** — os 12 objetos de avatar, fechados na `016_storage_fechado.sql`.
- **As 36 políticas RLS**, que dependem de `auth.uid()` — um claim do JWT que o
  GoTrue emite e o PostgREST injeta na conexão. Sem os dois, RLS não tem o que
  ler.

> **A regra deste documento:** trocar o Supabase por Postgres puro obrigaria a
> reescrever essas quatro coisas. As 36 políticas RLS virariam `if` em
> TypeScript, em 42 arquivos — que é exatamente como nasce o bug que a
> `016_storage_fechado.sql` teve que consertar, só que multiplicado por 36.
> **Não é uma migração de banco. É uma reescrita de autorização.** Está
> descartado.

O Supabase é open source e as mesmas peças rodam em Docker Compose. Rodando
elas na VPS, **nenhuma linha da aplicação muda** — trocam-se as variáveis de
ambiente e pronto. É o único caminho considerado aqui.

---

## 4. Como fica no final

```
                            Internet
                               │
                      ┌────────▼────────┐
                      │   Cloudflare    │  DNS · cache · Bot Fight · rate limit
                      └────────┬────────┘
                               │ :443
┌──────────────────────────────▼───────────────────────────────────┐
│  VPS Oracle Ampere A1 — 4 vCPU / 23 GB / Ubuntu 24.04 / aarch64  │
│                                                                  │
│   ┌──────────── nginx (JÁ EXISTE, :80/:443) ───────────┐         │
│   │  api.mirsui.com  →  127.0.0.1:3000   Fastify  ◄ já │         │
│   │  www.mirsui.com  →  127.0.0.1:3002   Next     ◄ novo│        │
│   │  db.mirsui.com   →  127.0.0.1:54321  Envoy    ◄ novo│        │
│   └──────┬──────────────────────────┬────────────────────┘       │
│          │                          │                            │
│   ┌──────▼────────────┐   ┌─────────▼───────────────────────┐    │
│   │  Next.js  :3002   │   │  Supabase — Docker Compose      │    │
│   │  next start       │   │    envoy    :54321  gateway     │    │
│   │  systemd (novo)   │   │    rest     PostgREST           │    │
│   └──────┬────────────┘   │    auth     GoTrue              │    │
│          │                │    storage  storage-api         │    │
│   ┌──────▼────────────┐   │    meta     postgres-meta       │    │
│   │  Fastify  :3000   │   │    studio   127.0.0.1:54323     │    │
│   │  node-cron        │   │    db       127.0.0.1:5432      │    │
│   │  systemd (a criar)│   └─────────▲───────────────────────┘    │
│   └──────┬────────────┘             │                            │
│          └──────────────────────────┘                            │
│                    loopback — egress zero                        │
│                                                                  │
│  ao lado, já rodando: portainer · uptime-kuma · paperless · n8n  │
│  freshrss · beszel · filebrowser · minecraft · prospector · ...  │
└──────────────────────────────────────────────────────────────────┘
```

### 4.1 O que já existe na máquina — e o que isso corrige

Levantado por SSH em 3 de setembro de 2026. **A VPS não é uma máquina
dedicada:** é um homelab com uns doze serviços rodando. Isso muda cinco coisas
que a primeira versão deste documento tinha errado:

| o documento dizia | a máquina diz | consequência |
|---|---|---|
| `api.mirsui.com` → Kong | **`api.mirsui.com` já é o Fastify**, com cert do Certbot em `/etc/nginx/sites-enabled/mirsui-api` | **o erro grave.** Seguir o plano original derrubaria o backend. O Supabase vai para `db.mirsui.com`. |
| Next na 3001 | 3001 é o **uptime-kuma** | Next vai para a **3002** |
| Kong na 8000 | 8000 é o **portainer**, e o gateway padrão do Supabase **nem é mais Kong — é Envoy** | o gateway vai para a **54321** |
| Caddy para TLS | **nginx** já está na 80/443 com Certbot | não se instala Caddy. Vira um `sites-enabled` novo. |
| `iptables` | **firewalld** | as regras são `firewall-cmd`, não `iptables` |
| disco ~47 GB | **192 GB, 107 GB livres** (56 GB já em Docker) | folga maior que a estimada |

Verificado livre para uso: **3002, 3003, 5432, 54321, 54322, 54323.**
Já instalado e na versão certa: **Docker 29.1.3**, **Compose 2.40.3**,
**Node v20.20.2**, `sudo` sem senha.

> **Um achado que não é sobre migração, e é o mais urgente deles.** O backend
> roda sob **pm2** (`mirsui-backend`, modo cluster, 8 dias de uptime, 18
> reinícios), e não como processo solto — o pm2 o levanta de volta quando ele
> cai. Mas **`pm2-ubuntu` não existe no systemd**, e é essa unit que o
> `pm2 startup` cria para ressuscitar o pm2 no boot. Existe um
> `~/.pm2/dump.pm2` de 25 de julho, então o `pm2 save` já rodou uma vez; o que
> nunca rodou foi o `pm2 startup`.
>
> **Resultado: o backend sobrevive a um crash, mas não a um reboot.** O
> conserto são dois comandos na fase 4 — e os 18 reinícios em 8 dias são um
> segundo assunto, que merece uma olhada nos logs depois que a poeira baixar.

### 4.2 Consumo previsto

Com base no pior dia medido (~67 mil respostas dinâmicas/dia = 0,78 req/s,
plana nas 24h, sem pico):

| | consumo | disponível hoje |
|---|---|---|
| CPU | Next ~2% de 1 core · Supabase ocioso ~5% · Fastify ~1% | 4 vCPU |
| RAM | Next ~350 MB · Supabase ~2–4 GB · Fastify ~150 MB | 19 GB livres de 23 |
| disco | ~900 MB do Next · ~2–3 GB de imagens · 45 MB de dados | 107 GB livres |
| egress | ~100 GB/mês | 10 TB/mês |

Sobra folga para 50 a 100× o tráfego atual antes de a CPU aparecer no gráfico.
**Mesmo dividindo a máquina com doze serviços, ela está superdimensionada para
este projeto** — mas ver o §9 sobre o que "dividir a máquina" custa em risco.

---

## 5. O que muda e o que não muda

Esta é a tabela que evita metade das dúvidas durante a execução.

| | muda? |
|---|---|
| `supabase-js` / `@supabase/ssr` | **não.** Mesma biblioteca, mesmo servidor do outro lado. |
| As 43 `.from()` e 8 `.rpc()` | **não.** Nenhuma. |
| As 36 políticas RLS | **não.** Vão no dump e continuam valendo. |
| As 46 funções e 31 migrations | **não.** Vão no dump. |
| `middleware.ts` | **não.** |
| Variáveis de ambiente | **sim, todas as de Supabase.** Ver §7. |
| URL do Storage no `next.config.mjs` | **sim.** `tqprioqqitimssshcrcr.supabase.co` → seu domínio. |
| Redirect URI do Google OAuth | **sim.** No Google Cloud Console. |
| Envio de e-mail | **sim.** Passa a exigir SMTP próprio. Ver fase 3. |
| Backup | **sim, e é o item de maior risco.** Ver §8. |
| Deploy | **sim.** `git push` deixa de deployar. Vira systemd + build na máquina. |

---

## 6. As fases

A ordem é desenhada para que **nada nas fases 1 a 4 derrube o que está no ar**.
O site só muda de casa na fase 6, e até lá tudo é reversível fechando o
terminal.

### Fase 0 — as verificações que evitam retrabalho

Fazer **antes** de escrever qualquer arquivo. São cinco, e cada uma é do tipo
que só aparece quando já custou uma tarde:

1. **Arquitetura ARM.** A Always Free 4vCPU/24GB é Ampere A1, ou seja
   `aarch64` — não `x86_64`. A maioria das imagens do Supabase publica
   `linux/arm64`, mas **confirme antes**, uma a uma:

   ```bash
   docker manifest inspect supabase/postgres:15.8.1.060 | grep -c arm64
   ```

   O container de analytics (`supabase/logflare`) é o suspeito histórico. Ele
   **não é necessário** para o Mirsui — se não tiver ARM, remova o serviço do
   compose junto com o `vector`, em vez de tentar consertar.

2. **~~Conflito de porta em 3000~~ — resolvido, e era pior do que eu escrevi.**
   As três portas do plano original estavam ocupadas. O mapa final está no §4.1
   e é este:

   ```
   3000   Fastify        já rodando, não encostar
   3001   uptime-kuma    ocupada por outro serviço
   3002   Next.js        ← livre, é a nossa
   8000   portainer      ocupada por outro serviço
   54321  Envoy (gateway) ← livre, é a nossa
   5432   Postgres       ← livre, e SÓ em 127.0.0.1
   54323  Studio         ← livre, e SÓ em 127.0.0.1
   ```

   Antes de subir o compose, sobrescrever `API_GW_HTTP_PORT=54321` no `.env` —
   o padrão do Supabase colidiria com portainer e com o próprio Fastify.
   (`KONG_HTTP_PORT` também existe no `.env.example`, mas só vale se o gateway
   for trocado para Kong; ver a nota do gateway na fase 1.)

3. **~~Node na versão certa~~ — já está.** `v20.20.2` na máquina, e o Docker
   (29.1.3) e o Compose (2.40.3) também. Nada a instalar — só o
   `postgresql-client-16`, que a fase 2 precisa e não vinha na imagem.

4. **Não copiar `node_modules` do Windows.** São 435 MB compilados para
   x86 e vão quebrar no ARM (`sharp`, entre outros). Clonar do git e
   `npm ci` na máquina. A arquitetura está **confirmada como `aarch64`**, então
   o item 1 acima não é hipótese: é obrigatório.

5. **~~Firewall é `iptables`~~ — é `firewalld`.** As regras se escrevem com
   `firewall-cmd`, e a segunda camada continua valendo: a Security List / NSG no
   painel da Oracle. As portas novas (3002, 54321, 5432, 54323) **não devem ser
   abertas em nenhuma das duas** — todas ficam atrás do nginx ou em loopback.

### Fase 1 — subir a stack Supabase, com o site ainda na nuvem

```bash
git clone --depth 1 --filter=blob:none --sparse https://github.com/supabase/supabase /tmp/sb-src
cd /tmp/sb-src && git sparse-checkout set docker
cp -r /tmp/sb-src/docker/. /opt/mirsui-db && cd /opt/mirsui-db
cp .env.example .env
```

Gerar segredos próprios (`POSTGRES_PASSWORD`, `JWT_SECRET`, e as chaves
`ANON_KEY` / `SERVICE_ROLE_KEY` assinadas com esse `JWT_SECRET`; a versão atual
também pede `SECRET_KEY_BASE`, `VAULT_ENC_KEY`, `REALTIME_DB_ENC_KEY` e
`PG_META_CRYPTO_KEY`), depois:

```bash
docker compose -f docker-compose.yml -f docker-compose.pg15.yml -p mirsui-db up -d
docker compose -p mirsui-db ps        # todos "healthy" antes de seguir
```

> **O `-f docker-compose.pg15.yml` não é opcional.** O compose atual sobe
> **Postgres 17** por padrão (`supabase/postgres:17.6.1.136`), e o dump é de um
> **15.8**. O override fixa `supabase/postgres:15.8.1.085` — praticamente a
> mesma versão da nuvem. Restaurar 15.8 em 15.8 tira toda a categoria de erro
> de catálogo da mesa. A subida para 17 é um passo separado, depois, com o
> `utils/upgrade-pg17.sh` que vem no próprio repo.

> **O gateway mudou.** O padrão hoje é **Envoy** (`envoyproxy/envoy:v1.39.0`),
> não Kong. Kong virou override opcional (`sh run.sh config add kong`). Para o
> Mirsui tanto faz — o que atravessa ali é PostgREST, GoTrue e Storage do mesmo
> jeito —, então fica o padrão.

**Neste momento nada em produção mudou.** O site continua apontando para a
nuvem.

### Fase 2 — restaurar os 45 MB

> **Antes de tudo: a connection string direta NÃO funciona a partir da VPS.**
> Medido em 3 de setembro de 2026.
>
> ```
> db.tqprioqqitimssshcrcr.supabase.co → 2600:1f18:16e0:2802:...   (só IPv6)
> VPS: ip -6 addr show scope global   → nenhum endereço global
> resultado: Network is unreachable
> ```
>
> O Supabase aposentou o IPv4 na conexão direta, e a VPS da Oracle não tem IPv6
> configurado. **Use a string do Session Pooler**, que é IPv4:
> Dashboard → Connect → *Session pooler*, na forma
> `postgresql://postgres.<ref>:<senha>@aws-0-<região>.pooler.supabase.com:5432/postgres`.
>
> **A porta importa e é o erro fácil:** `5432` no pooler é modo *session* e
> serve para `pg_dump`. A `6543` é modo *transaction* e **não serve** — o dump
> falha no meio, com erro obscuro sobre prepared statements.

Além disso, `pg_dump` não está instalado na VPS. O servidor é **PostgreSQL
15.8**, então o cliente precisa ser 15 ou mais novo — o `postgresql-client-16`
do Ubuntu 24.04 serve:

```bash
sudo apt install -y postgresql-client-16
```

E o container do Supabase tem que ser da **linha 15**, para o restore não bater
em incompatibilidade de catálogo.

Dump da nuvem, com os schemas gerenciados de fora — é a pegadinha clássica, e
sem ela o restore falha em `pgsodium` e `supabase_vault`:

```bash
# a partir da VPS, com a string do SESSION POOLER
pg_dump "$SUPABASE_DB_URL" \
  --exclude-schema='pgsodium|vault|graphql|graphql_public|extensions|_realtime|supabase_functions' \
  --no-owner --no-privileges \
  -f mirsui.sql

# os usuários vão à parte: auth.users e auth.identities carregam os hashes
pg_dump "$SUPABASE_DB_URL" --data-only \
  -t 'auth.users' -t 'auth.identities' -f auth.sql
```

Restaurar no container, conferir, e **só então** os 12 objetos do Storage —
5,2 MB, dá para baixar e resubir pela API ou pela CLI.

> **Confira antes de comemorar:** `select count(*) from auth.users` tem que dar
> 15, e `select count(*) from pg_policies where schemaname='public'` tem que dar
> 36. Se as políticas não vieram, o banco está aberto — não siga.

### Fase 3 — SMTP, OAuth e um login de teste

Os três itens que quebram silenciosamente e só aparecem quando um usuário real
tenta entrar:

1. **SMTP.** O GoTrue self-hosted não manda e-mail nenhum sozinho. Sem isso,
   `resetPasswordForEmail` e os dois `verifyOtp` param. Resend, Postmark ou SES
   — o plano grátis de qualquer um sobra para 15 usuários. Preencher as
   `SMTP_*` no `.env` do compose.
2. **Google OAuth.** Registrar o redirect URI novo
   (`https://db.mirsui.com/auth/v1/callback`) no Google Cloud Console, ao lado
   do antigo. Manter os dois durante a transição.
   *(Este parágrafo dizia `api.mirsui.com`, resquício da versão do documento
   que ainda achava que o Supabase iria para lá. O §4.1 já corrigiu: `api` é o
   Fastify, o Supabase é `db`.)*
3. **Testar de verdade:** criar conta com e-mail, receber a confirmação, entrar
   com Google, pedir troca de senha. Os quatro caminhos, antes de virar o DNS.

### Fase 4 — Next na máquina, e o systemd que falta no backend

O backend **já está lá** em `/home/ubuntu/mirsui-backend`, rodando na 3000 sob
pm2. O que falta é o front — e o gancho de boot do pm2 (§4.1).

1. Clonar o frontend, `npm ci`, `npm run build`, servir na **3002**.
2. Ativar `output: 'standalone'` no `next.config.mjs`: os 435 MB de
   `node_modules` viram algo entre 80 e 150 MB no que roda em produção.
3. **Subir o front no mesmo pm2**, não em systemd — a máquina já tem um
   gerenciador de processos, e ter dois é como se perde o rastro de quem
   levanta o quê:
   ```bash
   pm2 start npm --name mirsui-web -- start
   ```
4. **Consertar o boot**, que é o achado do §4.1 e vale por si só:
   ```bash
   pm2 startup    # imprime um comando com sudo; rode o que ele mandar
   pm2 save       # congela mirsui-backend + mirsui-web no dump.pm2
   ```
5. Testar por `curl` em `127.0.0.1:3002` antes de tocar no nginx.

> **Confirme o passo 4 de verdade.** `systemctl is-enabled pm2-ubuntu` tem que
> responder `enabled`. Enquanto responder `not-found`, um reboot da Oracle
> derruba o site inteiro e ninguém é avisado — que é a situação de hoje.

### Fase 5 — nginx e Cloudflare

**Não se instala Caddy.** O nginx já está na 80/443 com Certbot, e
`api.mirsui.com` já é um `sites-enabled` funcionando. O trabalho é acrescentar
dois arquivos no mesmo padrão do `mirsui-api` existente:

```
mirsui-web   server_name www.mirsui.com  →  proxy_pass http://localhost:3002
mirsui-db    server_name db.mirsui.com   →  proxy_pass http://localhost:54321
```

Depois `certbot --nginx -d www.mirsui.com -d db.mirsui.com`, e
`nginx -t && systemctl reload nginx`.

Cloudflare na frente com:

- proxy ligado (nuvem laranja) em `www` e `db`
- **Bot Fight Mode e uma regra de rate limit** — este é o item que o §7 do
  `REVISITAR.md` pediu e que na Vercel era plano pago. É a razão de a
  Cloudflare não ser opcional aqui.
- cache agressivo em `/_next/static/*`

> **A pegadinha do Certbot com Cloudflare.** Com o proxy laranja ligado, a
> renovação por HTTP-01 passa a atravessar a Cloudflare e pode falhar
> silenciosamente — o certificado só quebra 90 dias depois, quando ninguém está
> olhando. Ou se usa `--preferred-challenges dns`, ou se troca por um Origin
> Certificate da Cloudflare (validade de 15 anos), ou se deixa a nuvem cinza
> nos registros até a renovação estar resolvida. Decidir isto na hora, não
> depois.

**Aproveitar para consertar o §5.3 do `REVISITAR.md`:** decidir de uma vez se o
canônico é o apex ou o `www`, e fazer o outro redirecionar. Hoje todo canonical
do site aponta para uma URL que redireciona.

### Fase 6 — virar o DNS

Baixar o TTL para 300s um dia antes. Virar. Acompanhar por uma hora.

### Fase 7 — deixar a rede de segurança montada

**Não apagar o projeto Supabase na nuvem por duas semanas.** Ele é o rollback
do §10, e o custo de mantê-lo parado é zero.

---

## 7. O mapa de variáveis de ambiente

### Frontend (`.env.local` → `.env.production` na VPS)

| variável | antes | depois |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://tqprioqqitimssshcrcr.supabase.co` | `https://db.mirsui.com` — **não `api.`**, que já é o Fastify |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | JWT do projeto na nuvem | JWT novo, assinado com o seu `JWT_SECRET` |
| `BACKEND_URL` | — | `http://127.0.0.1:3000` |
| `NEXT_PUBLIC_SITE_URL` | — | `https://www.mirsui.com` — resolve o §5.3 |
| `PORT` | — | `3002` (a 3001 é do uptime-kuma) |
| as de PostHog / Spotify / YouTube | — | iguais |

### Backend (`.env` em `/home/ubuntu/mirsui-backend/.env`)

| variável | depois |
|---|---|
| `SUPABASE_URL` | `http://127.0.0.1:54321` — loopback, não passa pelo nginx |
| `SUPABASE_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | as novas |
| `FRONTEND_URL` | `https://www.mirsui.com` |
| `PORT` | `3000` — **não mudar**, o nginx do `mirsui-api` já aponta para lá |

> **Uma armadilha para não recriar.** Existe um fallback
> `NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET` em quatro lugares do código, entre eles
> `utils/spotifyService.ts:114`. Ele **não** está no `.env.local` de hoje, e é
> assim que tem que continuar: `NEXT_PUBLIC_` vai para o bundle do navegador.
> Ao recriar o ambiente na VPS, use só `SPOTIFY_CLIENT_SECRET`.

---

## 8. Backup — a seção que não é opcional

**Este é o único item deste plano que pode matar o projeto.**

O plano grátis do Supabase faz backup diário. Self-hosted não faz nenhum até
você mandar. Uma VPS sem backup é como projetos de fim de semana morrem: não
por tráfego, por um `DROP` errado numa terça-feira.

Para 40 MB isso é um cron noturno:

```bash
#!/usr/bin/env bash
set -euo pipefail
STAMP=$(date +%F)
docker compose -f /opt/mirsui-db/docker-compose.yml exec -T db \
  pg_dump -U postgres postgres | gzip > "/var/backups/mirsui-$STAMP.sql.gz"
# subir para o Object Storage da Oracle (Always Free) ou Backblaze B2
# e apagar local o que tiver mais de 14 dias
find /var/backups -name 'mirsui-*.sql.gz' -mtime +14 -delete
```

Duas regras:

1. **Fora da máquina.** Backup no mesmo disco que o banco não é backup.
2. **Restaurar uma vez, de propósito, antes de precisar.** Backup não testado é
   uma pasta de arquivos com nome bonito.

Isso tem que estar de pé **antes** da fase 6, não depois.

---

## 9. O que você assume junto

Honestidade sobre o preço, porque ele existe:

| item | o que muda |
|---|---|
| Uptime | ninguém mais vai acordar de madrugada por você. Um `Restart=always` no systemd cobre o comum; um kernel panic não. |
| Deploy | `git push` para de deployar. Vira `git pull && npm ci && npm run build && systemctl restart`. Vale virar script na primeira vez que irritar. |
| Segurança | Postgres e Studio **nunca** expostos. Studio só por túnel SSH (`ssh -L 54323:localhost:54323 ubuntu`). A superfície de auth passa a ser sua. |
| Atualizações | as imagens do Supabase e o Ubuntu passam a precisar de `apt upgrade` e bump de tag periódicos. |
| Reclamação de instância ociosa | a Oracle recupera instâncias Always Free ociosas. Esta máquina roda uns doze serviços — não vai disparar. |

### O risco novo: a máquina é compartilhada

Este é o item que só apareceu depois de olhar a VPS, e ele não estava na
primeira versão deste documento.

A máquina não é um servidor dedicado do Mirsui. Rodam ali, hoje: portainer,
uptime-kuma, paperless, n8n, freshrss, beszel, filebrowser, um painel de
Minecraft, o prospector, uma wiki, um gerador de documentos e um servidor de
e-mail. **O raio de dano de um erro deixou de ser "o Mirsui cai".**

Três consequências práticas:

1. **Nada de `docker system prune -a`.** São 56 GB de imagens que não são suas.
   O comando é rotina em máquina dedicada e catástrofe aqui.
2. **`nginx -t` antes de todo `reload`.** Um `sites-enabled` quebrado derruba
   os seis sites, não só o novo.
3. **O Supabase sobe com nome de projeto próprio** (`-p mirsui-db`) e em
   `/opt/mirsui-db`, para que nenhum `docker compose down` de outro serviço o
   alcance por engano.

Nada disso é proibitivo para um projeto deste tamanho. Mas é trabalho que hoje
alguém faz por você de graça, e vale entrar sabendo.

---

## 10. Rollback

Enquanto o projeto na nuvem existir (fase 7), voltar atrás é:

1. Reverter as variáveis do §7 para as chaves da nuvem
2. `systemctl restart` no front
3. Se o DNS já virou, apontar de volta na Cloudflare

Tempo real: minutos. **A janela de risco não é a migração — é o intervalo entre
virar o DNS e apagar o projeto antigo.** Por isso a fase 7 manda esperar duas
semanas, e por isso os dados novos escritos depois da fase 6 são o único
detalhe que o rollback não resolve sozinho.

---

## 11. O que isto encerra do `REVISITAR.md`

Com banco e aplicação na mesma máquina, o egress do Supabase vira **tráfego de
loopback**. Não "menor" — inexistente. E a descoberta central do §1.1 daquele
documento cai junto:

> *"O PostgREST responde com 1.012 bytes de cabeçalho em toda requisição...
> **89% do egress do projeto era protocolo, não conteúdo.**"*

Protocolo em loopback custa zero. Logo:

| item do `REVISITAR.md` | depois desta migração |
|---|---|
| §1.1 — a regra de contar requisições | **morre.** Não há mais cota por requisição. |
| §4 — os 10 KB do 308 | **morre** no lado banco; o lado Vercel morre com a Vercel. |
| §4.1 — o degrau do id do Deezer | **morre** como custo. Continua como decisão de produto. |
| §5.1 — as 5.000 linhas da contagem de gênero | **morre.** |
| §5.2 — `pessoasCacheadas` sem `.limit()` | **morre** como custo. Continua feio. |
| §5.3 — o canonical que redireciona | **resolvido na fase 5.** |
| §7 — "firewall, não código" | **resolvido na fase 5**, e de graça. |
| §3 — a página de faixa sem cache | **sobrevive**, mas vira só CPU sua. Deixa de ter teto. |
| §5.4 — não existe sitemap | **sobrevive inteiro.** Continua valendo. |
| §6 — o mistério do `unstable_cache` | **vale re-medir.** Numa máquina só, o Data Cache é `.next/cache` em disco real e persistente, não um cache distribuído por região. É a primeira condição em que ele tem chance de funcionar — e a regra do §6 continua valendo: **meça antes de confiar.** |

### Um refinamento para depois, não para agora

O `NEXT_PUBLIC_SUPABASE_URL` é lido por quatro fábricas de cliente:

- `utils/supabase/client.ts` — navegador. **Precisa** da URL pública.
- `utils/supabase/public.ts` e `utils/supabase/server.ts` — servidor. Poderiam
  usar `http://kong:8000` direto, cortando TLS, Caddy e Cloudflare do caminho.

São dois arquivos e uma variável nova. Ganha latência de render, não cota — o
egress já é zero de qualquer jeito. **Por isso fica para depois:** não é o tipo
de coisa que se mexe na mesma semana em que o site muda de casa.

---

## 12. Checklist

```
Fase 0  [x] imagens confirmadas em arm64 — TODAS as 11, nenhuma removida
        [x] aarch64 confirmado · Docker 29.1.3 · Compose 2.40.3 · Node v20.20.2
        [x] portas livres confirmadas: 3002 · 54321 · 5432 · 54323
        [x] postgresql-client-16 instalado (16.15, servidor é 15.8)
        [ ] API_GW_HTTP_PORT=54321 e STUDIO_PORT=54323 no .env do compose
        [ ] firewall: NÃO abrir as portas novas (firewalld + NSG da Oracle)

Fase 1  [x] /opt/mirsui-db criado · fonte clonada (self-hosted/v0.8.0)
        [x] .env com segredos próprios gerados via setup.sh
        [x] portas e URLs ajustadas (54321 / db.mirsui.com / www.mirsui.com)
        [x] compose de pé com -p mirsui-db e -f docker-compose.pg15.yml
        [x] os 11 serviços healthy
        [x] bindings só em 127.0.0.1 — nada exposto na rede

Fase 2  [x] conexão pelo Session Pooler validada (a direta é IPv6, não serve)
        [x] dump tirado e conferido
        [x] dump restaurado no container
        [x] auth.users = 15 no destino
        [x] pg_policies (public) = 36 no destino
        [x] grants do schema public aplicados (o dump saiu sem eles)
        [x] PostgREST e GoTrue respondendo, contagens batendo com a origem
        [!] 12 objetos do Storage — BLOQUEADO por HTTP 402 na origem (§13)
        [ ] reescrever as 17 URLs que apontam para o host da nuvem (§13)

Fase 3  [x] SMTP configurado (Resend, smtp.resend.com:465) e envio provado —
            recovery_sent_at gravado, zero erro no GoTrue
        [x] redirect URI do Google registrado no Console e no GoTrue
            (/auth/v1/settings responde "google":true)
        [x] phone signup+autoconfirm desligados (vinham true no .env.example)
        [x] vhost mirsui-db no nginx, respondendo por Host header
        [x] mirsui.com verificado no Resend, remetente = noreply@mirsui.com
        [x] trigger on_auth_user_created recriado — o dump não levou (§13)
        [x] policy de select de storage.objects recriada, mesmo motivo
        [x] registro A de db.mirsui.com na Hostinger
        [x] certbot --nginx -d db.mirsui.com — vale até 03/12/2026
        [x] cadastro por e-mail: 200, e-mail enviado, profile criado (16=16)
        [x] confirmação: link seguido, confirmed_at gravado, sessão emitida
        [x] troca de senha: link seguido, sessão com type=recovery
        [x] login Google: chega na tela real, sem redirect_uri_mismatch
        [x] login por senha: token emitido (exercita os hashes migrados)
        [x] templates em português, servidos pelo nginx
        [x] usuário de teste apagado — de volta a 15/15/15

Fase 4  [ ] Next buildado e servindo na 3002
        [ ] mirsui-web.service criado e habilitado
        [ ] mirsui-backend.service criado (hoje é processo solto — não
            sobrevive a reboot) e o processo antigo morto ANTES
        [ ] curl 127.0.0.1:3002 respondendo

Fase 5  [x] sites-enabled mirsui-db (db→54321) — adiantado na fase 3, que
            não tinha como testar OAuth sem ele
        [ ] sites-enabled mirsui-web (www→3002)
        [x] nginx -t ANTES do reload — há 6 sites na máquina (agora 7)
        [x] certbot para db (o de www fica para quando o Next subir)
        [ ] certbot para www
        [ ] decidido como o Certbot renova com a Cloudflare na frente —
            o de db já está emitido e renova sozinho ENQUANTO o DNS for
            direto; pôr a Cloudflare na frente mexe nisso
        [ ] Cloudflare proxy + Bot Fight + rate limit
        [ ] canonical do §5.3 decidido

BACKUP  [ ] cron noturno de pg_dump rodando
        [ ] destino FORA da máquina
        [ ] um restore testado de verdade

Fase 6  [ ] TTL baixado 24h antes
        [ ] DNS virado
        [ ] uma hora de acompanhamento

Fase 7  [ ] projeto na nuvem parado, NÃO apagado
        [ ] apagar só depois de 2 semanas limpas
```

---

## 13. Registro de execução

Log do que foi realmente feito, em ordem. Serve para retomar de onde parou sem
reconstruir o raciocínio, e para saber o que já não precisa ser refeito.

### 3 de setembro de 2026 — fase 0 completa, dump tirado e conferido

**Estado ao parar:** nada em produção foi tocado. O site continua apontando
para o Supabase na nuvem. Nenhum container do Supabase subiu ainda.

#### Fase 0 — concluída

| verificação | resultado |
|---|---|
| Arquitetura | `aarch64` confirmado |
| Imagens em ARM64 | **todas as 11 têm arm64.** A preocupação com `logflare`/`vector` era obsoleta: eles não estão mais no compose padrão, foram para o `docker-compose.logs.yml` opcional |
| Ferramentas | Docker 29.1.3 · Compose 2.40.3 · Node v20.20.2 — nada a instalar |
| Portas livres | 3002 · 3003 · 5432 · 54321 · 54322 · 54323 (a 8100 estava ocupada) |
| `postgresql-client-16` | instalado — 16.15, contra servidor 15.8 |
| Servidor de origem | **PostgreSQL 15.8** em aarch64 |

#### Fase 1 — iniciada, não concluída

- `/opt/mirsui-db` criado, vazio, dono `ubuntu`
- fonte do Supabase clonada em `/tmp/sb-src` (sparse checkout só do `docker/`)
- **nada subiu.** O `.env` não foi escrito e nenhum container foi criado

#### Fase 2 — metade feita: o dump

A conexão direta **não funciona** e isso está documentado na fase 2: o host
`db.<ref>.supabase.co` só resolve para IPv6 e a VPS não tem IPv6. A string do
**Session Pooler** (`aws-0-us-east-1.pooler.supabase.com:5432`) funciona e foi
validada:

```
postgres | postgres | PostgreSQL 15.8
```

Arquivos gerados em `/home/ubuntu/mirsui-dump/`:

| arquivo | tamanho | conteúdo |
|---|---|---|
| `public.sql` | 9,3 MB | schema `public` inteiro — tabelas, funções, RLS, índices |
| `auth.sql` | 20 KB | `auth.users` + `auth.identities`, só dados |
| `storage_meta.sql` | 7,4 KB | `storage.buckets` + `storage.objects`, só dados |

**Conferência do dump — bate exatamente com o banco de origem:**

```
CREATE TABLE     17   (esperado 17)
CREATE FUNCTION  46   (esperado 46)
CREATE POLICY    36   (esperado 36)
CREATE INDEX     34
ENABLE RLS       17   (todas as tabelas)
usuários         15   (esperado 15)
objetos storage  12   (esperado 12)
```

> A credencial do pooler está em `/home/ubuntu/.mirsui-dump.env`, modo `600`,
> dono `ubuntu`. **A senha do banco circulou em texto claro durante o
> planejamento — trocar no painel do Supabase quando a migração terminar.** O
> projeto na nuvem vira descartável de qualquer forma.

#### O que ainda falta baixar

Os 12 arquivos do Storage (5,2 MB) **não foram baixados** — só os metadados.
Eles saem pela API do Storage ou pela CLI, e é a primeira coisa da retomada,
junto com a fase 1.

#### Correções que esta execução trouxe ao documento

1. O gateway padrão **não é mais Kong, é Envoy**. A variável de porta é
   `API_GW_HTTP_PORT`, não `KONG_HTTP_PORT`.
2. O compose sobe **Postgres 17** por padrão. Como o dump é 15.8, passou a ser
   obrigatório o `-f docker-compose.pg15.yml`, que fixa `15.8.1.085`.
3. O backend roda em **pm2**, não como processo solto — mas sem
   `pm2 startup`, então a conclusão sobre reboot continua valendo. O conserto
   virou `pm2 startup` + `pm2 save` em vez de units de systemd, e o front vai
   para o mesmo pm2.
4. A conexão direta ao Supabase é IPv6-only e a VPS não tem IPv6. **Session
   Pooler na porta 5432**, nunca a 6543.

### 3 de setembro de 2026, mais tarde — fases 1 e 2 concluídas

**Estado ao parar:** o Supabase self-hosted está de pé na VPS com o banco
inteiro restaurado e conferido. **Produção continua intocada** — o site segue
apontando para a nuvem, o nginx não foi alterado, nenhum DNS mudou.

#### Fase 1 — concluída

Os segredos foram gerados pelo `setup.sh` oficial do próprio repo, não à mão —
ele produz também as chaves assimétricas novas (`JWT_KEYS`, `JWT_JWKS`,
`SUPABASE_PUBLISHABLE_KEY`) que a versão atual usa ao lado das legadas.

```
/opt/mirsui-db          ref=self-hosted/v0.8.0
11 serviços             todos healthy
db                      supabase/postgres:15.8.1.085  (override pg15 ativo)
bindings no host        127.0.0.1:54321 · 127.0.0.1:5432 · 127.0.0.1:6543
```

O `docker-compose.mirsui.yml` (nosso, três linhas) usa a tag `!override` para
forçar o supavisor a escutar só em loopback — sem ele o Compose **soma** as
portas em vez de substituir, e o banco acabaria em `0.0.0.0:5432`.

`API_GW_HTTP_PORT=127.0.0.1:54321` funciona porque a variável é interpolada
direto na string de porta do compose. Já `POSTGRES_PORT` **não** aceita esse
truque: ela também compõe as URLs internas (`db:${POSTGRES_PORT}`), e pôr um IP
ali quebraria a conexão de todos os serviços. Daí o override.

#### Fase 2 — concluída, menos o Storage

Verificação no destino, contra a origem:

```
tabelas          17  = 17        observed_tracks           18.164 = 18.164
funções          46  = 46        track_popularity_history  42.894 = 42.894
políticas RLS    36  = 36        tracks                        46 = 46
usuários         15  = 15        profiles                      15
identidades      15  = 15        buckets                        2 = 2
```

E o teste que importa mais que as contagens — a stack respondendo de verdade:

```
GET /rest/v1/observed_tracks?select=isrc&limit=2   http=200, dados reais
GET /auth/v1/health                                 http=200, GoTrue v2.189.0
```

#### Três pedras no caminho, e como cada uma foi resolvida

**1. `\restrict` — o dump de um pg_dump 16 não roda num psql 15.**
O `pg_dump` 16.15 emite `\restrict <token>` e `\unrestrict <token>`,
meta-comandos que o `psql` 15.8 do container não conhece. Com
`ON_ERROR_STOP=1` o restore aborta na quinta linha.

Removê-los com `sed` é mais chato do que parece: `/^\restrict/d` faz o sed
interpretar `\r` como *carriage return*. O que funcionou foi montar a barra
pelo código do caractere, sem backslash nenhum na expressão:

```bash
awk 'BEGIN{b=sprintf("%c",92)} index($0, b "restrict")!=1 && index($0, b "unrestrict")!=1'
```

**2. `CREATE SCHEMA public` colide.** O dump traz a criação do schema e o
Supabase novo já o tem. Duas linhas removidas (a criação e o `COMMENT ON
SCHEMA`) e o restore passou limpo.

**3. Os grants não vinham no dump — e sem eles nada funcionaria.**
O `pg_dump` rodou com `--no-privileges`, então nenhum `GRANT` veio junto.
Políticas RLS não são privilégios: as 36 chegaram, mas sem `GRANT` o PostgREST
responderia *permission denied* para `anon` e `authenticated` em tudo. Os
grants padrão do Supabase foram aplicados depois do restore, mais os
`ALTER DEFAULT PRIVILEGES` para as tabelas futuras. **O RLS continua sendo
quem protege as linhas** — o grant só abre a porta para a política decidir.

---

### O que ficou bloqueado, e não é por nossa causa

#### Os 12 arquivos do Storage — HTTP 402 na origem

```
GET /storage/v1/object/public/user-profile-images/default.jpg   →  402
{"message":"Service for this project is restricted due to the following
 violations: exceed_egress_quota. The project owner must upgrade their plan
 or remove spend caps to restore service."}
```

Testado com a chave `service_role` também: **402 igual.** O bloqueio é do
projeto, não da rota, e nenhuma credencial passa por cima dele.

Vale registrar por que o banco saiu e o Storage não: **a restrição atinge a API
HTTP, não a conexão Postgres.** Por isso o `pg_dump` pelo pooler funcionou
enquanto o `curl` no Storage não. As duas coisas estavam "fora do ar" de
maneiras diferentes.

O que se perde, se nunca for recuperado: **5 fotos de perfil, 4 capas de
playlist e o `default.jpg`.** Os buckets foram recriados com a configuração
certa (públicos, 5 MB, mesmos mime types), então é só conteúdo que falta.

Três saídas, em ordem de preferência:

1. **Esperar a cota virar** e rodar `/tmp/migra-storage.sh`, que já está pronto
   na VPS e faz download-e-upload dos 12 de uma vez.
2. **Tirar o spend cap por um dia** no painel do Supabase, rodar o script,
   recolocar. É a saída rápida se houver pressa.
3. **Aceitar a perda.** Ninguém fica sem site: o `default.jpg` pode ser
   resubido de qualquer imagem, e quem tinha foto volta a ter quando trocar.

> **Enquanto isso, os metadados NÃO foram restaurados de propósito.**
> `storage.objects` está em 0 e é assim que tem que ficar. Restaurar as 12
> linhas sem os arquivos criaria referências para objetos inexistentes — o
> Storage responderia 200 com nada. O upload pela API cria as linhas sozinho,
> que é como o script foi escrito.
>
> (Havia também drift de schema: o `storage.buckets` da nuvem tem
> `versioning_status`, o self-hosted v1.60.4 não. Mais um motivo para os
> buckets terem sido recriados por `INSERT` em vez de restaurados.)

#### As 17 URLs que apontam para o host morto

```
profiles.avatar_url      14 linhas com supabase.co
playlists.thumbnail_url   3 linhas com supabase.co
```

Elas vieram no dump apontando para
`https://tqprioqqitimssshcrcr.supabase.co/storage/v1/...`, que deixa de existir
quando o projeto for apagado. **Não reescrever ainda** — enquanto os arquivos
não estiverem no destino, reescrever só troca um link quebrado por outro. Fica
para o mesmo momento em que o Storage for resolvido:

```sql
UPDATE profiles  SET avatar_url    = replace(avatar_url,
  'https://tqprioqqitimssshcrcr.supabase.co', 'https://db.mirsui.com')
  WHERE avatar_url LIKE '%supabase.co%';
UPDATE playlists SET thumbnail_url = replace(thumbnail_url,
  'https://tqprioqqitimssshcrcr.supabase.co', 'https://db.mirsui.com')
  WHERE thumbnail_url LIKE '%supabase.co%';
```

Lembrar de tirar `tqprioqqitimssshcrcr.supabase.co` do
`next.config.mjs` e pôr `db.mirsui.com` no lugar, senão o `<Image>` do Next
recusa o domínio novo em runtime.

---

### 4 de setembro de 2026 — fase 3: SMTP e OAuth ligados, testes travados no DNS

**Estado ao parar:** o GoTrue self-hosted manda e-mail de verdade e aceita
login com Google. **Produção continua intocada** — `www.mirsui.com` segue na
Vercel apontando para a nuvem, e `api.mirsui.com` não foi alterado (conferido
por `curl` depois do reload do nginx: 200).

O que sobra da fase 3 **não é trabalho de máquina, é registro de DNS.** Os dois
que faltam estão no fim desta seção.

#### O que foi configurado

| item | onde | valor |
|---|---|---|
| SMTP | `.env` do compose | `smtp.resend.com:465`, usuário `resend`, senha = API key |
| remetente | `SMTP_ADMIN_EMAIL` | `onboarding@resend.dev` — **provisório**, ver abaixo |
| Google OAuth | `docker-compose.mirsui.yml` | `GOTRUE_EXTERNAL_GOOGLE_*`, redirect `https://db.mirsui.com/auth/v1/callback` |
| `db.mirsui.com` | `/etc/nginx/sites-enabled/mirsui-db` | novo vhost → `127.0.0.1:54321`, só HTTP por enquanto |

As variáveis do Google foram para o **`docker-compose.mirsui.yml`**, não para o
`docker-compose.yml` oficial onde elas existem comentadas. Motivo: o `update.sh`
sobrescreve o arquivo oficial e levaria a configuração junto. O override também
ganhou `GOTRUE_MAILER_EXTERNAL_HOSTS=db.mirsui.com`, senão o GoTrue registra um
aviso a cada request que chega pelo nginx.

Backups antes de mexer: `.env.pre-fase3` e `docker-compose.mirsui.yml.pre-fase3`,
ambos em `/opt/mirsui-db`, modo `600`.

#### Uma porta que estava aberta e não devia

O `.env.example` do Supabase vem com `ENABLE_PHONE_SIGNUP=true` **e**
`ENABLE_PHONE_AUTOCONFIRM=true`. Juntas, sem provedor de SMS configurado, elas
criam contas com telefone e as confirmam sozinhas — cadastro sem verificação
nenhuma, num caminho que o frontend do Mirsui nem usa. Ambas foram para `false`.
O `/auth/v1/settings` agora responde `"phone":false`.

#### O que os testes provaram

```
GET  /auth/v1/settings                       "google":true, "phone":false
GET  /auth/v1/authorize?provider=google      302 → accounts.google.com
                                             redirect_uri = db.mirsui.com/auth/v1/callback
POST /auth/v1/recover  (usuário real)        200, recovery_sent_at gravado, zero erro de SMTP
```

O `recover` é a prova de que o SMTP funciona: o GoTrue só grava
`recovery_sent_at` **depois** que o envio volta sem erro. E o mesmo caminho pelo
nginx (`Host: db.mirsui.com` em `127.0.0.1:80`) devolveu 200 no `/auth/v1/health`
e no `/rest/v1/`, com o 302 do Google idêntico — o vhost novo está certo.

#### O teste que falhou, e por que a falha é a informação útil

Cadastro com um e-mail novo devolveu **500**, e o log diz exatamente o motivo:

```
gomail: could not send email 1: 550 You can only send testing emails to your
own email address (danielkondlatsch.p@gmail.com). To send emails to other
recipients, please verify a domain at resend.com/domains
```

Ou seja: **o encanamento está inteiro** — o GoTrue abriu TLS na 465, autenticou
no Resend e entregou a mensagem; quem recusou foi o Resend, na regra do
remetente de sandbox. Enquanto `mirsui.com` não estiver verificado lá,
`onboarding@resend.dev` só entrega para o dono da conta.

Isso tem uma consequência que vale dizer em voz alta: **com
`ENABLE_EMAIL_AUTOCONFIRM=false`, um cadastro que não consegue mandar o e-mail
responde 500 e não cria a conta.** Não é degradação suave — é cadastro morto
para todo mundo. Não virar o DNS antes de o domínio estar verificado.

(O usuário de teste não deixou sujeira: o GoTrue desfaz a transação quando o
envio falha. `auth.users`, `auth.identities` e `profiles` seguem em 15.)

#### A pedra do dia: o nome do projeto no Compose

O `docker-compose.yml` do Supabase traz `name: supabase` no topo, mas a stack
subiu como **`mirsui-db`**. Um `docker compose up -d auth` sem `-p` cria um
projeto *novo* chamado `supabase`, e ele tenta subir uma segunda stack por cima
— aborta no conflito de nome do container, mas antes disso já criou a rede
`supabase_default` e o volume `supabase_db-config` órfãos. Foram removidos, e a
lição fica:

```bash
cd /opt/mirsui-db && sudo docker compose -p mirsui-db up -d <serviço>
#                                        ^^^^^^^^^^^^^^ nunca omitir
```

(O `COMPOSE_FILE` no `.env` já resolve os três `-f`; o `-p` é que não tem
atalho.)

#### Um detalhe do nginx que não existia na máquina

O vhost usa `$connection_upgrade` para o websocket do Realtime, e o `map` que
define essa variável não existia em lugar nenhum. Foi criado em
`/etc/nginx/conf.d/connection-upgrade.conf`. O `mirsui-api` escapa disso porque
manda `Connection: upgrade` fixo em toda request — funciona, mas é o jeito
errado, e não valia replicar.

O vhost também sobe `client_max_body_size` para 50m (o padrão de 1 MB cortaria
os avatares de 5 MB) e **não expõe o Studio de propósito** — ele não tem
autenticação própria nesta versão e continua só em `127.0.0.1:54323`, por túnel
SSH.

#### Sobre os segredos

O client secret do Google e a API key do Resend estão em `/opt/mirsui-db/.env`,
modo `600`, dono `ubuntu`. **Os dois circularam em texto claro durante o
planejamento**, igual à senha do banco — a mesma nota do dia anterior vale aqui:
rotacionar quando a migração terminar. A chave do Resend é `restricted` (só
envio), o que limita o estrago, mas não zera.

---

### 4 de setembro, mais tarde — o Resend liberou, e apareceu o buraco do dump

`mirsui.com` foi verificado no Resend. Confirmado do jeito que importa: um envio
de `noreply@mirsui.com` para um endereço que **não** é o dono da conta passou —
era exatamente essa a regra que derrubava o cadastro. `SMTP_ADMIN_EMAIL` trocado
de `onboarding@resend.dev` para `noreply@mirsui.com`.

O cadastro que respondia 500 passou a responder 200, com
`confirmation_sent_at` gravado. E foi aí que a conta não fechou.

#### `auth.users` = 16, `profiles` = 15

O trigger `on_auth_user_created` **não existia no banco migrado.**

**Um trigger pertence ao schema da tabela, não ao da função.** O dump da fase 2
saiu com `--schema=public` mais os dados de `auth.users`, então
`public.handle_new_user` veio inteira — e o gatilho que a chama, que morava em
`auth`, não. A função ficou órfã, e órfã não dispara.

A varredura fechou o escopo em vez de deixar dúvida: das seis funções de trigger
em `public`, `handle_new_user` era a única com zero gatilhos ligados. As outras
cinco (`update_updated_at_column`, `calculate_user_rating`,
`log_track_popularity`, `profile_comments_set_updated_at`,
`update_track_comment_updated_at`) estavam todas conectadas.

**O que custaria se passasse:** toda conta criada depois da virada de DNS
nasceria sem linha em `profiles`, e sem erro visível em lugar nenhum — o
`signUp` responde 201, o e-mail de confirmação chega, o usuário confirma, e cai
num site que não acha o perfil dele. O `019_painel_do_dono.sql` já tinha
enxergado essa possibilidade de longe ("uma conta sem linha em profiles é...");
aqui ela deixaria de ser hipótese.

#### O mesmo buraco, no Storage

Pela mesma razão, `storage.objects` estava com **RLS ligado e zero policies** —
a policy de select do `016_storage_fechado.sql` mora no schema `storage` e não
veio no dump. Isso falha *fechado*, não aberto: ninguém vaza nada. Mas é o outro
lado do 016, e precisa existir para o dia em que um bucket privado for criado.

Os buckets em si estavam certos (públicos, 5 MB, mesmos MIME) — a fase 2 os
recriou por `INSERT`, e é por isso que só as policies faltavam.

#### A causa raiz das duas é a mesma

**Nem o trigger nem as policies do Storage estavam em migration.** As duas foram
criadas pelo painel do Supabase, e painel não vai para o git. O conserto virou
`032_o_que_o_dump_nao_levou.sql` no repo do backend, aplicado na VPS e conferido:
novo cadastro fecha **16 = 16**, com `username`, `display_name` e `avatar_url`
todos preenchidos pelo trigger.

As três policies de escrita do `playlist-thumbnails` que o 016 preservou **não
voltaram, de propósito.** O gerenciador de playlists saiu do frontend na limpeza
do legado e hoje não existe uma única chamada de `.upload()` ou `storage.from()`
no cliente — o avatar sobe por `POST /profiles/:id/avatar`, com service role,
que ignora RLS. Recriar policy de escrita para um caminho que ninguém usa só
aumenta a superfície.

> **Fica um usuário de teste no banco:** `danielkondlatsch.p+fase3@gmail.com`,
> não confirmado, `username = teste_fase3_tmp`. Ele foi deixado de propósito —
> o e-mail de confirmação dele já está na caixa de entrada e serve para testar o
> link assim que `db.mirsui.com` resolver. **Apagar depois:**
> `delete from auth.users where email like '%+fase3%'` (o cascade leva o
> profile junto).

---

### 4 de setembro, fim do dia — **fase 3 concluída**

O registro A entrou na Hostinger e `db.mirsui.com` passou a resolver. O resto
saiu em sequência.

#### TLS

```bash
sudo certbot --nginx -d db.mirsui.com --non-interactive --redirect --agree-tos
```

Certificado emitido, válido até 3 de dezembro de 2026, renovação automática já
agendada pelo próprio Certbot. O `--redirect` pôs o 301 de HTTP para HTTPS.
`nginx -t` limpo e `api.mirsui.com` conferido em 200 depois do reload — os
outros seis sites da máquina não sentiram nada.

#### Os quatro caminhos

| caminho | como foi testado | resultado |
|---|---|---|
| cadastro por e-mail | `POST /signup` | 200, e-mail enviado, profile criado (16 = 16) |
| confirmação | `admin/generate_link` type=signup, link seguido | 303, `confirmed_at` preenchido, sessão emitida |
| troca de senha | `admin/generate_link` type=recovery, link seguido | 303 com `type=recovery`, sessão emitida |
| login com Google | `authorize` seguido até o fim | chega na tela real de login do Google |

O `generate_link` foi usado de propósito no lugar de abrir a caixa de entrada:
ele devolve **o mesmo link que vai no e-mail**, então dá para segui-lo com
`curl` e ver o 303 e a sessão saindo. Testa o servidor, não o cliente de e-mail.

Duas conferências que valem mais que o 200:

- O `redirect_to=https://www.mirsui.com/auth/confirm` — o que o `ModalLogin`
  manda de verdade — **passa** na allowlist `ADDITIONAL_REDIRECT_URLS`. Se não
  passasse, o GoTrue devolveria o usuário para a raiz e a página de trocar senha
  nunca abriria.
- No Google, a URL final traz `app_domain=https://db.mirsui.com` e **nenhum
  `redirect_uri_mismatch`**. O único passo que sobra é alguém digitar a senha,
  que é a parte que nenhum `curl` faz.

Também foi testado o **login por senha** (`grant_type=password`): token emitido.
Isso exercita o mesmo código que valida os hashes bcrypt dos 14 usuários
migrados. E `auth.identities` segue com as 15 linhas, a do `google` inclusive,
com `provider_id` preenchido — é por ele que o GoTrue reconhece quem volta.

#### Os e-mails voltaram a falar português

O GoTrue sai com os templates padrão em inglês, e os do painel da nuvem se
perderam com o acesso. Foram escritos quatro novos —
`docs/email-templates/` no repo do frontend.

O detalhe que decide o desenho: **`MAILER_TEMPLATES_*` recebe URL, não HTML.**
O nginx serve a pasta em `https://db.mirsui.com/email-templates/`, então
**editar um arquivo troca o e-mail sem reiniciar container** — só o `rsync`.
Não há segredo nos arquivos, é HTML com placeholder.

Os assuntos são texto puro e ficam no `.env`. O compose oficial não expõe nem os
assuntos nem os templates, então as oito variáveis vieram pelo
`docker-compose.mirsui.yml`, junto com as do Google.

> **A cópia é nova, não é restauração.** Ninguém sabe o que os originais diziam.
> Está curta de propósito — um parágrafo, um botão, o link em texto embaixo — e
> é para ser editada quando você tiver opinião.

Um `POST /recover` real depois disso: 200, `template cache worker started` no
log, zero erro, `recovery_sent_at` gravado.

#### Estado ao fechar a fase

```
11 containers          healthy
nginx                  7 sites, config ok, api.mirsui.com 200
db.mirsui.com          auth 200 · rest 200 · templates 200 · http→https 301
studio                 sem resposta de fora (só 127.0.0.1:54323)
dados                  15 usuários · 15 profiles · 15 identidades
policies               36 em public · 1 em storage
triggers em auth.users 1
```

O usuário de teste foi apagado. **Produção continua na Vercel apontando para a
nuvem** — nada aqui virou DNS de site.

---

### Retomada — a próxima sessão começa aqui

**A fase 3 acabou. O próximo passo é a fase 4**, e ela não depende de mais
ninguém:

```
[ ] clonar o frontend na VPS, npm ci, output:'standalone', build
[ ] pm2 start npm --name mirsui-web -- start   (porta 3002)
[ ] pm2 startup + pm2 save — o conserto do §4.1, que vale por si só:
    hoje `systemctl is-enabled pm2-ubuntu` responde not-found, e um reboot
    da Oracle derruba o backend sem avisar ninguém
[ ] curl 127.0.0.1:3002 antes de tocar no nginx
```

Antes de virar o DNS (fase 6), três coisas continuam pendentes e nenhuma delas
é da fase 4:

```
[ ] Storage: rodar /tmp/migra-storage.sh quando a cota da nuvem virar
[ ] URLs: os dois UPDATE do §13 + tirar tqprioqqitimssshcrcr do next.config.mjs
[ ] BACKUP: o §8 inteiro. Hoje o banco novo não tem backup nenhum, e é o
    item de maior risco do documento.
```

> **E o que já dava para fazer hoje:** rotacionar a senha do banco na nuvem, o
> client secret do Google e a API key do Resend. Os três circularam em texto
> claro durante o planejamento.
