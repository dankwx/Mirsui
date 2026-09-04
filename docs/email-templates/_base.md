# Templates de e-mail do GoTrue

Os quatro arquivos `.html` desta pasta são os corpos dos e-mails transacionais
do Auth. Eles existem porque **template de e-mail não vem no `pg_dump`**: no
Supabase hospedado eles são configurados pelo painel, e o painel não vai para o
git. Quando o projeto na nuvem foi bloqueado por cota, o que havia lá se perdeu
junto com o acesso — estes aqui são novos, não uma restauração.

## Como o GoTrue os carrega

As variáveis `GOTRUE_MAILER_TEMPLATES_*` recebem **URL, não HTML**. O nginx
serve esta pasta em `https://db.mirsui.com/email-templates/`, e o GoTrue busca
de lá na hora de montar cada mensagem. Não tem segredo nenhum nos arquivos — são
HTML com placeholder.

Consequência prática: **editar um arquivo aqui muda o e-mail sem reiniciar
container nenhum.** Basta o `rsync` para a VPS.

## Placeholders disponíveis

| | |
|---|---|
| `{{ .ConfirmationURL }}` | o link inteiro, já com token e `redirect_to` |
| `{{ .Token }}` | o código de 6 dígitos, para quem prefere digitar |
| `{{ .Email }}` | o endereço do destinatário |
| `{{ .NewEmail }}` | só na troca de e-mail: o endereço novo |
| `{{ .SiteURL }}` | `https://www.mirsui.com` |

## Sobre a forma

HTML de e-mail não é HTML de site: Gmail e Outlook cortam `<style>` externo,
ignoram boa parte de flexbox e grid, e alguns clientes descartam a tag `<head>`
inteira. Por isso tudo aqui é **inline**, em tabela, sem imagem e sem fonte
externa. É feio de escrever e é o que chega inteiro do outro lado.

Sem gradiente, sem emoji, sem "Olá, querido usuário". Um parágrafo, um botão,
e o link em texto embaixo para quem tem o botão bloqueado — que é a metade dos
clientes de e-mail corporativo.

## Os assuntos

Ficam no `.env` do compose (`SMTP_SUBJECT_*` → `GOTRUE_MAILER_SUBJECTS_*`), não
aqui. São texto puro, sem placeholder.
