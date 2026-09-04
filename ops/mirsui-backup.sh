#!/usr/bin/env bash
#
# Backup diário do Supabase self-hosted do Mirsui.
# Roda pelo cron do usuário ubuntu, 03:30 no fuso da máquina (-03).
# Ver a fase 8 de docs/migracao-para-vps.md, no repositório do site.
#
# São DOIS arquivos, porque um só não restaura:
#
#   mirsui-<data>.sql.gz          o banco postgres inteiro — public, auth,
#                                 storage, realtime, vault, tudo
#   mirsui-globals-<data>.sql.gz  os papéis do cluster: anon, authenticated,
#                                 service_role, supabase_admin e companhia
#
# Os papéis moram FORA do banco, no cluster. Sem eles, os GRANT do dump
# apontam para papéis que não existem — que foi exatamente o buraco que
# apareceu na fase 2 da migração, quando o dump da nuvem chegou sem grants.

set -euo pipefail

LOCAL_DIR=/var/backups/mirsui
REMOTO=gdrive:mirsui-backup
CONTAINER=supabase-db
# supabase_admin, e não postgres: no Supabase self-hosted o `postgres` NÃO é
# superusuário, e quem é dono de auth, storage e realtime é o supabase_admin.
# Com o papel errado o restore vira 295 linhas de "must be member of role":
# os dados chegam, os donos não, e o GoTrue não sobe. Medido, não suposto.
PAPEL=supabase_admin
LOG=/var/log/mirsui-backup.log
DIAS_LOCAL=14
DIAS_REMOTO=90

exec >> "$LOG" 2>&1
echo "=== $(date '+%F %T %z') início ==="

STAMP=$(date +%F)
DB="$LOCAL_DIR/mirsui-$STAMP.sql.gz"
GL="$LOCAL_DIR/mirsui-globals-$STAMP.sql.gz"

falhou() {
    echo "FALHOU: $1"
    rm -f "$DB.parcial" "$GL.parcial"
    echo "=== $(date '+%F %T %z') fim, COM FALHA ==="
    exit 1
}

mkdir -p "$LOCAL_DIR"

# 1. Os dumps saem com sufixo .parcial. Um pg_dump que morre no meio não pode
#    deixar um .sql.gz truncado com nome de backup bom — é assim que se
#    descobre, no dia do desastre, que os últimos 40 backups eram metade.
sudo -n docker exec "$CONTAINER" pg_dump -U "$PAPEL" postgres \
    | gzip > "$DB.parcial" || falhou "pg_dump"
sudo -n docker exec "$CONTAINER" pg_dumpall -U "$PAPEL" --globals-only \
    | gzip > "$GL.parcial" || falhou "pg_dumpall --globals-only"

# 2. Três provas antes de o arquivo virar backup de verdade.
gzip -t "$DB.parcial" || falhou "gzip corrompido"
zgrep -q "PostgreSQL database dump complete" "$DB.parcial" \
    || falhou "o dump não terminou"
TAM=$(stat -c %s "$DB.parcial")
[ "$TAM" -gt 500000 ] || falhou "dump pequeno demais: $TAM bytes"

mv "$DB.parcial" "$DB"
mv "$GL.parcial" "$GL"
echo "dump ok: $(du -h "$DB" | cut -f1) (banco) + $(du -h "$GL" | cut -f1) (papéis)"

# 3. Fora da máquina. É copy, NUNCA sync: o sync espelharia a limpeza local
#    de 14 dias lá no Drive, e a cópia de fora sumiria junto com a de dentro.
rclone copy "$DB" "$REMOTO/" || falhou "rclone copy do banco"
rclone copy "$GL" "$REMOTO/" || falhou "rclone copy dos papéis"

# 4. Conferir que chegou inteiro. "Enviei" não é o mesmo que "está lá".
NOME=$(basename "$DB")
TAM_REMOTO=$(rclone lsf --format "ps" --separator ";" "$REMOTO" \
    | grep "^$NOME;" | cut -d";" -f2 || true)
[ "$TAM_REMOTO" = "$TAM" ] \
    || falhou "tamanho no Drive não bate: $TAM_REMOTO vs $TAM"
echo "no Drive: $NOME ($TAM_REMOTO bytes)"

# 5. Limpeza. O --include escopa a remoção: se um dia entrar outra coisa
#    nessa pasta do Drive, ela não é problema deste script.
find "$LOCAL_DIR" -name 'mirsui-*.sql.gz' -mtime +$DIAS_LOCAL -delete
rclone delete "$REMOTO" --min-age "${DIAS_REMOTO}d" --include "mirsui-*.sql.gz"

# 6. Um marcador que qualquer monitor consegue ler depois (ver fase 10).
date '+%F %T %z' > "$LOCAL_DIR/ULTIMO_SUCESSO"
echo "=== $(date '+%F %T %z') fim, ok ==="
