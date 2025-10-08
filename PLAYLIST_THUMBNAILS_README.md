# Configuração de Thumbnails para Playlists

Este documento explica como configurar o sistema de upload de thumbnails para playlists no SoundSage.

## Pré-requisitos

- Projeto Supabase configurado
- Bucket de storage configurado
- Tabelas de playlists já criadas

## Passos para Configuração

### 1. Configurar o Storage no Supabase

Execute o script `supabase_storage_setup.sql` no SQL Editor do Supabase para:
- Criar o bucket `playlist-thumbnails`
- Configurar as políticas de segurança para upload/visualização

### 2. Atualizar o Banco de Dados

Se você já tem o banco configurado, execute `supabase_update_existing.sql` para:
- Adicionar a coluna `thumbnail_url` na tabela `playlists`
- Atualizar a função `get_user_playlists()` para incluir o thumbnail

Se você está configurando do zero, use `supabase_library_setup.sql` que já inclui tudo.

### 3. Variáveis de Ambiente

Certifique-se de que seu `.env.local` tem:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

## Como Usar

### Para os Usuários

1. **Visualizar Playlists**: As thumbnails aparecerão nos cards das playlists
2. **Alterar Thumbnail**: Clique na área da imagem do card da playlist
3. **Upload**: Selecione uma imagem (JPG, PNG, GIF - máximo 5MB)
4. **Visualização**: A thumbnail será atualizada imediatamente

### Para Desenvolvedores

#### Componentes Criados

- `PlaylistThumbnailUpload.tsx`: Modal para upload de thumbnails
- Atualizado `LibraryTabs.tsx`: Renderização e gerenciamento de thumbnails

#### Serviços Atualizados

- `libraryService.client.ts`: Adicionada função `uploadPlaylistThumbnail()`
- Interfaces atualizadas para incluir `thumbnail_url`

#### Estrutura de Pastas no Storage

```
playlist-thumbnails/
  ├── playlists/
  │   ├── {playlist_id}/
  │   │   └── thumbnail
```

## Funcionalidades

- ✅ Upload de imagens para playlists
- ✅ Validação de tipo e tamanho de arquivo
- ✅ Atualização em tempo real da interface
- ✅ Políticas de segurança (usuários só podem alterar suas próprias playlists)
- ✅ Fallback para ícone padrão quando não há thumbnail
- ✅ Compressão automática pelo Supabase
- ✅ URL pública para as imagens

## Tipos de Arquivo Suportados

- **Formatos**: JPG, PNG, GIF
- **Tamanho máximo**: 5MB
- **Recomendado**: Imagens quadradas (1:1) para melhor visualização

## Troubleshooting

### Erro ao fazer upload
1. Verifique se o bucket `playlist-thumbnails` foi criado
2. Confirme que as políticas de storage estão ativas
3. Verifique as permissões da playlist (só o dono pode alterar)

### Imagem não aparece
1. Confirme que a URL foi salva no banco de dados
2. Verifique se o bucket está público
3. Teste a URL diretamente no navegador

### Políticas de RLS
As políticas garantem que:
- Qualquer pessoa pode ver thumbnails públicas
- Apenas o dono da playlist pode fazer upload/alterar
- O path do storage segue o padrão: `playlists/{playlist_id}/thumbnail`