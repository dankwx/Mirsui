# 🎨 Paleta de Cores do Mirsui

Este documento descreve a paleta de cores consistente usada em todo o projeto Mirsui.

## 📋 Estrutura da Paleta

### 🟢 Primary (Cor Principal)
**Sage Green** - A cor principal do Mirsui, representa descoberta musical e natureza.

```css
--primary: 142 30% 45%        /* Sage Green padrão */
--primary-foreground: 0 0% 100%  /* Texto branco sobre primary */
--primary-hover: 142 35% 40%     /* Hover mais escuro */
```

**Uso no Tailwind:**
- `bg-primary` - Fundo verde sage
- `text-primary` - Texto verde sage
- `hover:bg-primary-hover` - Hover state
- `text-primary-foreground` - Texto sobre fundo primary

**Quando usar:**
- Botões principais (CTAs)
- Logo e elementos de marca
- Destaques importantes
- Navegação ativa

---

### 🔵 Secondary (Cor Secundária)
**Slate/Gray** - Cor neutra para elementos secundários.

```css
--secondary: 215 20% 65%         /* Slate neutro */
--secondary-foreground: 0 0% 100%  /* Texto branco sobre secondary */
--secondary-hover: 215 25% 55%     /* Hover mais escuro */
```

**Uso no Tailwind:**
- `bg-secondary` - Fundo cinza neutro
- `text-secondary` - Texto cinza
- `hover:bg-secondary-hover` - Hover state
- `text-secondary-foreground` - Texto sobre fundo secondary

**Quando usar:**
- Botões secundários
- Links de navegação
- Elementos de UI menos importantes

---

### 🟣 Accent (Cor de Destaque)
**Purple** - Para badges, interações e elementos que precisam chamar atenção.

```css
--accent: 270 60% 60%            /* Purple vibrante */
--accent-foreground: 0 0% 100%    /* Texto branco sobre accent */
--accent-hover: 270 65% 50%       /* Hover mais intenso */
```

**Uso no Tailwind:**
- `bg-accent` - Fundo roxo
- `text-accent` - Texto roxo
- `hover:bg-accent-hover` - Hover state
- `bg-accent/10` - Fundo roxo transparente (badges)

**Quando usar:**
- Badges de usuário
- Ícones de interação (likes, comments)
- Tags "early-bird"
- Avatares sem foto

---

### 🔷 Tertiary (Cor Terciária)
**Blue** - Para informações secundárias e dados.

```css
--tertiary: 217 91% 60%           /* Blue vibrante */
--tertiary-foreground: 0 0% 100%   /* Texto branco sobre tertiary */
--tertiary-hover: 217 91% 50%      /* Hover mais intenso */
```

**Uso no Tailwind:**
- `bg-tertiary` - Fundo azul
- `text-tertiary` - Texto azul
- `bg-tertiary/10` - Fundo azul transparente

**Quando usar:**
- Cards de informação
- Estatísticas
- Ícones informativos

---

### 🟢 Success (Sucesso)
**Green** - Para mensagens de sucesso e elementos positivos.

```css
--success: 142 76% 36%            /* Green vibrante */
--success-foreground: 0 0% 100%    /* Texto branco sobre success */
```

**Uso no Tailwind:**
- `bg-success` - Fundo verde sucesso
- `text-success` - Texto verde
- `bg-success/10` - Badge "high-potential"

**Quando usar:**
- Mensagens de sucesso
- Tags de alto potencial
- Indicadores positivos

---

### 🟡 Warning (Aviso)
**Orange/Yellow** - Para avisos e destaques importantes.

```css
--warning: 25 95% 53%             /* Orange/yellow */
--warning-foreground: 0 0% 100%    /* Texto branco sobre warning */
```

**Uso no Tailwind:**
- `bg-warning` - Fundo laranja
- `text-warning` - Texto laranja (ícone de coroa)
- `bg-warning/10` - Badge "primeiro-claim"

**Quando usar:**
- Tags de primeiro claim
- Ícones de verificação premium
- Avisos importantes

---

### 🔴 Destructive (Destrutivo)
**Red** - Para ações destrutivas e erros.

```css
--destructive: 0 84.2% 60.2%      /* Red vibrante */
--destructive-foreground: 0 0% 100% /* Texto branco sobre destructive */
```

**Uso no Tailwind:**
- `bg-destructive` - Fundo vermelho
- `text-destructive` - Texto vermelho

**Quando usar:**
- Botões de deletar
- Mensagens de erro
- Alertas críticos

---

### ⚫ Cores Neutras

```css
--background: 0 0% 100%           /* Branco (fundo principal) */
--foreground: 222.2 84% 4.9%      /* Preto azulado (texto principal) */
--muted: 210 40% 96.1%            /* Cinza muito claro (fundos secundários) */
--muted-foreground: 215.4 16.3% 46.9% /* Cinza médio (texto secundário) */
--border: 214.3 31.8% 91.4%       /* Cinza claro (bordas) */
--card: 0 0% 100%                 /* Branco (cards) */
```

**Uso no Tailwind:**
- `bg-background` - Fundo branco principal
- `text-foreground` - Texto preto principal
- `bg-muted` - Fundo cinza claro (feed, seções)
- `text-muted-foreground` - Texto secundário
- `border-border` - Bordas padrão
- `bg-card` - Fundo de cards

---

## 🌙 Dark Mode

O projeto está preparado para dark mode com variáveis ajustadas automaticamente:

```css
.dark {
  --primary: 142 35% 55%          /* Sage mais claro no dark */
  --accent: 270 60% 65%           /* Purple mais claro */
  --background: 222.2 84% 4.9%    /* Fundo escuro */
  --foreground: 210 40% 98%       /* Texto claro */
  /* ... e outras variáveis ajustadas */
}
```

---

## 📖 Como Usar

### ✅ Boas Práticas

```tsx
// ✅ BOM - Usando variáveis CSS
<Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
  Botão Principal
</Button>

<Badge className="bg-accent/10 text-accent border-accent/30">
  early-bird
</Badge>

<p className="text-muted-foreground">Texto secundário</p>
```

### ❌ Evitar

```tsx
// ❌ RUIM - Cores hardcoded
<Button className="bg-green-600 hover:bg-green-700 text-white">
  Botão
</Button>

<Badge className="bg-purple-100 text-purple-700 border-purple-300">
  badge
</Badge>

<p className="text-gray-600">Texto</p>
```

---

## 🎯 Guia Rápido de Uso

| Elemento | Classes Recomendadas |
|----------|---------------------|
| **Botão Principal** | `bg-primary hover:bg-primary-hover text-primary-foreground` |
| **Botão Secundário** | `bg-secondary hover:bg-secondary-hover text-secondary-foreground` |
| **Card** | `bg-card border-border` |
| **Fundo da Página** | `bg-muted` ou `bg-background` |
| **Texto Principal** | `text-foreground` |
| **Texto Secundário** | `text-muted-foreground` |
| **Badge Roxo** | `bg-accent/10 text-accent border-accent/30` |
| **Badge Verde** | `bg-success/10 text-success border-success/30` |
| **Badge Laranja** | `bg-warning/10 text-warning border-warning/30` |
| **Ícone Destaque** | `text-accent` |
| **Ícone Coroa** | `text-warning` |

---

## 🔄 Migração de Cores Antigas

Se você encontrar cores antigas no código, aqui está a tabela de conversão:

| Cor Antiga | Nova Variável |
|------------|---------------|
| `slate-*` | `secondary` ou `muted-foreground` |
| `purple-*` | `accent` |
| `sage-*` | `primary` |
| `blue-*` | `tertiary` |
| `gray-*` | `muted` ou `muted-foreground` |
| `orange-*` | `warning` |
| `green-*` | `success` |
| `red-*` | `destructive` |

---

## 🛠️ Customização

Para modificar as cores globalmente, edite o arquivo `app/globals.css`:

```css
:root {
  --primary: 142 30% 45%;  /* Altere aqui para mudar a cor principal */
  /* ... outras variáveis */
}
```

As mudanças serão aplicadas automaticamente em todo o projeto! 🎉
