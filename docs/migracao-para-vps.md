# Migração para a VPS — Vercel e Supabase saem, a Oracle assume tudo

**Status:** **o site saiu da Vercel em 4 de setembro de 2026.**
`https://www.mirsui.com` é servido pela VPS, atrás da Cloudflare, em cima do
Supabase self-hosted de `https://db.mirsui.com`. **Fases 0 a 6 concluídas.** A
Cloudflare entrou com rate limit e cache rule testados por comportamento, e o
Certbot renova por HTTP-01 atravessando a nuvem laranja com o Bot Fight ligado —
que era o item que o §5 deixava em aberto, agora resolvido por medição e não por
palpite. A fase 6 aconteceu dentro da fase 5, porque a Vercel já respondia 402 e
não havia produção para proteger; a hora de acompanhamento foi feita e está no
§13. **A migração está feita. O que falta é o que a torna segura, e virou o
§14** — as fases 7 a 12, com ordem entre elas. **A fase 8, o backup, está
feita**: cron às 03:30, dois arquivos por dia no `gdrive:mirsui-backup` e um
restore testado de propósito, que foi quem descobriu que o dump precisa sair como
`supabase_admin`. **A fase 9, as imagens, também está feita na parte que se via de fora**: o
avatar quebrado caía no ícone de imagem partida porque o fallback só tratava
URL ausente, não URL morta — corrigido em `d40ddc7`. Falta só o resgate dos
bytes, que depende de a cota da nuvem virar, provavelmente dia 27. O §13 é o registro
do que foi feito — inclusive o trigger de `auth.users` que o dump não levou e que
só apareceu porque a fase 3 testou um cadastro de verdade, e a conferência da
noite de 4/09, que encontrou o repositório partido em dois e o consertou.
**Escopo:** frontend Next.js, backend Fastify e banco Supabase, os três na
mesma VPS Oracle Ampere A1 (4 vCPU / 24 GB / Ubuntu).
**Verificado na máquina em 3 de setembro de 2026.** A primeira versão deste
documento foi escrita sem olhar a VPS e errou cinco coisas — portas, servidor
web, firewall, disco e, o pior, o hostname. O §4.1 lista o que existe lá de
verdade, e é ele que manda.
**Motivo:** as quatro cotas do plano gratuito estouraram. O site ficou fora do
ar por cerca de dez dias — a Vercel respondia 402 `DEPLOYMENT_DISABLED` — e a
data de reset não estava sob nosso controle. **Voltou em 4 de setembro, na
VPS.**
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
   PORT=3002 HOSTNAME=127.0.0.1 pm2 start .next/standalone/server.js --name mirsui-web
   ```
   *(Este passo dizia `pm2 start npm -- start`, e contradizia o passo 2: o
   próprio Next recusa `next start` com `output: 'standalone'`. O §13 tem o
   aviso na íntegra, e as três cópias que o standalone não faz — sem elas o
   site sobe sem CSS, sem JS e sem imagem.)*
4. **Consertar o boot**, que é o achado do §4.1 e vale por si só:
   ```bash
   pm2 startup    # imprime um comando com sudo; rode o que ele mandar
   pm2 save       # congela mirsui-backend + mirsui-web no dump.pm2
   ```
5. Testar por `curl` em `127.0.0.1:3002` antes de tocar no nginx. Não só a
   `/`: uma página dinâmica, um `/_next/static/...`, um arquivo do `public/`
   e um `/_next/image?url=...`. As três últimas são justamente o que quebra
   quando falta uma das cópias do standalone.

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

> **As fases não param na 7.** A execução mostrou que faltava o que a migração
> não previa: backup, imagens, monitoramento, um reboot provado e a rotação dos
> segredos. Isso virou as **fases 8 a 12, no §14**, com a fase 7 relida lá — ela
> ganhou um segundo motivo para não apagar nada.

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
        [x] API_GW_HTTP_PORT=54321 e STUDIO_PORT=54323 no .env do compose
            — fechado na fase 1; o Kong responde em 127.0.0.1:54321
        [x] firewall: as portas novas seguem fechadas — 54321, 5432 e 54323 só
            escutam em loopback, e a 3000 do backend, que escuta em 0.0.0.0,
            não responde de fora (testado em 146.235.44.203:3000)

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

Fase 4  [x] frontend clonado em /home/ubuntu/mirsui-web · npm ci · build
        [x] output:'standalone' ligado — 587 MB de node_modules viram 35 MB
        [x] .env.production escrito, chmod 600, .env.production no .gitignore
        [x] pm2 mirsui-web rodando .next/standalone/server.js, e NÃO
            `npm start`: o Next recusa a combinação (§13)
        [x] deploy.sh — as três cópias que o standalone não faz
        [x] pm2 startup + pm2 save — `systemctl is-enabled pm2-ubuntu`
            responde **enabled**. Era o buraco do §4.1.
        [x] bind em 127.0.0.1:3002, não em 0.0.0.0
        [x] curl 127.0.0.1:3002 respondendo — 5 rotas, static, public,
            otimizador de imagem e uma página que lê o Supabase novo
        [x] nginx NÃO tocado — continua com os mesmos 7 sites
        [x] .env do BACKEND apontado para 127.0.0.1:54321 + chaves novas —
            FALTAVA, e derrubou o login por senha por 8 dias (§13, 11/09)

Fase 5  [x] sites-enabled mirsui-db (db→54321) — adiantado na fase 3, que
            não tinha como testar OAuth sem ele
        [x] sites-enabled mirsui-web (www→3002)
        [x] nginx -t ANTES do reload — 8 sites na máquina agora
        [x] certbot para db (o de www fica para quando o Next subir)
        [x] certbot para www — e para o apex junto, por --expand
        [x] canonical do §5.3 decidido: o www. O apex faz 301, em UM salto
        [x] HSTS de volta, que a Vercel mandava e a troca teria comido
        [x] real_ip da Cloudflare pronto, com script e cron mensal
        [x] SSR do Next falando com o Supabase pelo loopback (/etc/hosts)
        [x] nameservers na Cloudflare, zona importada e CONFERIDA registro
            a registro — a varredura automática perdeu o send.mirsui.com
        [x] SSL/TLS não está em Flexible (testado: sem loop de redirect)
        [x] real_ip acordou — access_log mostra visitante, não Cloudflare
        [x] /_next/static/ cacheando (MISS→HIT), mesmo sem regra
        [x] RESOLVIDO como o Certbot renova com a Cloudflare na frente:
            HTTP-01 atravessa, e atravessa COM O BOT FIGHT LIGADO — o
            --dry-run foi refeito depois de ativá-lo. Sem DNS-01, sem
            plugin, sem token. api e db saíram do proxy e renovam direto.
        [x] CNAME send → send.forge.rmta.net recriado, cinza
        [x] autoconfig e autodiscover para cinza, resolvendo na Hostinger
        [x] api e db para cinza
        [x] "Block training in robots.txt" desligado — o robots.txt voltou
            a ter UM grupo User-agent:*, que é o do app
        [x] Bot Fight Mode ligado — mas ver o §13: não deu para provar que
            ele barra nada. Não conte com ele; a regra de rate limit é que
            faz o trabalho.
        [x] regra de rate limit — dispara na req #55, bloqueia com 429 e
            deixa /_next/ passar (provado COM o IP bloqueado); expira só
        [x] cache rule de /_next/static/ — HIT, e todo o HTML segue
            DYNAMIC, que é o lado perigoso e foi o que se conferiu

BACKUP  [x] cron noturno de pg_dump rodando — 03:30, banco e papéis
        [x] destino FORA da máquina — gdrive:mirsui-backup, por rclone COPY
        [x] um restore testado de verdade — e foi ele que descobriu que o
            dump tem de sair como supabase_admin, não como postgres
        >>> fechado em 4/09 às 19h17. Deixou UM item de decisão: o
            /opt/mirsui-db/.env, com o JWT_SECRET, não está no backup

Fase 6  [x] DNS virado — em 4/09, sem esperar, porque não havia o que
            proteger: a Vercel já respondia 402 nos dois nomes
        [~] TTL: o do www já era 300; o do apex foi de 14400 para 300 na
            mesma edição, então não houve as 24h de antecedência. Ficou
            sem efeito: com a nuvem laranja o rollback nem passa por
            propagação de DNS.
        [x] uma hora de acompanhamento — 1.988 requisições, 1 único 5xx
            (transitório, numa janela de reload), zero 404 do próprio
            site, nenhum reinício de processo, carga em 0,31
        [x] log próprio para o vhost — o access_log era um só para os 8
            sites, e sem isso não há como monitorar nada daqui pra frente

Fase 7  >>> esta fase e as que sobraram ganharam texto e ordem no §14
        [x] projeto na nuvem intacto — está ACTIVE_HEALTHY, nem parado nem
            apagado. No plano grátis parar não economiza nada, e de pé ele
            é um rollback melhor do que parado.
        [ ] apagar só depois de 2 semanas limpas — ou seja, não antes de
            18/09/2026. É um item de NÃO fazer nada; a data é o conteúdo.
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
2. ~~**Tirar o spend cap por um dia** no painel do Supabase, rodar o script,
   recolocar.~~ **Esta saída não existe** — ver a correção logo abaixo.
3. **Aceitar a perda.** Ninguém fica sem site: o `default.jpg` pode ser
   resubido de qualquer imagem, e quem tinha foto volta a ter quando trocar.

> **Correção de 4/09 — a saída 2 era ficção, e foi escrita a partir da
> mensagem de erro em vez da conta.** A org `dankwx's Org` está no **plano
> free**, e spend cap é controle de plano Pro. No free não existe cobrança por
> excedente nenhuma: estourar a cota *restringe* o projeto em vez de faturar —
> o bloqueio **é** a proteção. A frase do 402 (*"must upgrade their plan or
> remove spend caps"*) é texto genérico que a Supabase mostra para todo mundo,
> e só a primeira metade se aplica aqui. Consultado por API, não por palpite.
>
> Sobram duas saídas de verdade: **esperar a cota virar**, que custa zero, ou
> **pagar Pro por um mês** (US$ 25, previsível) e depois fazer downgrade.
>
> **Quando a cota vira.** Não virou em 01/09 — o 402 continuava de pé no dia 4
> —, então o ciclo não é alinhado ao mês civil. Com o projeto criado em
> 27/06/2024, o palpite forte é **dia 27**. Isso é inferência; quem confirma é
> o painel em *Organization → Usage*, que mostra as datas do período. Se for o
> 27, é **depois** da marca de 18/09 da fase 7 — e tudo bem: aquela data é uma
> escolha de "duas semanas limpas", não prazo de terceiro, e a própria fase 7
> registra que manter o projeto de pé no free custa nada.

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

### 4 de setembro, noite — **fase 4 concluída**

O front passou a rodar na máquina. Ele ainda não atende ninguém: escuta só em
`127.0.0.1:3002`, o nginx não sabe que ele existe e o DNS não mudou. A produção
continua na Vercel, apontando para a nuvem. O que mudou é que agora existe uma
cópia funcionando do site inteiro em cima do Supabase novo — e dá para conferir
cada página antes de virar qualquer coisa.

#### Onde ficou

```
/home/ubuntu/mirsui-web                  clone de git@github.com:dankwx/Mirsui.git
/home/ubuntu/mirsui-web/.env.production  13 variáveis, chmod 600
/home/ubuntu/mirsui-web/deploy.sh        o que substitui o `git push`
```

O clone é por SSH e a chave da máquina já autentica como `dankwx` — não foi
preciso configurar nada.

#### A contradição entre os passos 2 e 3 desta fase

O plano mandava ligar `output: 'standalone'` (passo 2) e subir com
`pm2 start npm -- start` (passo 3). **Os dois não convivem**, e quem diz isso é
o próprio Next, na primeira linha do log:

```
⚠ "next start" does not work with "output: standalone" configuration.
  Use "node .next/standalone/server.js" instead.
```

Ele sobe assim mesmo hoje, mas contra um aviso explícito — e no Next 15 isso
vira erro. Ficou o que o Next suporta: o pm2 roda o `server.js` do standalone.
O ganho é o que o passo 2 prometia, e maior:

| | |
|---|---|
| `node_modules` | 587 MB |
| `.next` inteiro | 171 MB |
| **`.next/standalone` — o que de fato roda** | **35 MB** |

#### As três cópias que o standalone não faz, e por isso existe um script

O build standalone **não** copia `public/`, **não** copia `.next/static` e
**não** enxerga o `.env.production` da raiz — ele roda com `cwd` em
`.next/standalone`, e é lá que o Next procura os arquivos de ambiente.

Isso é a pior categoria de pegadinha: **o build passa limpo e o erro só aparece
no navegador**, na forma de um site sem CSS, sem JS e sem imagem. Um deploy
feito de comandos soltos esquece uma dessas três em algum momento, então o
deploy virou `deploy.sh`:

```bash
git pull --rebase && npm ci && npm run build
cp -r public/. .next/standalone/public/
cp -r .next/static .next/standalone/.next/static
cp .env.production .next/standalone/.env.production && chmod 600 ...
pm2 restart mirsui-web --update-env && pm2 save --force
```

Ele foi rodado inteiro de ponta a ponta, não só escrito: 7m42s — dos quais
4m35s são o `npm ci`, o build sozinho leva 57s — e o smoke test depois dele
passou igual. O `--rebase` no `git pull` é de propósito; ver mais abaixo.

O script mora dentro do clone mas fora do repo, listado em `.git/info/exclude`
para não sujar o `git status`.

#### Um buraco no `.gitignore` que já estava lá

`.env*.local` e `.env` estavam ignorados; **`.env.production` não.** É o
arquivo que carrega o client secret do Spotify e a chave do YouTube na VPS.
Entrou no `.gitignore` no mesmo commit do `output: 'standalone'`.

#### O conserto do boot — o achado do §4.1

```bash
sudo env PATH=$PATH:/usr/bin \
  /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save
```

```
systemctl is-enabled pm2-ubuntu         →  enabled      (antes: not-found)
/etc/systemd/system/pm2-ubuntu.service  →  ExecStart=... pm2 resurrect
~/.pm2/dump.pm2                         →  mirsui-backend + mirsui-web
```

Três conferências que o `enabled` sozinho não dá:

- o `dump.pm2` guardou os **args** de cada um — `mirsui-backend` com
  `npm start` e o cwd certo, `mirsui-web` com `PORT=3002` no env. Um dump sem
  args ressuscita um `npm` sem comando.
- o `PATH` da unit resolve `node` e `npm` (os dois em `/usr/bin`). Se o Node
  viesse de nvm, o boot falharia calado.
- `is-active` responde `inactive`, e **isso é esperado**: o daemon do pm2 que
  está no ar hoje foi levantado à mão, não pela unit. No boot é a unit que
  levanta, e aí ela fica ativa.

O único jeito de provar isso por inteiro é reiniciar a máquina — o que
derrubaria o backend em produção por alguns segundos, e não foi feito sem
combinar. Fica como a última conferência antes da fase 6.

#### Uma porta que ficou mais fechada do que estava

O primeiro teste, ainda com `next start`, abriu `*:3002` — todas as interfaces.
O `server.js` do standalone respeita `HOSTNAME`, então ele subiu com
`HOSTNAME=127.0.0.1` e agora escuta só no loopback, que é de onde o nginx vai
falar com ele na fase 5. Mesmo assunto da porta aberta do §13 de ontem.

#### O que respondeu

Tudo por `curl` em `127.0.0.1:3002`, com o nginx ainda sem saber que a 3002
existe:

| | |
|---|---|
| `/` · `/feed` · `/pilha` · `/termos` · `/privacidade` | 200 |
| `/reset-password` · `/robots.txt` · `/auth/check-email` | 200 |
| `/user/coelho` — página dinâmica que lê o Supabase novo | 200, com o nome na página |
| `/api/auth/me` | 200, JSON válido |
| `/_next/static/chunks/webpack-*.js` | 200 — a cópia do `static` entrou |
| `/assets/track-art2.webp` | 200 — a cópia do `public` entrou |
| `/_next/image?url=https://i.scdn.co/...&w=640` | 200 `image/jpeg`, 68 KB |

O otimizador de imagem era o risco real do standalone: ele traça o
`node_modules` e podia deixar o `sharp` de fora. Não deixou.

`db.mirsui.com` está embutido no bundle do cliente, a primeira resposta de `/`
sai em ~280 ms e o processo fica em 139 MB — bem abaixo dos ~350 MB que o §4.2
estimou.

#### Uma confirmação que veio de graça

`tqprioqqitimssshcrcr` ainda aparece no build, mas **só** em
`.next/server/app/index.rsc` e `index.html`, que são a home pré-renderizada. Ou
seja: não sobrou nenhuma referência em *código*; o que sobrou é **dado**,
gravado nas linhas do banco. É exatamente o que os dois `UPDATE` pendentes do
§13 fazem, e agora está provado que são eles e mais nada.

#### O commit não foi para o origin, de propósito

`output: 'standalone'` e o `.gitignore` viraram um commit local, replicado na
VPS por `git format-patch | git am` — os dois lados têm o mesmo patch, byte a
byte. Ele **não foi empurrado** porque hoje um push no `main` ainda dispara um
deploy de produção na Vercel, e isso é fora do escopo da fase 4.

Enquanto ele não sobe, o commit existe só nos dois clones, e é por isso que o
`deploy.sh` usa `git pull --rebase`: o rebase replica o commit local por cima
do que vier, e no dia em que o mesmo patch chegar pelo origin ele percebe que
já está aplicado e o descarta sozinho. Com `--ff-only` o deploy travava.

#### Estado ao fechar a fase

```
pm2          mirsui-backend (8d, cluster) · mirsui-web (fork, 3002)
pm2-ubuntu   enabled no systemd
3002         127.0.0.1 apenas
nginx        7 sites, config ok, api.mirsui.com 200 — nada tocado
disco        99 GB livres (o front custou ~800 MB)
produção     ainda na Vercel, ainda na nuvem
```

---

### 4 de setembro, manhã — **fase 5: o site voltou ao ar, na VPS**

*(a entrada acima é da madrugada deste mesmo dia: o build da fase 4 tem
`Last-Modified` de 04/09 02:06 GMT. Esta aqui é das 09h37 às 10h40, BRT.)*

`https://www.mirsui.com` é servido pela máquina, com certificado próprio. O
Mirsui saiu da Vercel. Falta da fase 5 só a Cloudflare, que é a única parte
dela que não depende desta máquina.

#### A premissa que mudou, e mudou antes de qualquer comando

O plano tratava a virada de DNS como o momento de risco e a reservava para a
fase 6. A primeira medição da sessão desmontou isso:

```
$ curl -sI https://www.mirsui.com/
HTTP/2 402
x-vercel-error: DEPLOYMENT_DISABLED
strict-transport-security: max-age=63072000
```

**No `www` e no apex.** Não havia produção para derrubar: o site estava fora do
ar desde que a cota estourou. Isso não muda o plano — muda o preço de errar.
Apontar o DNS para a VPS deixou de ser um risco a administrar e virou o
conserto. A fase 6 acabou acontecendo dentro da fase 5, sem as 24h de TTL
baixado que ela pedia, e a razão fica registrada aqui para quem reler não achar
que foi pressa: foi um custo de espera que não comprava nada.

Esse mesmo `curl` guardou a segunda informação da sessão, que só ia render mais
adiante: a Vercel mandava HSTS.

#### O vhost, e o que ele tem além do padrão do `mirsui-api`

`/etc/nginx/sites-available/mirsui-web`, `www.mirsui.com` → `127.0.0.1:3002`.
Dois desvios do modelo, os dois com motivo:

| | |
|---|---|
| `proxy_buffer_size 32k` + `proxy_buffers 16 32k` | a home sai com **240 KB** de HTML. Com os buffers padrão (32 KB) o nginx despeja o excedente em arquivo temporário **a cada requisição**. 512 KB seguram a página em memória. |
| `location /_next/static/` com `access_log off` | e **nada de `Cache-Control`**: o Next já responde `max-age=31536000, immutable` ali. Um `add_header` só duplicaria o cabeçalho. |

Antes de recarregar, `nginx -t` — são 8 sites na máquina agora, e um erro de
sintaxe aqui derruba o FreshRSS, o Portainer e o `api.mirsui.com` junto.

#### O canônico é o `www` (§5.3 do REVISITAR)

Decidido pelo que custa menos, não pelo que soa melhor: o `www` já é o que está
indexado, já é o que o `.env.production` carrega em `NEXT_PUBLIC_SITE_URL`, e já
era para onde o apex redirecionava na Vercel. Escolher o apex custaria rebuild e
jogaria fora o que o Google já conhece.

O resultado é o §5.3 fechado de ponta a ponta:

```
<link rel="canonical" href="https://www.mirsui.com"/>   ← o que o site emite
https://www.mirsui.com                                   ← o que serve
```

#### Dois achados que a Cloudflare torna reais, e que o §5 não listava

**1. O nginx vai parar de saber quem é o cliente.** Com a nuvem laranja, todo
`$remote_addr` vira um IP da Cloudflare. Isso estraga o `access_log` e, pior,
estraga o rate limit por IP do GoTrue em `db.mirsui.com`: uma sequência de
logins errados de um usuário passaria a bloquear todo mundo. O conserto é o
módulo `real_ip`, e ele mora em `/usr/local/sbin/cf-realip-update.sh`:

- gera `conf.d/cloudflare-realip.conf` a partir de `cloudflare.com/ips-v4|v6`
- recusa a lista se ela não parecer uma lista de CIDRs
- **só troca o arquivo se `nginx -t` aceitar o resultado**, e reverte se não
- roda todo dia 1º por `/etc/cron.d/cf-realip`

Está inerte enquanto a Cloudflare não entrar: `set_real_ip_from` só reescreve o
IP quando a conexão vem de uma das faixas.

**2. O SSR do Next fala com o Supabase pela URL pública.**
`utils/supabase/server.ts` lê `NEXT_PUBLIC_SUPABASE_URL`, que é
`https://db.mirsui.com` — e não dá para trocar por loopback como o §7 fez no
Fastify, porque a mesma variável vai para o bundle do navegador. Com a
Cloudflare na frente, cada consulta de renderização sairia da máquina para um
PoP e voltaria, **sujeita ao Bot Fight Mode, que não tem como distinguir SSR de
robô.** Entrou uma linha no `/etc/hosts` da VPS:

```
127.0.0.1 db.mirsui.com
```

O TLS continua validando, porque quem atende no loopback é o mesmo nginx com o
mesmo certificado. **O ganho hoje é ~1 ms, não 35** — medido, e vale registrar
por quê: a diferença de 37 ms para 1 ms entre `https://db.mirsui.com` e
`http://127.0.0.1:54321` é quase toda handshake TLS, que é custo de CPU e não de
rede, e continua sendo cobrado no loopback. O motivo de manter a linha é a
Cloudflare, não a latência de hoje.

É o mesmo raciocínio do "refinamento para depois" do §11 — e o §11 dizia para
não mexer nisso na semana em que o site muda de casa. A objeção dele era ao
custo de mexer em **código**: dois arquivos, uma variável nova e um rebuild. Uma
linha no `/etc/hosts` faz o mesmo desvio sem tocar no build e sai com um `sed`.
O refinamento do §11 continua de pé para quem quiser fazer direito.

> **Ao depurar, lembre:** um `curl https://db.mirsui.com` feito **desta máquina**
> não passa mais pelo caminho público. Para testar o caminho público de dentro,
> `--resolve db.mirsui.com:443:146.235.44.203`.

#### A virada, e a armadilha de medir do lugar errado

Os dois registros trocados na Hostinger — o `www` deixou de ser CNAME da Vercel
e virou A; o apex saiu de `216.198.79.1`; os dois com TTL 300. E aí a zona
passou vinte minutos respondendo duas coisas diferentes:

```
ns1.dns-parking.com   → CNAME da Vercel            (consultado DA VPS)
ns2.dns-parking.com   → alternando entre os dois   (consultado DA VPS)
8.8.8.8 · 1.1.1.1 · 9.9.9.9 · OpenDNS  → todos já no IP da VPS
```

Isso é impossível pela ordem natural das coisas: um resolvedor público não pode
ter um dado que o autoritativo não serve. A explicação apareceu num `dig`:

```
ns1.dns-parking.com  →  162.159.24.201     ← faixa da Cloudflare
ns2.dns-parking.com  →  162.159.25.42      ← idem
```

O DNS da Hostinger roda em anycast da Cloudflare, e **a VPS estava batendo num
nó com a zona defasada.** O mundo já via o registro novo; só ela não via. A
lição operacional: numa virada de DNS, **medir de fora da máquina que está sendo
migrada** — a consulta a partir dela é o pior ponto de observação possível,
porque é o único que não representa nenhum usuário.

Acreditar no ponto errado teria custado concreto: emitir com a zona
"inconsistente" gastaria uma das 5 validações por hora do Let's Encrypt. Por
isso a emissão só saiu depois de três rodadas limpas seguidas, e por isso o
`www` foi emitido sozinho primeiro — o apex tinha TTL de 14400 e podia demorar
muito mais, e não valia segurar o HTTPS do site esperando por ele.

#### Os certificados

```
certbot --nginx -d www.mirsui.com                          → emitido
certbot --nginx -d www.mirsui.com -d mirsui.com --expand   → um cert, dois nomes
```

```
subject=CN = www.mirsui.com
X509v3 Subject Alternative Name: DNS:mirsui.com, DNS:www.mirsui.com
notAfter=Dec  3 12:28:59 2026 GMT
```

`certbot renew --dry-run` passa nos dois nomes. Isso vale **enquanto o DNS for
direto**; é exatamente o que a Cloudflare vai mexer, e é o item que ficou em
aberto na fase.

Entre a virada do DNS e o certificado houve uma janela em que
`https://www.mirsui.com` apresentava o certificado do `gerar-adunit.duckdns.org`
— o primeiro vhost com TLS da máquina, que é quem atende o 443 para um nome sem
bloco próprio. **Combinado com o HSTS que a Vercel deixou nos navegadores, isso
é um erro de certificado sem botão de prosseguir.** Não foi regressão (o 402
anterior também deixava o site inacessível), mas é uma janela para fechar
depressa, e é mais um argumento para o certificado sair no mesmo movimento que
o DNS.

#### O HSTS que a troca teria comido em silêncio

A Vercel mandava `Strict-Transport-Security: max-age=63072000`, e os navegadores
de quem já visitou o site guardaram isso por **dois anos**. O nginx não manda
nada disso por padrão: a migração teria trocado o site de casa e desligado o
HSTS sem uma linha de aviso, e o sintoma só apareceria quando os dois anos
fossem vencendo, um visitante de cada vez.

Voltou no bloco 443 do `www`, e também no do apex, para o navegador subir para
HTTPS sozinho nos dois nomes. **Sem `includeSubDomains`**, que a Vercel também
não mandava: ligá-lo forçaria HTTPS em `api.` e `db.` com um prazo de dois anos
difícil de desfazer, e essa não é decisão para tomar de passagem.

#### O salto que sobrava no apex

O `--redirect` do certbot escreve o bloco da porta 80 do apex mandando para
`https://$host`, isto é, `https://mirsui.com` — que o bloco 443 então manda para
o `www`. Dois saltos, que é literalmente a queixa do §5.3. O bloco da 80 passou
a apontar direto para o `www`:

```
http://mirsui.com/pilha  →  https://www.mirsui.com/pilha    (1 salto, 266 ms)
```

#### O que respondeu

Tudo pelo caminho público real, de fora da VPS:

| | |
|---|---|
| `/` · `/feed` · `/pilha` · `/termos` · `/privacidade` | 200 |
| `/robots.txt` · `/auth/check-email` · `/api/auth/me` | 200 |
| `/user/coelho` — dinâmica, lê o Supabase novo | 200 |
| `/_next/static/chunks/…` · `/assets/track-art2.webp` | 200 |
| `/_next/image?url=…&w=640` | 200 `image/jpeg` |
| `/ingest/static/array.js` — o proxy do PostHog | 200 |
| os quatro caminhos (http/https × apex/www) | convergem no `www` em **1 salto** |

E a verificação que o `curl` não faz: a home aberta no navegador, com CSS, JS, o
mosaico de capas passando pelo otimizador e os dados do Supabase novo na página.
Console limpo — a única mensagem vinha de uma extensão do Chrome.

O `SITE_URL` do GoTrue já era `https://www.mirsui.com` e o
`ADDITIONAL_REDIRECT_URLS` já era `https://www.mirsui.com/**`: os links de
e-mail e o callback do Google que a fase 3 testou apontavam para um endereço que
só passou a existir agora.

#### Estado ao fechar

```
nginx        8 sites · mirsui-web novo · cloudflare-realip.conf inerte
cert         www.mirsui.com + mirsui.com, vence 03/12/2026, dry-run ok
DNS          www e apex → 146.235.44.203, TTL 300, nameservers na Hostinger
produção     https://www.mirsui.com, servida pela VPS
Vercel       ainda existe, ainda com o projeto — é o rollback
```

Rollback continua barato e continua sendo DNS: repor o CNAME
`521429e3b1f742b6.vercel-dns-017.com` no `www` e o A `216.198.79.1` no apex. Com
TTL 300, cinco minutos. O que ele **não** devolve é a Vercel funcionando — ela
responde 402 até a cota resetar. O rollback de verdade, hoje, é para um site
fora do ar. É mais um motivo para o §8 deixar de ser um item aberto.

---

### 4 de setembro, meio-dia — a Cloudflare entrou, e a importação comeu um registro

Nameservers trocados para `corey.ns.cloudflare.com` e
`daniella.ns.cloudflare.com`. A borda funciona: `cf-ray` nas respostas, PoP em
GRU, e o site inteiro respondendo através dela.

#### O achado: a varredura automática perdeu o `send`

```
$ dig +noall +comments A send.mirsui.com @corey.ns.cloudflare.com
status: NXDOMAIN
```

Antes da troca esse nome existia:

```
send.mirsui.com.  3600  IN  CNAME  send.forge.rmta.net.
```

É o **return path do Resend** — o caminho por onde volta o bounce dos e-mails
que o GoTrue manda. Sem ele, o alinhamento de SPF/DMARC do remetente
`noreply@mirsui.com` fica sem apoio, e o que quebra é o cadastro e a
recuperação de senha: exatamente os quatro caminhos que a fase 3 passou uma
sessão inteira testando.

**Por que sumiu:** a Cloudflare não faz transferência de zona. Ela adivinha
nomes comuns e importa o que acerta. `www`, `api`, `db`, MX, SPF, DKIM e DMARC
vieram todos. `send` não é um nome comum, e não veio. **Esta é a falha padrão
de toda migração de DNS**, e o motivo de a lista de conferência existir — só
que a conferência tem que ser feita contra a zona velha, não contra a memória.

MX, SPF, DKIM e DMARC vieram inteiros e foram conferidos um a um.

#### Dois nomes que vieram, e vieram errados

`autoconfig.mirsui.com` e `autodiscover.mirsui.com` foram importados **com a
nuvem laranja**. São os endereços que Thunderbird e Outlook consultam para
configurar a conta de e-mail sozinhos, e apontam para a Hostinger. Proxiar isso
manda o cliente de e-mail para a Cloudflare, que tenta servir um host que não é
dela — com `Full (strict)` isso falha no certificado. Têm que ficar cinzas.

#### O que veio certo

| | |
|---|---|
| `SSL/TLS` **não** está em Flexible | testado pelo comportamento: `http://` termina em 200 com **um** salto. Flexible daria loop infinito contra o 301 do nginx. |
| `real_ip` acordou sozinho | o `access_log` passou a mostrar `103.196.9.75` e `2a03:cfc0:…` — visitantes de verdade, não IPs da Cloudflare. O script de faixas feito de manhã funcionou sem precisar de ajuste. |
| `/_next/static/` já cacheia | `MISS` na primeira, `HIT` na segunda, **sem regra nenhuma configurada** — a Cloudflare cacheia `.js` por extensão no padrão dela. A regra explícita continua valendo a pena, mas para fixar o comportamento, não para criá-lo. |

#### A renovação atrás da nuvem laranja — o item em aberto do §5, resolvido

O §5 avisava que a renovação podia falhar em silêncio com a Cloudflare na
frente. Em vez de adivinhar, o teste, que usa o servidor de staging e não gasta
cota:

```
$ sudo certbot renew --dry-run --no-random-sleep-on-renew
Congratulations, all simulated renewals succeeded:
  api.mirsui.com · db.mirsui.com · www.mirsui.com (+ apex)
  gerar-adunit.duckdns.org · prospector-pads.duckdns.org
```

**Os cinco passam, e três deles já estão atrás da nuvem laranja.** O HTTP-01
atravessa. Não é preciso DNS-01, nem plugin, nem token de API — o que também
significa que nenhum segredo novo precisou circular.

> **A ressalva, e ela importa:** este teste passou com o **Bot Fight Mode ainda
> desligado** — provado no mesmo momento, porque `curl`, `python-requests` e um
> `User-Agent: Scrapy/2.11` recebem 200. É justamente o Bot Fight que o §5
> aponta como o risco para o `/.well-known/acme-challenge`. **Refazer este
> `--dry-run` depois de ligá-lo.** Há 90 dias de margem.

#### O `robots.txt`, que a Cloudflare passou a reescrever

O toggle "Block training in robots.txt" está ligado, e ela **acrescenta** o
bloco dela **antes** do que o app gera. A boa notícia primeiro: as regras do
`app/robots.ts` sobreviveram inteiras — `/api/`, `/auth/`, `/ingest`,
`/stakes`, `/admin` continuam lá. O conserto de agosto não foi perdido.

A má notícia é o formato. O arquivo servido tem **dois grupos
`User-agent: *`**, e o primeiro é o da Cloudflare:

```
User-agent: *                    ← o da Cloudflare, PRIMEIRO
Content-Signal: search=yes,ai-train=no,use=reference
Allow: /
…
User-Agent: *                    ← o do app, DEPOIS
Allow: /
Disallow: /api/
Disallow: /ingest
…
```

O Google funde grupos com o mesmo token e obedeceria aos dois. **Nem todo
crawler funde** — a leitura clássica é que vale o primeiro grupo que casa, e
nesse caso o que vale é um `Allow: /` sem nenhum `Disallow`. O que estaria
liberado por acidente inclui o `/ingest`, que é literalmente o caminho que
estourou as quatro cotas em agosto.

E a troca não compra quase nada, porque o `robots.ts` já é mais rigoroso:

| | Cloudflare | `app/robots.ts` |
|---|---|---|
| scrapers de IA bloqueados | 9 | **23** |
| ferramentas de SEO bloqueadas | 0 | **7** |
| o que ela tem e o app não | `CloudflareBrowserRenderingCrawler` e as linhas `Content-Signal` | — |

**Recomendação: desligar o toggle.** O app já bloqueia Amazonbot, Bytespider,
Meta-ExternalAgent e todo o resto da lista dela, num arquivo versionado, com o
raciocínio documentado regra por regra. Ter duas fontes para o mesmo arquivo é
o problema; a segunda fonte é a que não acrescenta nada.

#### `ads.txt`

404 pelos dois caminhos, e é o certo: o Mirsui não tem anúncio. Nada a fazer —
e é a mesma razão pela qual a política `Training: "Block on pages with ads"` da
tela de configuração não bloqueia nada aqui.

---

#### Os consertos, conferidos um a um

| | |
|---|---|
| `send.mirsui.com` | recriado, `CNAME send.forge.rmta.net`, cinza. O return path do Resend voltou. |
| `autoconfig` · `autodiscover` | cinzas, e resolvendo para `autoconfig.mail.hostinger.com` / `autodiscover.mail.hostinger.com` — que é o que faz Thunderbird e Outlook se configurarem sozinhos |
| `api` · `db` | cinzas. Respondem direto na VPS (200 e 401), fora do alcance do Bot Fight. |
| `www` · apex | laranja, que é onde o proxy tem serventia |
| MX · SPF · DKIM · DMARC | intactos |
| `robots.txt` | voltou a ter **um** grupo `User-agent: *`, sem `Content-Signal`. É o arquivo versionado do app outra vez, e ele já é mais rigoroso que o da Cloudflare. |

#### A ressalva do `--dry-run` caiu

Com o **Bot Fight Mode ligado**, o teste foi refeito:

```
Congratulations, all simulated renewals succeeded:
  /etc/letsencrypt/live/www.mirsui.com/fullchain.pem (success)
```

O HTTP-01 atravessa a nuvem laranja **com o Bot Fight ativo**. O item que o §5
deixou em aberto fecha sem asterisco: não é preciso DNS-01, nem plugin, nem
token de API. `api` e `db` saíram do proxy e renovam direto, como antes.

#### O que o Bot Fight está fazendo, honestamente: não deu para provar que faz algo

Ele está ligado no painel. Mas requisições que são o próprio retrato do que ele
deveria barrar continuam passando:

```
User-Agent: python-requests/2.31.0   →  200
User-Agent: Scrapy/2.11              →  200
curl, sem User-Agent nenhum          →  200
```

E vindas de um IP de datacenter, que é o sinal mais forte que existe. Duas
explicações possíveis, e não dá para escolher entre elas de fora: ou ainda
estava propagando, ou a heurística dele é mais frouxa do que o nome sugere — o
Bot Fight pontua a requisição pelo modelo da Cloudflare, não pela string do
`User-Agent`, e não desafia tudo que não é navegador.

**Não conte com ele como se fosse a proteção.** Quem vai fazer o trabalho de
verdade é a regra de rate limit, que é escopada e determinística. Para saber se
o Bot Fight faz alguma coisa aqui, o lugar de olhar é `Security → Events` depois
de algumas horas de tráfego real; se não aparecer nada, ele é decoração e o
custo de mantê-lo ligado é o risco de um dia barrar alguém de verdade.

#### Estado

```
site       https://www.mirsui.com atrás da Cloudflare, 200 em todas as rotas
apex       301 para o www, um salto
api · db   cinzas, direto na VPS
cache      /_next/static/ em HIT
real_ip    access_log com IP de visitante
cert       renova por HTTP-01 mesmo com o Bot Fight ligado
```

Faltam duas regras, as duas no painel: o **rate limit** (`http.host eq
"www.mirsui.com" and not starts_with(http.request.uri.path, "/_next/")`, 50 req
por 10s por IP, block por 1 min) e a **cache rule** de `/_next/static/`. A cache
rule é a menos urgente das duas — o `HIT` já acontece sem ela, por regra de
extensão da Cloudflare; a regra explícita serve para o comportamento não
depender de um padrão que eles podem mudar sem avisar.

---

### 4 de setembro, início da tarde — **fase 5 concluída**

As duas regras entraram, e as duas foram testadas contra o comportamento, não
contra a tela de configuração.

#### O rate limit dispara, e exclui o que tinha que excluir

```
(http.host eq "www.mirsui.com" and not starts_with(http.request.uri.path, "/_next/"))
→ 50 requisições / 10s por IP → Block por 1 min
```

Rajada de 70 requisições **concorrentes**: todas 200. Não é a regra falhando —
é que o contador do plano free é aproximado e 70 chamadas simultâneas chegam
antes de ele fechar a conta. Vale registrar porque o teste errado dá a
impressão de que a regra não existe.

Sequencial, que é como um scraper de verdade se comporta:

```
req #1   → 200
req #55  → 429     (o limite é 50; a aproximação do plano free explica a folga)
```

E com o IP já bloqueado, na mesma corrida — que é o teste que prova a exclusão:

| | |
|---|---|
| `/pilha` · `/feed` | **429** |
| `/_next/static/…` | **200** |
| `/_next/image?…` | **200** |

É exatamente o desenho: o visitante bloqueado não fica sem CSS, e — mais
importante — a rajada de assets de um carregamento normal de página **nunca
conta** para o limite. Sem essa exclusão, um único acesso de verdade queimaria
metade da cota do próprio visitante.

O bloqueio expira sozinho no minuto configurado, verificado esperando.

#### A cache rule está escopada, e isso foi conferido pelo lado perigoso

O risco de uma cache rule mal escopada não é cachear de menos: é cachear uma
página com estado de usuário e servi-la para outra pessoa. Então a conferência
foi essa:

| | |
|---|---|
| `/` · `/feed` · `/pilha` · `/user/coelho` · `/api/auth/me` · `/auth/check-email` | **todas `DYNAMIC`** — nenhuma cacheada |
| `/_next/static/…` | **`HIT`**, com `age` de 1.547s e o `max-age=31536000, immutable` da origem respeitado |

#### Uma nota sobre o otimizador de imagem, que não é da fase 5

`/_next/image` sai como `DYNAMIC` na borda, e o motivo está no cabeçalho que o
próprio Next manda:

```
cache-control: public, max-age=60, must-revalidate
```

Com 60 segundos não há o que a Cloudflare cacheie de útil. **Isso não é um
problema hoje:** o Next mantém cache próprio em disco
(`.next/cache/images`, 2,4 MB e crescendo), então a máquina não está
re-otimizando a mesma imagem a cada pedido.

Fica como ideia para outro dia, não para agora: subir o `minimumCacheTTL` no
`next.config.mjs` faria a borda cachear as imagens também, tirando da VPS o
tráfego de imagem inteiro. É mudança de código com rebuild, e a fase 5 acabou.

#### Fase 5 fechada

```
nginx      8 sites · mirsui-web · real_ip da Cloudflare ativo
DNS        Cloudflare · www e apex laranja · api, db, send, autoconfig,
           autodiscover cinzas · MX, SPF, DKIM, DMARC intactos
TLS        www + apex, vence 03/12 · renova por HTTP-01 ATRAVÉS da nuvem
           laranja, com o Bot Fight ligado — testado, não suposto
borda      rate limit disparando e excluindo /_next/ · /_next/static/ em HIT
robots     um grupo User-agent:* só, o do app
site       https://www.mirsui.com, 200 em todas as rotas
```

O único item aberto que sobrou na migração inteira é o **§8: o backup.** O
Mirsui está no ar, servindo de um banco que não tem cópia nenhuma.

---

### 4 de setembro, 11h34 — **fase 6 concluída**: a hora de acompanhamento

A fase 6 não precisou ser começada: ela aconteceu dentro da fase 5, quando o
DNS virou às 10h17. O que faltava dela era o único item que não é um comando —
**acompanhar por uma hora** — e aqui está, com o que os logs mostraram nas duas
primeiras horas no ar.

#### O que passou pela máquina

1.988 requisições desde a virada, no `access_log` (que é compartilhado pelos 8
sites da máquina — ver mais abaixo):

| status | quantas | o que é |
|---|---|---|
| 200 | 1.503 | |
| 404 | 193 | **nenhum é do site** — ver abaixo |
| 301 | 182 | o apex e o `http→https` |
| 307 · 308 | 58 | middleware e trailing slash |
| 204 · 401 · 400 · 403 | 37 | auth sem token, requisição malformada, varredura |
| **5xx** | **1** | |

#### O único 5xx, e por que ele não preocupa

```
127.0.0.1 - - [04/Sep/2026:10:34:10] "HEAD /rest/v1/tracks?select=id&track_uri=eq…" 503 0 "-" "node"
```

Um 503, vindo do **loopback**, com `User-Agent: node` — ou seja, o SSR do Next
falando com o PostgREST. Às 10h34, que cai dentro da janela em que o nginx foi
recarregado três vezes (o `--expand` do certbot, o HSTS e o salto do apex).
**Os 11 containers do Supabase estão `healthy` com 13–14 horas de uptime e
nenhum reinício**, então não houve queda do lado do banco. Um em 1.988, numa
janela de recarga, é transitório.

#### Os 404 são todos varredura — e isso é a boa notícia

```
19  /_internal/api/setup.php?action=exists
10  /tracking.php · /set_captcha_validated.php · /.rt/verify · /.amper/challenge/fp.js
 5  /.env
 2  /xmlrpc.php · /backup.zip · /.git/HEAD · /.env.production · /config.json
```

**Nenhum link interno quebrado.** Numa troca de hospedagem é justamente aí que
aparece o estrago — arquivo que existia na Vercel e não veio, rota que
dependia de uma configuração de plataforma. Não apareceu nada. E `.env`,
`.env.production` e `.git/HEAD` respondem 404, que é o certo.

O `error_log` teve 3 linhas na janela, todas `access forbidden by rule` de quem
bateu no **IP cru** da máquina e caiu no vhost padrão — nada a ver com o
Mirsui.

#### Processos e recursos

```
mirsui-web       96 min de uptime, nenhum reinício desde a virada, 196 MB
mirsui-backend   8 dias, nenhum reinício novo
supabase         11 containers, todos healthy, 13–14h
load             0,31  ·  RAM livre 18,8 GB de 24  ·  disco 98 GB livres
```

Os 196 MB do Next estão abaixo dos ~350 MB que o §4.2 estimou, e a carga não
saiu do lugar. A folga de 50 a 100× que o §4.2 projetou continua de pé.

#### O buraco que o acompanhamento encontrou

**O `access_log` é um só para os 8 sites da máquina**, e o formato padrão não
grava o `host`. Ou seja: não havia como responder "quanto tráfego o site teve"
nem "o site está dando erro" sem misturar FreshRSS, Portainer e o resto. Isso
não é um detalhe de hoje — é a condição de qualquer monitoramento daqui para a
frente.

O vhost passou a ter log próprio:

```
access_log /var/log/nginx/mirsui-web.access.log;
error_log  /var/log/nginx/mirsui-web.error.log;
```

O `/_next/static/` continua fora do log, por volume, e o `logrotate` do nginx
já cobre `/var/log/nginx/*.log`, então não fica arquivo crescendo sem teto.

#### O rollback ficou melhor do que o §10 supunha

O §10 desenha o rollback como uma troca de DNS que espera propagação. Com a
nuvem laranja isso mudou: os IPs que o mundo resolve são os da Cloudflare e
**não mudam**. Trocar o destino no painel dela vale em segundos, sem
propagação nenhuma.

O que continua valendo do §10 é a ressalva mais importante, e ela não é
técnica: **o rollback devolve um site que responde 402.** A Vercel só volta a
servir quando a cota resetar. Na prática, hoje, não existe para onde voltar — o
que faz do §8 (backup) não só o último item, mas o único que ainda protege
alguma coisa.

---

### 4 de setembro, noite — a conferência na máquina, e o git que tinha se partido em dois

Não é uma fase: é uma varredura por SSH com o site já no ar, para separar o que
o documento *diz* do que a máquina *faz*. A maior parte bateu. O que não bateu
está abaixo, e são quatro coisas — três delas o documento não sabia.

#### O que bateu

| conferido | resultado |
|---|---|
| Supabase | 11 containers `healthy`, 21 h de uptime, `restart: unless-stopped`, `docker` `enabled` no boot |
| Banco | 28 MB · 15 usuários · 15 profiles · 4 playlists |
| Processos | `mirsui-web` online há 8 h, `mirsui-backend` há 9 dias, nenhum reinício novo |
| nginx | 8 sites, `nginx -t` ok |
| TLS | `www`+apex e `db` até 03/12 · `api` até 09/10 · `certbot.timer` ativo, rodou às 13h06 |
| Borda | `www` 200 · apex 301 → `www` em um salto · HSTS · HTML `DYNAMIC` · estático `immutable` |
| Portas | 3002 só em loopback; a 3000 escuta em `0.0.0.0` mas **não responde de fora** — testado em `146.235.44.203:3000` |
| Log próprio | 455 requisições, **zero 5xx**; os 404 são só varredura (`/wp-admin/install.php`, `/wp-login.php`, `/.env`) |
| Máquina | disco 49% de 192 GB · RAM 5,1 de 23 GB · load 0,39 |
| Nuvem | projeto `tqprioqqitimssshcrcr` está `ACTIVE_HEALTHY` — o rollback do §10 existe de verdade |

#### Novidade 1 — os dois `UPDATE` não consertam as imagens, e o disco mente

O §13 registrava as 17 URLs mortas como "falta só o dado". Falta mais do que
isso:

```
storage.objects  = 0     ← os dois buckets existem e estão VAZIOS
profiles         = 14 avatares apontando para o host morto
playlists        =  3 capas apontando para o host morto
```

Os 12 arquivos nunca chegaram, e a origem continua respondendo 402 hoje. Rodar
os dois `UPDATE` agora trocaria **402 por 404**: a URL passaria a apontar para um
`db.mirsui.com` que não tem o arquivo. Primeiro os bytes, depois as linhas.

E isso está visível em produção: o HTML que `www.mirsui.com` serve hoje sai com
`src` de avatar apontando para `tqprioqqitimssshcrcr.supabase.co`, e o otimizador
de imagem devolve 402 junto.

**A armadilha.** Existe `/home/ubuntu/mirsui-storage/` com os 12 arquivos, nos
nomes certos, na estrutura certa de bucket. Eles não são imagens:

```
12 arquivos · 189 bytes cada · TODOS com o mesmo md5 (a850e1cb…)
{"message":"Service for this project is restricted due to the following
 violations: exceed_egress_quota…"}
```

São 12 cópias do corpo do erro 402. O `/tmp/migra-storage.sh` está correto — ele
testa `código != 200` e por isso **não** subiu nada, que é a razão de
`storage.objects` ser 0. O risco é humano: quem abrir aquela pasta daqui a um mês
vai ver "os arquivos estão aqui" e subir 12 JSONs com `Content-Type: image/jpeg`.
Aí o site passa a responder **200 com lixo**, que é pior do que o 402 de hoje,
porque para de doer.

Três coisas que barateiam o conserto:

- **9 dos 14 avatares são o mesmo `default.jpg`.** Ele não é dado de usuário, é a
  imagem de fallback — dá para **recriar**, não precisa recuperar. Isso conserta
  9 de 14 sem depender da cota da nuvem. Sobram 5 fotos de usuário e 3 capas, que
  são dado de verdade e só voltam da origem.
- **O `next.config.mjs` não tem `db.mirsui.com` em `images.domains`** — só o host
  antigo. O plano mandava *remover* o antigo e ninguém reparou que falta
  *adicionar* o novo. Sem isso o `<Image>` recusa a URL nova depois do `UPDATE`.
- **O `/tmp/migra-storage.sh` mora em `/tmp`.** A fase 11 é um reboot combinado, e
  o Ubuntu limpa `/tmp` no boot. Tirar de lá antes, ou a fase 11 come a fase 9.

#### Novidade 2 — o repositório tinha se partido em dois

O `git pull` do `deploy.sh` ia falhar no primeiro deploy de verdade:

```
origin/main   de2e8f9
aqui          de2e8f9 + 11 commits   (entre eles 772c238, o do standalone)
na VPS        de2e8f9 +  1 commit    (ba2433d, o do standalone TAMBÉM)
```

Dois commits diferentes fazendo a mesma mudança, nenhum dos dois no `origin`: a
fase 4 commitou o `output: 'standalone'` na máquina, e a mesma mudança foi
commitada aqui. Histórias divergentes, e o `deploy.sh` começa por `git pull`.

Resolvido sem rebuild e sem reiniciar nada, porque os blobs eram idênticos:

```
next.config.mjs   aqui 1756964…   VPS 1756964…   ← o mesmo objeto git
.gitignore        aqui 494ffa0…   VPS 494ffa0…   ← o mesmo objeto git
```

`ba2433d` não continha um byte que `772c238` não tivesse. Então:

1. `git push origin main` daqui — 12 commits, nenhum tocando código de aplicação:
   só `docs/`, mais o `next.config.mjs` e o `.gitignore` que a VPS já tinha
   idênticos.
2. Na VPS, `git branch pre-sync-2026-09-04 ba2433d` **antes** de qualquer coisa.
   O commit da máquina continua alcançável; não virou lixo de reflog.
3. `git reset --hard origin/main`. O `git diff --stat HEAD origin/main` de antes
   listava 6 arquivos, todos em `docs/` — **nenhum arquivo de código**. Depois, o
   `mtime` do `next.config.mjs` continua sendo o de 03/09 22h58: prova de que o
   git nem chegou a tocá-lo.
4. Conferido em seguida: `git pull --ff-only` responde *Already up to date*, o pm2
   segue com os mesmos reinícios de antes, `127.0.0.1:3002` responde 200 e o `www`
   responde 200.

O build que está no ar continua sendo o mesmo build. Nada foi refeito porque nada
precisava ser.

#### Novidade 3 — ninguém está olhando

O `uptime-kuma` roda nesta máquina desde antes da migração, e seus 4 monitores
são `ping` de máquinas de pessoas (`daniel`, `allan`, `alysson`, `lucas`). **Nada
monitora `mirsui.com`.** Sair da Vercel levou junto o alerta que ninguém tinha
notado que existia.

#### Novidade 4 — o boot continua sendo teoria

`pm2-ubuntu` está `enabled`, mas `inactive (dead)`: o daemon que roda hoje subiu
fora do systemd. O `dump.pm2` tem os dois processos e os containers voltam por
conta própria (`unless-stopped` + `docker enabled`), então a teoria fecha. É
teoria — ver a fase 11.

---

### 4 de setembro, 19h17 — **fase 8 concluída**: o backup existe, e foi restaurado de propósito

O item que o §8 chamava de "o único deste plano que pode matar o projeto" saiu de
zero. São três peças, e a terceira é a que faz das outras duas um backup.

#### O que roda

`/usr/local/bin/mirsui-backup.sh`, no cron do `ubuntu`, **03:30 todo dia** — fora
do 00:00 do logrotate e longe do job das 07:00 que já existia. Leva 9 segundos.
O crontab foi de 5 para 6 linhas, com cópia do anterior em
`~/.crontab-antes-do-backup-2026-09-04`.

Dois arquivos, porque um só não restaura:

| arquivo | o que é | tamanho |
|---|---|---|
| `mirsui-<data>.sql.gz` | o banco inteiro — `public`, `auth`, `storage`, `realtime`, `vault` | 2,4 MB |
| `mirsui-globals-<data>.sql.gz` | os papéis do cluster — `anon`, `authenticated`, `service_role`, `supabase_admin` | 1,5 KB |

Os papéis moram **fora** do banco. Sem eles os `GRANT` do dump apontam para
papéis que não existem — que é exatamente o buraco da fase 2, quando o dump da
nuvem chegou sem os grants do schema `public`.

#### O que o script se recusa a chamar de backup

Um arquivo só recebe o nome definitivo depois de passar por quatro provas:

```
sai como .parcial          um pg_dump que morre no meio não pode deixar um
                           .sql.gz truncado com nome de backup bom
gzip -t                    o arquivo abre
zgrep "dump complete"      o pg_dump chegou até a última linha
tamanho > 500 KB           não é um dump vazio com cara de dump
```

E depois do upload, o tamanho no Drive tem que bater com o do disco — "enviei"
não é o mesmo que "está lá". Qualquer uma dessas falhando, o script apaga o
parcial e sai com falha, sem sobrescrever o backup bom do dia anterior.

#### O destino, e a armadilha do `rclone`

`gdrive:mirsui-backup`, com **`rclone copy`**. Nunca `sync`: o script vizinho da
máquina (`sync-gdrive.sh`) usa `sync`, e `sync` espelha remoções — a limpeza
local dos 14 dias apagaria a cópia de fora junto, e "fora da máquina" viraria
decoração. Retenção: **14 dias na máquina, 90 no Drive** (~220 MB, contra 283 GB
livres na conta). O `rclone delete` é escopado por `--include "mirsui-*.sql.gz"`,
para nunca ser problema de outra coisa que apareça naquela pasta.

O log fica em `/var/log/mirsui-backup.log`, com `logrotate` mensal já
configurado, e cada sucesso carimba `/var/backups/mirsui/ULTIMO_SUCESSO` — um
arquivo que a fase 10 vai conseguir monitorar sem precisar entender nada disto.

**O script está versionado**, em `ops/mirsui-backup.sh`. O que roda é a cópia
instalada em `/usr/local/bin/mirsui-backup.sh` — depois de mexer no arquivo do
repo, reinstalar é uma linha:

```bash
sudo install -o root -g root -m 755 ops/mirsui-backup.sh /usr/local/bin/mirsui-backup.sh
```

Ficou assim porque a alternativa era a do `deploy.sh` da fase 4, que mora só na
máquina: se a VPS morrer, ele morre junto, e o backup do banco não traz de volta
o script que fez o backup. O `deploy.sh` continua fora do repo — mesma
consequência, decisão ainda em aberto.

#### O restore, que é o item que ninguém faz — e foi ele que achou o erro

Feito de propósito, num banco descartável do próprio container, sem encostar no
banco de produção. E pagou por si na primeira tentativa:

| dump e restore feitos como | linhas de erro |
|---|---|
| `postgres` | **295** |
| `supabase_admin` | **4** |

No Supabase self-hosted o **`postgres` não é superusuário**. Quem é, e quem é
dono dos schemas `auth`, `storage` e `realtime`, é o `supabase_admin`. Restaurando
como `postgres`, as 295 linhas são `must be member of role`: **os dados chegam e
os donos não** — e um GoTrue apontado para aquele banco não sobe. É a pior
espécie de backup ruim, porque a contagem de linhas bate e parece que funcionou.

Com o papel certo sobram 4 linhas, todas
`function graphql_public.graphql(…) does not exist`: um `GRANT` no wrapper do
endpoint GraphQL, que o Mirsui não usa — o `supabase-js` daqui fala com o
PostgREST.

A prova, no banco restaurado contra o de produção:

```
auth.users        15  =  15
public.profiles   15  =  15
public.playlists   4  =   4
policies public   36  =  36
tabelas public    17  =  17
triggers em auth   1  ← o on_auth_user_created, o mesmo que o dump da migração
                        tinha perdido e que só apareceu testando um cadastro
```

O banco de teste foi apagado no fim: o cluster voltou aos mesmos quatro
(`postgres`, `_supabase`, `template0`, `template1`).

#### O que ainda NÃO está no backup, e é uma decisão sua

`/opt/mirsui-db/.env`. É ele que carrega o `JWT_SECRET`, e sem esse segredo um
banco restaurado não valida token nenhum — nem os que o navegador já tem, porque
a `anon key` do `.env.production` foi assinada com ele. Ficou de fora **por
decisão, não por esquecimento**: subir esse arquivo para o Drive é pôr a chave de
assinatura numa conta do Google, e essa escolha não é técnica.

Três saídas, nenhuma urgente hoje:

```
[ ] subir cifrado — gpg -c antes do rclone, com a senha guardada fora da máquina
[ ] guardar fora do Drive — um gerenciador de senhas resolve, são poucos bytes
[ ] aceitar: no dia do restore, reemitir JWT_SECRET, anon key e service role,
    e refazer o build do front. Funciona, custa uma tarde e derruba as sessões
```

---

### 11 de setembro, noite — o login por senha estava quebrado desde a virada, e o culpado era o `.env` que a fase 4 não tocou

**O sintoma:** entrar com e-mail e senha em `www.mirsui.com` devolvia "Erro ao
iniciar sessão". No log do `mirsui-web`:

```
Erro ao persistir sessão: invalid JWT: unable to parse or verify signature,
token signature is invalid   (403, code: bad_jwt)
```

**A causa:** o §7 manda trocar `SUPABASE_URL` e as duas chaves no
`/home/ubuntu/mirsui-backend/.env`. O checklist da fase 4 marcou o frontend e
esqueceu o backend — o `.env` era de **16/08**, e ainda apontava para
`tqprioqqitimssshcrcr.supabase.co`. Como o projeto da nuvem continua no ar (fase
7), o `signInWithPassword` do backend funcionava lá, emitia um token assinado com
o `JWT_SECRET` **antigo**, e o `setSession` do frontend o levava ao GoTrue
**novo**, que recusava a assinatura. Três consequências, não uma:

1. login por senha quebrado — o caso relatado;
2. login por Google entrava (vai direto ao GoTrue novo), mas toda rota do
   backend com `requireAuth` devolvia 401, porque o `getUser` validava o token
   novo contra o GoTrue da nuvem;
3. **os crons gravaram na nuvem por oito dias** (03→11/09).

**O conserto:** `.env` do backend com `SUPABASE_URL=http://127.0.0.1:54321`,
`ANON_KEY` e `SERVICE_ROLE_KEY` do `/opt/mirsui-db/.env`,
`FRONTEND_URL=https://www.mirsui.com`; cópia do anterior em `.env.pre-vps`
(ignorado pelo git, junto com o `.env`); `pm2 restart mirsui-backend
--update-env`. Testado com um usuário descartável no GoTrue local: login pelo
backend → token com `iss: https://db.mirsui.com/auth/v1` → aceito por
`db.mirsui.com/auth/v1/user` (200) → `GET /stakes` com o token responde 200 e sem
ele 401. Usuário apagado; 15/15 de novo.

**O que divergiu, medido antes de mexer.** Só o que os crons produzem — nenhuma
tabela de usuário (stakes, favorites, playlists, comments, followers, users)
tinha diferença de contagem, e a VPS era **prefixo exato** da nuvem nas cinco
tabelas que divergiram (ids locais ⊂ ids da nuvem, nada local que a nuvem não
tivesse):

| tabela | nuvem | VPS antes | trazido |
|---|---|---|---|
| `track_popularity_history` | 59.020 | 42.894 | +16.126 (ids > 66226) |
| `observed_tracks` | 21.245 | 18.164 | +3.081, e as 18.164 atualizadas |
| `stake_snapshots` | 198 | 180 | +18 (ids > 207) |
| `discovery_artists` | 97 | 91 | +6, e as 91 atualizadas |
| `stakes` | 3 | 3 | as 5 colunas que o job escreve, nos 3 |

Trazido por PostgREST (só leitura na nuvem, ~22 MB), numa transação única com
conferência de totais dentro dela, ensaiada antes com `rollback`. Sequências
avançadas (`82358`, `225`). Backup das cinco tabelas antes de aplicar em
`/var/backups/mirsui/mirsui-pre-sync-nuvem-2026-09-11.sql.gz`. Os crons voltam a
gravar aqui a partir da próxima rodada (08:00/08:30 e 12:00 UTC).

> **A lição para o checklist:** "fase concluída" era o front no ar lendo o banco
> novo. O backend estava no ar também — só que lendo o outro. Ninguém percebeu
> por oito dias porque o login por Google funcionava e a home não precisa de
> sessão. Enquanto a fase 7 mantiver a nuvem viva, um `.env` esquecido não
> falha: ele **funciona no lugar errado**, que é pior.

---

### Retomada — a próxima sessão começa aqui

**O site está no ar na VPS, e a migração está feita.** O que falta deixou de ser
uma lista solta e virou o **§14**: seis fases numeradas, com ordem entre elas e
critério de pronto em cada uma. **As fases 8 e 9 estão feitas** — o backup e as
imagens.

**A fase 9 fechou a parte que se via de fora** (`d40ddc7`): o avatar quebrado
caía no ícone de imagem partida em vez do fallback, e agora cai no fallback.
Falta só o resgate dos bytes, que **depende da cota da nuvem virar — dia 27,
provavelmente**. Marque isso: é a única pendência deste documento com data de
terceiro, e ela conflita com o 18/09 da fase 7.

**A próxima é a fase 10**, o monitor de fora, que não depende de ninguém. Depois
a 11 (o reboot combinado, que precisa de janela) e a 12 (os três segredos).

Duas decisões da fase 5 fecharam aqui e não voltam à mesa:

- **A renovação fica em HTTP-01 e não vira DNS-01.** Mediu-se que o HTTP-01
  atravessa a nuvem laranja **com o Bot Fight ligado** — o `--dry-run` foi
  refeito depois de ativá-lo —, e `api` e `db` estão cinza e renovam direto.
  Instalar o `python3-certbot-dns-cloudflare` e emitir um token de
  `Zone:DNS:Edit` seria somar uma peça e um segredo para resolver um problema
  que a medição mostrou não existir.
- **O `db` fica cinza na Cloudflare.** No plano gratuito o Bot Fight Mode é um
  botão de zona inteira; ligá-lo com o `db` laranja põe um detector de robô na
  frente de toda chamada do `supabase-js` feita pelo navegador, inclusive as de
  auth. O SSR já está protegido disso pelo `/etc/hosts`, mas o navegador não.
  Custa só proteção de DDoS num hostname que não é o alvo — o que estourou a
  cota foi tráfego de site, não de API.

---

## 14. O que sobrou — fases 7 a 12

A migração acabou. O que segue é o que faltou para ela ser **segura**, e a ordem
não é a numérica: **a fase 8 vem antes de todas**, e a 11 vem depois dela.

### Fase 7 — não apagar nada, e agora por dois motivos

Segue como estava: o projeto da nuvem não se apaga antes de **18/09/2026**. Mas a
conferência somou um motivo que a data não cobre:

> **Os 12 arquivos do Storage só existem lá.** O que está no disco da VPS são
> corpos de erro 402. Se o projeto for apagado antes de a cota virar, as 5 fotos
> de usuário e as 3 capas de playlist somem para sempre. **A fase 7 não termina
> em 18/09 — ela termina quando a fase 9 tiver os bytes.**

**Atualização de 4/09 — a trava encolheu, mas não sumiu.** O inventário da fase
9 mostrou que 3 dos 12 são capas de playlist, e playlist saiu do produto; o
`default.jpg` não é dado de ninguém; e o avatar do único usuário de fora nunca
esteve no Storage. Sobram **5 fotos, todas de contas do próprio dono ou da única
outra pessoa que viu o projeto**. E como a data provável de virada da cota é
**27/09** — depois do 18/09 —, a escolha é explícita: ou o 18/09 estica até lá,
ou as 5 fotos são abandonadas de propósito. **Não é para decidir isso por
omissão**, que é exatamente o que acontece se alguém apagar o projeto na data.

```
[ ] não apagar antes de 18/09/2026
[ ] e não apagar antes de a fase 9 resgatar as 5 fotos — ou de a perda delas
    ser uma decisão tomada, não um esquecimento
```

### Fase 8 — o backup  ·  **FEITA em 4/09 às 19h17**

```
[x] cron noturno de pg_dump — 03:30 todo dia, banco + papéis do cluster
[x] rclone copy para gdrive:mirsui-backup — copy, NÃO sync
[x] um restore testado de propósito, num banco descartável do container
[x] a prova: 15 usuários / 15 profiles / 4 playlists / 36 policies / 17 tabelas,
    e o trigger on_auth_user_created junto
[ ] decidir o /opt/mirsui-db/.env: o JWT_SECRET NÃO está no backup, e isso é
    escolha, não esquecimento — as três saídas estão no §13
```

O registro completo está no §13 (`fase 8 concluída`), e vale ler por dois
motivos que não cabem numa caixa marcada:

- **O dump tem que sair como `supabase_admin`, não como `postgres`.** No Supabase
  self-hosted o `postgres` não é superusuário. Com o papel errado o restore
  entrega os dados e não os donos — 295 linhas de `must be member of role` — e o
  GoTrue não sobe em cima daquele banco. Foi o teste de restore que achou isso, e
  é a razão de ele existir.
- **`rclone copy`, nunca `sync`.** O `sync-gdrive.sh` vizinho usa `sync`, e `sync`
  espelha remoções: a limpeza local dos 14 dias apagaria a cópia de fora junto.

### Fase 9 — as imagens  ·  **o feio saiu do ar em 4/09; falta o resgate**

```
[x] 1. db.mirsui.com entra em images.domains do next.config.mjs (o host antigo
       FICA, por enquanto) — sem isso o <Image> recusa a URL nova
[x] 2. tirar migra-storage.sh de /tmp, antes que a fase 11 o apague
       → agora é /usr/local/bin/mirsui-migra-storage.sh, mesma convenção do
         backup da fase 8, e versionado em ops/
[x] 3. apagar /home/ubuntu/mirsui-storage/ — 12 corpos de erro 402
       → conferido antes de apagar: 12 arquivos, 189 bytes, md5 único
         a850e1cb…, e só então removido
[x] 4. ~~recriar um default.jpg~~ — **cancelado, e o motivo está abaixo**
[x] 5. ~~UPDATE das linhas de default.jpg~~ — **não é mais preciso**
--- daqui para baixo depende de a cota da nuvem virar (dia 27, provavelmente) --
[ ] 6. rodar o mirsui-migra-storage.sh e conferir que os arquivos têm tamanho
       de imagem, não 189 bytes
[ ] 7. os dois UPDATE completos do §13
[ ] 8. só então tirar tqprioqqitimssshcrcr.supabase.co do next.config.mjs
[ ] 9. npm run build + deploy.sh — os passos 1 e 8 são config do Next, e config
       do Next só vale depois do build
```

**Os passos 4 e 5 morreram porque o problema era outro.** O plano supunha que
os avatares estavam feios por falta de dado. Não estavam: estavam feios por
falta de tratamento de erro. O fallback de avatar já existia em todas as telas,
mas só disparava com `avatar_url` **nulo** — e aqui a URL existe e está morta.
O React desenhava o `<img>`, o navegador tomava 402, e sobrava o ícone de
imagem partida. Ou seja, o fallback bonito nunca era chamado.

O conserto foi `components/FotoDePerfil.tsx`, que trata `onError` e entrega o
fallback de cada tela como `children` — cada uma manteve o desenho que já tinha.
Está em produção desde `d40ddc7`. Com isso, recriar um `default.jpg` seria
inventar um arquivo órfão para competir com um fallback melhor que já existe, e
os `UPDATE` deixaram de ser urgentes: **o banco não foi tocado**, as 14 URLs
seguem intactas, e quando a cota virar é rodar o script e o `UPDATE` do §13 —
as fotos voltam e o fallback apenas para de aparecer. Nada a desfazer.

> **`UserFollowers.tsx` já estava certo** e ficou de fora: usa o `Avatar` do
> shadcn, e o Radix trata erro de carregamento sozinho. Foi o que mostrou qual
> era o conserto.

**O inventário mudou de figura quando se olhou de quem são as imagens.** O
único usuário de fora do projeto, display name `_mouretsu`, entrou por **Google**
em 30/07/2026 — e avatar de Google mora no `lh3.googleusercontent.com`, que
responde 200 e nunca passou pelo Storage. **Não há nada dele para resgatar.**
As 8 imagens que sumiram de verdade são todas de contas do próprio dono ou da
única outra pessoa que viu o projeto:

```
4 fotos de perfil   dankwx130, danlu, abcabc, kondlapp2
1 foto de perfil    coelho
2 capas de playlist do danlu     ← playlist saiu do produto, ignorar
1 capa de playlist  do coelho    ← idem
9 default.jpg       contas de teste
```

Ou seja: **as capas de playlist saem do escopo** — a funcionalidade não existe
mais no produto. E a fase 7 destrava parcialmente, porque o que o §14 chamava de
"os bytes que só existem lá" encolheu para 5 fotos de conta própria.

### Fase 10 — alguém olhando

```
[ ] monitor HTTP de https://www.mirsui.com com notificação que chegue no celular
```

> **A ressalva que decide onde o monitor mora.** O `uptime-kuma` roda **na
> própria VPS**. Ele cobre bem o caso comum — o Next morreu e a máquina não — e
> não cobre o caso que importa: se a máquina cair, o monitor cai junto, e o
> silêncio fica indistinguível de "está tudo bem". O mínimo honesto é um checador
> de fora (UptimeRobot, Better Stack, ou um health check da Cloudflare), com o
> kuma como segunda camada, não como a única.

### Fase 11 — o reboot combinado  ·  DEPOIS da fase 8

A máquina está com 67 dias de uptime e nunca reiniciou com esta stack. O que
precisa ser provado, sem intervenção manual nenhuma:

```
[ ] os 11 containers do Supabase voltam sozinhos
[ ] o pm2-ubuntu ressuscita mirsui-web e mirsui-backend
[ ] www.mirsui.com responde 200 sem ninguém abrir um SSH
```

Combine a janela: com o site no ar, isto deixou de ser de graça. E faça depois da
fase 8 — reiniciar sem backup é apostar duas coisas de uma vez.

### Fase 12 — os três segredos que circularam

Pendente desde a fase 3: a senha do banco da nuvem, o client secret do Google e a
API key do Resend passaram em texto claro durante o planejamento.

```
[ ] senha do banco na nuvem — antes de 18/09, depois disso deixa de existir
[ ] client secret do Google — derruba o login por Google até o .env do GoTrue
    ser atualizado e o container reiniciado. Janela curta, mas existe: troque e
    teste na sequência, não deixe para conferir depois
[ ] API key do Resend — trocar e provar com um envio de verdade
```

---

**Fora do escopo deste documento, mas anotado para não se perder:**

**Cadastro por Google entra sem `username` e sem `display_name`.** O trigger
`handle_new_user` lê `raw_user_meta_data ->> 'display_name'`, e o Google não
manda esse campo — manda `name` e `full_name`. Resultado: a linha de `profiles`
nasce com as duas colunas nulas. Foi assim que o único usuário de fora do
projeto entrou, em 30/07/2026: no banco ele é um perfil sem nome, e o
`_mouretsu` que aparece na tela sai de `auth.users.raw_user_meta_data`, não de
`profiles`. Isso degrada mais do que parece — `/user/[username]` é a rota do
perfil, e sem `username` o link cai no UUID. O conserto é o trigger aceitar
`coalesce(display_name, name, full_name)` e derivar um `username` quando vier
vazio; a parte chata é decidir o que fazer com colisão de `username`, que tem
constraint de único.

`/sitemap.xml` responde 404. Não é regressão da migração — o `app/` tem
`robots.ts` e nunca teve rota de sitemap —, mas agora que o site é servido por
nós e está atrás da Cloudflare, é uma linha que só a gente pode escrever.
