# Galeria — Planen Rihva

Galeria de imagens/plantas/vídeo para injeção via script no 3DVista, hospedada no AWS S3.

**Empreendimento:** Rihva — Planen
**Tema:** creme + verde-oliva (`#FBF0E5` / `#2E3820`)

---

## URLs de produção

| Arquivo | URL |
|---------|-----|
| Galeria | `https://skylineip.s3.sa-east-1.amazonaws.com/Tour+Virtual/planen/galeria-planen-rihva/index.html` |
| Vídeo   | `https://skylineip.s3.sa-east-1.amazonaws.com/Tour+Virtual/planen/galeria-planen-rihva/video-gallery.html` |
| Script  | `https://skylineip.s3.sa-east-1.amazonaws.com/Tour+Virtual/planen/galeria-planen-rihva/inject.js` |

**S3 path:** `s3://skylineip/Tour Virtual/planen/galeria-planen-rihva/`

---

## Estrutura de arquivos

```
galeria/  (planen / rihva)
├── index.html              ← galeria de imagens + plantas (auto-suficiente)
├── video-gallery.html      ← player do vídeo de apresentação
├── inject.js               ← loader leve para injeção no 3DVista
├── deploy.ps1               ← deploy para o S3 (Windows; normaliza case + sync)
├── generate_thumbs.ps1      ← gerador de thumbnails (Windows/GDI+, sem deps)
└── assets/
    ├── imagens/
    │   ├── fachadas/                    ← vistas arquitetônicas da fachada
    │   └── areas comuns/                ← hall, salão de festas, gourmet, academia,
    │                                       jogos, pet place, piscina, área externa,
    │                                       delivery, garagem
    ├── plantas/                         ← implantação humanizada (térreo, garagens,
    │                                       lazer, apto tipo, apto 01–03, duplex)
    └── thumbs/                          ← gerado automaticamente (espelha a árvore, .jpg)
```

> **Pastas = categorias.** Os nomes das pastas em `assets/` definem as categorias/subcategorias.
> Mantenha-os **minúsculos e sem espaços/acentos** (o S3 é case-sensitive) — nomes de
> arquivo com acento precisam estar em Unicode NFC (precomposto), não NFD.

---

## Categorias da galeria

### Modo `imagens`

| Categoria | Label | Sub-categorias | Pasta |
|-----------|-------|----------------|-------|
| `fachada` | Fachada | — | `assets/imagens/fachadas/` |
| `areas-comuns` | Áreas Comuns | Hall de Entrada · Hall Superior · Salão de Festas · Gourmet · Academia · Sala de Jogos · Pet Place · Piscina · Área Externa · Delivery · Garagem | `assets/imagens/areas comuns/` |

### Modo `plantas`

Categoria única `plantas`, sem sub-filtro — mostra todos os pavimentos/tipos em grade
(implantação humanizada: térreo, garagens G1/G2, lazer, apto tipo, apto 01–03, pavimento
com duplex, duplex inferior/superior). Pasta: `assets/plantas/`.

---

## Thumbnails

Todo `src` da grade usa um `thumb` leve (**900 px, JPEG q82**, achatado sobre branco).
Geração **sem dependências** no Windows via GDI+:

```powershell
./generate_thumbs.ps1          # gera apenas os que faltam / desatualizados
./generate_thumbs.ps1 -Force   # regenera todos
```

O script espelha `assets/` em `assets/thumbs/` (sempre `.jpg`, caminho minúsculo),
ignora `thumbs/`, `video/` e o PDF.

---

## Deploy AWS S3

> **Windows:** use o script pronto `./deploy.ps1`. Requer **AWS CLI** + `aws configure` (região `sa-east-1`).

```powershell
./deploy.ps1              # sync completo (sem o vídeo) + cache-control no HTML/JS
./deploy.ps1 -WithVideo   # inclui o vídeo de apresentação (~200 MB) — necessário na 1ª vez / ao trocá-lo
./deploy.ps1 -QuickHtml   # atualiza só index.html e inject.js (rápido)
```

O vídeo fica de fora do sync padrão (o `--exclude` também o protege do `--delete`),
então uma vez enviado com `-WithVideo` ele permanece no S3 nas próximas sincronizações.

> **`--cache-control "no-cache,no-store,must-revalidate"`** no HTML/JS — garante que o
> 3DVista nunca sirva uma versão cacheada da galeria ou do script.

---

## Integração 3DVista

### Passo 1 — Loader (JavaScript global do projeto)

```js
(function(){
  var s = document.createElement('script');
  s.src = 'https://skylineip.s3.sa-east-1.amazonaws.com/Tour+Virtual/planen/galeria-planen-rihva/inject.js?v=' + Date.now();
  document.head.appendChild(s);
})();
```

> **`?v=` + `Date.now()`** — cache-busting: força o browser a baixar sempre a versão mais
> recente do script, evitando que o 3DVista sirva uma versão antiga em cache.

### Passo 2 — Acionar nos hotspots/botões

```js
GaleriaImagens(1);      // abre galeria de imagens   · GaleriaImagens(0) fecha
GaleriaPlantas(1);      // abre galeria de plantas    · GaleriaPlantas(0) fecha
AbrirGaleriaVideos(1);  // abre o vídeo de apresentação · AbrirGaleriaVideos(0) fecha
```

---

## Cores e tipografia

Tema **creme + verde-oliva** da Planen Rihva:

| Token CSS | Valor | Papel |
|-----------|-------|-------|
| `--bg` (fundo) | `#FBF0E5` | Creme — fundo principal |
| `--surface` | `#F1E4D7` | Superfície de card (skeleton) |
| `--dark` (foreground) | `#2E3820` | Texto/ícones — verde-oliva |
| `--accent` | `#2E3820` | Verde-oliva — destaque / estado ativo |
| Lightbox | `#1c2213` | Verde quase preto — palco da imagem/vídeo |
| Fonte títulos | Cormorant Garamond | — |
| Fonte UI | Inter | — |

> Cards de plantas mantêm **fundo branco** (legibilidade do desenho), com texto verde-oliva.
