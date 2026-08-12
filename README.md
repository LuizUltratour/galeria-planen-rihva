# Galeria — GHC Vertus Fascinna

Galeria de imagens/plantas/vídeo para injeção via script no 3DVista, hospedada no AWS S3.

**Empreendimento:** Vertus Fascinna — João Pessoa / PB
**Incorporadora:** GHC
**Tema:** creme + verde-oliva (`#FBF0E5` / `#2E3820`)

---

## URLs de produção

| Arquivo | URL |
|---------|-----|
| Galeria | `https://skylineip.s3.sa-east-1.amazonaws.com/Tour+Virtual/ghc/vertus+fascinna/ferramentas/galeria/index.html` |
| Vídeo   | `https://skylineip.s3.sa-east-1.amazonaws.com/Tour+Virtual/ghc/vertus+fascinna/ferramentas/galeria/video-gallery.html` |
| Fachada Interativa | `https://skylineip.s3.sa-east-1.amazonaws.com/Tour+Virtual/ghc/vertus+fascinna/ferramentas/galeria/fachada-interativa.html` |
| Script  | `https://skylineip.s3.sa-east-1.amazonaws.com/Tour+Virtual/ghc/vertus+fascinna/ferramentas/galeria/inject.js` |

**S3 path:** `s3://skylineip/Tour Virtual/ghc/vertus fascinna/ferramentas/galeria/`

---

## Estrutura de arquivos

```
galeria/  (ghc / vertus fascinna)
├── index.html              ← galeria de imagens + plantas (auto-suficiente)
├── video-gallery.html      ← player do vídeo de apresentação
├── fachada-interativa.html ← fachada 3D interativa por faixa de andares (auto-suficiente — ver nota abaixo)
├── inject.js               ← loader leve para injeção no 3DVista
├── deploy.ps1               ← deploy para o S3 (Windows; normaliza case + sync)
├── generate_thumbs.ps1      ← gerador de thumbnails (Windows/GDI+, sem deps)
├── generate_thumbs.py       ← gerador alternativo (Python + Pillow)
└── assets/
    ├── imagens/
    │   ├── fachada/                    ← 5 ângulos de fachada
    │   ├── aereas/                     ← inserção urbana + voo de pássaro
    │   ├── lazer/
    │   │   ├── piscina/                ← deck, cabana, espreguiçadeira, raia
    │   │   ├── patio/                  ← pátio interno (lounge, jardim, espelho d'água)
    │   │   ├── praca/                  ← praça de gentileza urbana
    │   │   ├── gourmet/                ← terraço, churrasqueira, mesa comunitária, salão
    │   │   ├── kids/                   ← playground + espaço kids
    │   │   └── comum/                  ← sala de jogos, academia, recepção
    │   └── residencial/
    │       ├── apto-103/               ← sala + quarto (unidade padrão)
    │       └── apto-106/               ← sala ampliada + garden (unidade garden)
    ├── plantas/
    │   ├── implantacoes/                ← subsolo → cobertura (8 pavimentos, sobreposição)
    │   └── unidades/                    ← colunas 01–04 + coluna 06 (padrão × sala ampliada)
    ├── video/                           ← apresentacao.mp4 (gitignored; sobe ao S3 com -WithVideo)
    └── thumbs/                          ← gerado automaticamente (espelha a árvore, .jpg)
```

> **Pastas = categorias.** Os nomes das pastas em `assets/` definem as categorias/subcategorias.
> Mantenha-os **minúsculos e sem espaços/acentos** (o S3 é case-sensitive).

---

## Categorias da galeria

### Modo `imagens`

| Categoria | Label | Sub-categorias | Pasta |
|-----------|-------|----------------|-------|
| `fachada` | Fachada | — | `assets/imagens/fachada/` |
| `aereas` | Aéreas | — | `assets/imagens/aereas/` |
| `lazer` | Lazer | Piscina · Pátio Interno · Praça · Gourmet · Kids & Playground · Áreas Comuns | `assets/imagens/lazer/*` |
| `residencial` | Residências | Apartamento 103 · Apartamento 106 · Garden | `assets/imagens/residencial/*` |

### Modo `plantas`

| Tipologia | Label | Formato |
|-----------|-------|---------|
| `pl-implantacoes` | Implantações | card único de abas (8 pavimentos: subsolo → cobertura) com alternância/sobreposição |
| `pl-unidades` | Apartamentos | cards individuais (colunas 01–04) + card de abas para a coluna 06 (padrão × sala ampliada, com botão "Sobrepor") |

---

## Cards de plantas com sobreposição (`cobertura-plan`)

Plantas que são **variantes de um mesmo conjunto** são agrupadas num único card com abas
que alternam (e sobrepõem, na mesma posição de tela) as variantes. Com **exatamente 2
variantes** aparece também o botão de **sobreposição** (comparação lado a lado no lightbox);
com mais de duas, a alternância acontece pelas abas.

- **Implantações** — 8 pavimentos (subsolo, térreo, 1º a 5º pavimento tipo, cobertura)
  alternados nas abas do mesmo card, todos com a mesma planta de base do edifício.
- **Apartamento Coluna 06 · Garden** — planta padrão sobreposta à variante com sala
  ampliada, com botão "Sobrepor planta padrão e sala ampliada".

---

## Fachada Interativa (`fachada-interativa.html`)

Tela auto-suficiente (HTML + CSS + JS inline, sem build) que apresenta a torre em 3D e
permite explorar as vistas 360° por **faixa de andares**. Abre como overlay do 3DVista
(via `AbrirFachada`, ver integração) e, ao escolher um andar, navega o tour para o
panorama correspondente por `setMediaByIndex` — sem recarregar.

> **Pendente para este empreendimento:** a tela espera os recortes de fachada em
> `assets/fachada-interativa-assets/` (torre inteira + estados por faixa + partes
> separadas, PNG 1038×1080 — ver formato abaixo). Esses PNGs específicos da Vertus
> Fascinna ainda não foram gerados/entregues; até lá, `AbrirFachada()` monta a tela mas
> ela fica sem imagem. Os índices de `setMediaByIndex` em `FI.bands[].floors` também
> precisam ser conferidos/ajustados para o tour real deste empreendimento.

### Assets — `assets/fachada-interativa-assets/` (PNG, 1038 × 1080)

| Arquivo | Papel |
|---------|-------|
| `fachada-integral.png` | Torre inteira sólida — **estado normal** (repouso). |
| `1-5-selected.png`, `6-10-selected.png`, `11-cob-selected.png` | Torre com **uma faixa em foco** (sólida) e o restante fantasma. Camadas de **cross-fade**. |
| `partes-separadas/{1-5,6-10,11-cob}.png` | Recorte isolado de cada faixa — a peça que **desliza para fora** ao destacar. |

As camadas ficam empilhadas e alinhadas ao mesmo quadro 1038 × 1080; a troca é por opacidade.

### Interação

- **Desktop** — hover numa faixa faz cross-fade `integral → -selected`; o clique **trava**
  a faixa e o recorte **desliza para fora** como destaque. O painel lateral lista as vistas
  360°; o botão **"Conheça a localização"** fica fixo no rodapé do painel.
- **Mobile (≤ 820 px)** — fachada em **tela cheia**; toca-se direto nas **regiões da torre**
  (rótulos visíveis) → destaque + um **popup (bottom-sheet) semitransparente** sobe com os
  andares daquela faixa. Botão **"Conheça a localização"** fixo no rodapé do palco.
- **"Conheça a localização"** (ambos) → `goToPanorama(3)` — navega o tour para a mídia de
  índice **3** (cena de localização, a conferir para este tour).

### Comunicação com o tour (`postMessage`)

A tela roda dentro de um iframe e conversa com o `inject.js` na janela-pai:

| Mensagem | Efeito no `inject.js` |
|----------|-----------------------|
| `{ action:'goToPanorama', mediaIndex:N }` | `setMediaByIndex(N)` + `toggleAny(hide/show)` + fecha a fachada |
| `{ action:'closeGallery' }` | Fecha o overlay |

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

> Alternativa multiplataforma: `python generate_thumbs.py` (requer Python + Pillow).

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
  s.src = 'https://skylineip.s3.sa-east-1.amazonaws.com/Tour+Virtual/ghc/vertus+fascinna/ferramentas/galeria/inject.js?v=' + Date.now();
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

**Fachada interativa** — chamar na *action* do 3DVista (onde `this` é o player e os IDs são válidos):

```js
AbrirFachada(this);                          // abre a fachada
AbrirFachada(this, this.getComponentByName("Tela-Inicial").mH);   // + oculta uma tela ao escolher andar
AbrirFachada(this, hideId, showId);          // + oculta hideId e exibe showId ao escolher andar
AbrirFachada(0);                             // fecha
```

> Ao escolher um andar (ou "Conheça a localização"), a fachada troca o panorama via
> `setMediaByIndex`, aplica os `toggleAny(hide/show)` e fecha — sem recarregar o tour.

---

## Cores e tipografia

Tema **creme + verde-oliva** da Vertus Fascinna / GHC:

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
