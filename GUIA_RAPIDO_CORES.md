# 🎨 Guia Rápido de Cores - Mirsui

## 🎯 Uso Comum por Contexto

### 🔘 Botões

```tsx
// Botão Principal (CTA)
<Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
  Explorar músicas
</Button>

// Botão Secundário
<Button className="bg-secondary hover:bg-secondary-hover text-secondary-foreground">
  Ver mais
</Button>

// Botão Outline
<Button variant="outline" className="border-border hover:bg-muted">
  Cancelar
</Button>

// Botão Destrutivo
<Button className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
  Deletar
</Button>
```

### 🏷️ Badges

```tsx
// Badge Roxo (Early Bird)
<Badge className="bg-accent/10 text-accent border-accent/30">
  early-bird
</Badge>

// Badge Laranja (Primeiro Claim)
<Badge className="bg-warning/10 text-warning border-warning/30">
  primeiro-claim
</Badge>

// Badge Verde (Alto Potencial)
<Badge className="bg-success/10 text-success border-success/30">
  high-potential
</Badge>

// Badge Padrão
<Badge variant="secondary">
  Badge Neutro
</Badge>
```

### 📦 Cards

```tsx
// Card Padrão
<Card className="bg-card border-border">
  <CardContent>Conteúdo</CardContent>
</Card>

// Card com Hover
<Card className="bg-card border-border hover:shadow-lg hover:shadow-accent/10 transition-shadow">
  <CardContent>Conteúdo</CardContent>
</Card>

// Card com Gradiente Primary
<Card className="bg-gradient-to-br from-primary/10 via-card/60 to-primary/5 border-border">
  <CardContent>Destaque</CardContent>
</Card>
```

### ✏️ Textos

```tsx
// Título Principal
<h1 className="text-foreground">Título Principal</h1>

// Subtítulo
<h2 className="text-foreground/90">Subtítulo</h2>

// Texto Corpo
<p className="text-foreground">Texto normal</p>

// Texto Secundário
<p className="text-muted-foreground">Texto secundário</p>

// Texto com Destaque
<span className="text-accent">Destaque roxo</span>

// Link
<a href="#" className="text-accent hover:text-accent-hover hover:underline">
  Link
</a>
```

### 🎨 Backgrounds

```tsx
// Background Principal da Página
<div className="min-h-screen bg-background">

// Background com Gradiente
<div className="min-h-screen bg-gradient-to-b from-muted to-background">

// Background Muted (Seções)
<section className="bg-muted">

// Background de Card
<div className="bg-card">

// Background com Transparência
<div className="bg-background/70 backdrop-blur-xl">
```

### 🖼️ Ícones

```tsx
import { Music, Crown, Target } from 'lucide-react'

// Ícone Primary (Logo, Música)
<Music className="h-5 w-5 text-primary" />

// Ícone Accent (Interações, Badges)
<Target className="h-5 w-5 text-accent" />

// Ícone Warning (Coroa, Primeiro)
<Crown className="h-5 w-5 text-warning" />

// Ícone Muted (Secundário)
<Music className="h-5 w-5 text-muted-foreground" />
```

### 🎭 Avatares

```tsx
// Avatar com Gradiente Tertiary
<AvatarFallback className="bg-gradient-to-br from-tertiary to-tertiary-hover text-tertiary-foreground">
  DK
</AvatarFallback>

// Avatar com Accent
<AvatarFallback className="bg-accent/10 text-accent">
  JS
</AvatarFallback>
```

### 🔲 Bordas

```tsx
// Borda Padrão
<div className="border border-border">

// Borda com Hover Accent
<div className="border border-border hover:border-accent/50">

// Sem Borda (Transparente)
<div className="border-0">
```

### 🌈 Gradientes

```tsx
// Gradiente Primary (Verde)
<div className="bg-gradient-to-r from-primary to-primary-hover">

// Gradiente Accent (Roxo)
<div className="bg-gradient-to-br from-accent to-accent-hover">

// Gradiente Tertiary (Azul)
<div className="bg-gradient-to-br from-tertiary to-tertiary-hover">

// Gradiente Multi-cor (Backgrounds Decorativos)
<div className="bg-gradient-to-br from-primary/20 via-accent/20 to-tertiary/20 blur-3xl">
```

### 🔔 Estados de UI

```tsx
// Estado de Hover
className="hover:bg-accent/10 hover:text-accent"

// Estado Ativo/Selecionado
className="bg-accent/20 text-accent border-accent"

// Estado Disabled
className="opacity-50 cursor-not-allowed"

// Estado de Foco
className="focus:ring-2 focus:ring-accent focus:ring-offset-2"
```

---

## 🎨 Paleta de Cores Visual

```
🟢 Primary (Sage Green)
   └─ Uso: Botões principais, logo, marca
   └─ Classes: bg-primary, text-primary, border-primary

🔵 Secondary (Slate Gray)
   └─ Uso: Botões secundários, elementos neutros
   └─ Classes: bg-secondary, text-secondary

🟣 Accent (Purple)
   └─ Uso: Badges, interações, destaques
   └─ Classes: bg-accent, text-accent, border-accent

🔷 Tertiary (Blue)
   └─ Uso: Informações, avatares, dados
   └─ Classes: bg-tertiary, text-tertiary

🟢 Success (Green)
   └─ Uso: Mensagens de sucesso, confirmações
   └─ Classes: bg-success, text-success

🟡 Warning (Orange)
   └─ Uso: Avisos, primeiro claim, coroa
   └─ Classes: bg-warning, text-warning

🔴 Destructive (Red)
   └─ Uso: Erros, ações destrutivas
   └─ Classes: bg-destructive, text-destructive

⚫ Neutral (Gray Scale)
   └─ background: Fundo branco principal
   └─ foreground: Texto preto principal
   └─ muted: Fundos cinza claro
   └─ muted-foreground: Texto secundário cinza
   └─ border: Bordas cinza claro
   └─ card: Fundo de cards (branco)
```

---

## 🚦 Decisões Rápidas

**Quando usar cada cor?**

| Se você precisa de... | Use... |
|----------------------|---------|
| Botão principal (CTA) | `bg-primary` |
| Botão secundário | `bg-secondary` |
| Badge de destaque | `bg-accent/10 text-accent` |
| Badge de warning | `bg-warning/10 text-warning` |
| Badge de sucesso | `bg-success/10 text-success` |
| Ícone de música/logo | `text-primary` |
| Ícone de interação | `text-accent` |
| Ícone de coroa | `text-warning` |
| Texto principal | `text-foreground` |
| Texto secundário | `text-muted-foreground` |
| Fundo de página | `bg-background` ou `bg-muted` |
| Fundo de card | `bg-card` |
| Borda padrão | `border-border` |
| Avatar sem foto | `bg-tertiary` ou `bg-accent/10` |

---

## 💡 Dicas Pro

1. **Transparência**: Use `/10`, `/20`, `/30` para versões transparentes
   ```tsx
   bg-accent/10  // 10% opacidade
   bg-primary/20 // 20% opacidade
   ```

2. **Hover States**: Sempre use a variante `-hover` quando disponível
   ```tsx
   hover:bg-primary-hover
   hover:bg-accent-hover
   ```

3. **Acessibilidade**: Texto sobre backgrounds coloridos deve usar `-foreground`
   ```tsx
   bg-primary text-primary-foreground
   bg-accent text-accent-foreground
   ```

4. **Consistência**: Se um elemento é clicável, use hover com a mesma cor em transparente
   ```tsx
   hover:bg-accent/10 hover:text-accent
   ```

---

**Última atualização:** 30 de Outubro de 2025
