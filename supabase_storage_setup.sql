-- Script para configurar o storage de thumbnails de playlists no Supabase
-- Execute este script no SQL Editor do Supabase

-- Primeiro, vamos criar o bucket no storage (se não existir)
-- IMPORTANTE: Este comando pode dar erro se o bucket já existir, mas é normal

INSERT INTO storage.buckets (id, name, public)
VALUES ('playlist-thumbnails', 'playlist-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Definir políticas de storage para o bucket playlist-thumbnails

-- Política para permitir que usuários vejam thumbnails de playlists
CREATE POLICY "Public can view playlist thumbnails" ON storage.objects
FOR SELECT USING (bucket_id = 'playlist-thumbnails');

-- Política para permitir que usuários autenticados façam upload de thumbnails para suas próprias playlists
CREATE POLICY "Users can upload thumbnails to their playlists" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'playlist-thumbnails' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir que usuários atualizem thumbnails de suas próprias playlists
CREATE POLICY "Users can update their playlist thumbnails" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'playlist-thumbnails' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir que usuários deletem thumbnails de suas próprias playlists
CREATE POLICY "Users can delete their playlist thumbnails" ON storage.objects
FOR DELETE USING (
  bucket_id = 'playlist-thumbnails' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Nota: As políticas acima assumem que a estrutura do path será:
-- playlists/{playlist_id}/thumbnail
-- onde {playlist_id} corresponde ao ID da playlist no banco de dados