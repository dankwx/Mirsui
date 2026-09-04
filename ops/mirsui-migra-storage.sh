#!/usr/bin/env bash
# Migra os 12 objetos do Storage da nuvem para o self-hosted.
# Os dois buckets sao publicos, entao o download nao precisa de chave.
# O upload usa a SERVICE_ROLE_KEY nova e passa pela API do Storage, que e
# quem cria as linhas de storage.objects — por isso o dump de metadados nao
# foi restaurado (e tinha drift de schema de qualquer forma).
set -uo pipefail

SRC="https://tqprioqqitimssshcrcr.supabase.co/storage/v1/object/public"
DST="http://127.0.0.1:54321/storage/v1/object"
KEY=$(grep "^SERVICE_ROLE_KEY=" /opt/mirsui-db/.env | cut -d= -f2-)

if [ -z "$KEY" ]; then echo "SERVICE_ROLE_KEY nao encontrada"; exit 1; fi

BASE="$HOME/mirsui-storage"
mkdir -p "$BASE"
ok=0; fail=0

while IFS="|" read -r bucket path mime; do
  [ -z "${bucket:-}" ] && continue
  dest="$BASE/$bucket/$path"
  mkdir -p "$(dirname "$dest")"

  code=$(curl -s -o "$dest" -w "%{http_code}" "$SRC/$bucket/$path")
  if [ "$code" != "200" ]; then
    echo "DOWNLOAD $code  $bucket/$path"
    fail=$((fail+1)); continue
  fi

  up=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$DST/$bucket/$path" \
        -H "Authorization: Bearer $KEY" \
        -H "Content-Type: $mime" \
        --data-binary @"$dest")
  case "$up" in
    200|201) ok=$((ok+1)) ;;
    *) echo "UPLOAD $up  $bucket/$path"; fail=$((fail+1)) ;;
  esac
done <<'LISTA'
playlist-thumbnails|playlists/57967985-86da-4b63-a2f3-684dfb8b5957/thumbnail|image/jpeg
playlist-thumbnails|playlists/a1b04fba-f396-464d-9ca2-389e1c9798fb/thumbnail|image/png
playlist-thumbnails|playlists/be0d5005-b2ae-4ce9-b5ba-5a190b9e54bc/thumbnail|image/jpeg
playlist-thumbnails|playlists/cb72b8ff-ad37-40fc-9200-befc7e4569e8/thumbnail|image/png
user-profile-images|07e11b57-faba-433d-adea-f12157d84a23/profile-picture|image/jpeg
user-profile-images|1bfa5684-6cf4-4cab-adec-afedd57aabd8/profile-picture|image/jpeg
user-profile-images|222d9dae-90fd-47fa-832d-da1c4d8b92aa/profile-picture|image/jpeg
user-profile-images|50be58ab-228f-418a-ab43-c2ef21297743/profile-picture|image/jpeg
user-profile-images|5ea3776e-17a3-4577-8258-2f4f5535a7a0/profile-picture|image/jpeg
user-profile-images|default.jpg|image/jpeg
user-profile-images|eed8ef50-12b2-41ba-987d-118a8b0d5f80/profile-picture|image/jpeg
user-profile-images|fd0d8e55-bdb6-4c19-810c-60aac91297d5/profile-picture|image/jpeg
LISTA

echo "----"
echo "enviados=$ok  falhas=$fail"
du -sh "$BASE" 2>/dev/null
