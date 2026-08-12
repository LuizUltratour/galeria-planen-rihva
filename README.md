# Galeria — Nuar Residence (Tauf)

Galeria de imagens/plantas/vídeo para injeção via script no 3DVista, hospedada no AWS S3.

**Empreendimento:** Nuar Residence — Balneário Piçarras / SC
**Incorporadora:** Tauf
**Tema:** areia + marrom (`#E6E2DC` / `#442702`)

---

## URLs de produção

| Arquivo | URL |
|---------|-----|
| Galeria | `https://skylineip.s3.sa-east-1.amazonaws.com/Tour+Virtual/tauf/ferramentas/galeria/index.html` |
| Vídeo   | `https://skylineip.s3.sa-east-1.amazonaws.com/Tour+Virtual/tauf/ferramentas/galeria/video-gallery.html` |
| Fachada Interativa | `https://skylineip.s3.sa-east-1.amazonaws.com/Tour+Virtual/tauf/ferramentas/galeria/fachada-interativa.html` |
| Script  | `https://skylineip.s3.sa-east-1.amazonaws.com/Tour+Virtual/tauf/ferramentas/galeria/inject.js` |

**S3 path:** `s3://skylineip/Tour Virtual/tauf/ferramentas/galeria/`

---

## Estrutura de arquivos

```
galeria/  (tauf / nuar)
├── index.html              ← galeria de imagens + plantas (auto-suficiente)
├── video-gallery.html      ← player do vídeo teaser
├── fachada-interativa.html ← fachada 3D interativa por faixa de andares (auto-suficiente)
├── inject.js               ← loader leve para injeção no 3DVista
├── deploy.ps1              ← deploy para o S3 (Windows; normaliza case + sync)
├── generate_thumbs.ps1     ← gerador de thumbnails (Windows/GDI+, sem deps)
├── generate_thumbs.py      ← gerador alternativo (Python + Pillow)
└── assets/
    ├── fachada/             ← torre, embasamento, detalhes de fachada
    ├── fachada-interativa-assets/   ← PNGs da fachada interativa (ver seção abaixo)
    │   └── partes-separadas/        ← recortes das faixas que deslizam no destaque
    ├── aereas/              ← voo de pássaro + fotomontagem (inserção urbana)
    ├── residencial/
    │   ├── tipo/            ← interiores Residências Tipo (182 m²)
    │   └── duplex/          ← interiores Residências Duplex (300 m²)
    ├── lazer/               ← piscinas, academia, festas, gourmet, jogos, kids, garagem
    ├── plantas/             ← térreo, lazer, tipo-182, duplex-inferior/superior (.png)
    ├── video/               ← teaser-nuar.mp4 (gitignored; sobe ao S3 com -WithVideo)
    ├── thumbs/              ← gerado automaticamente (espelha a árvore, .jpg)
    └── Book Digital Nuar - FINAL ALTA.pdf   ← book de referência (gitignored)
```

> **Pastas = categorias.** Os nomes das pastas em `assets/` definem as categorias/subcategorias.
> Mantenha-os **minúsculos e sem espaços/acentos** (o S3 é case-sensitive).

---

## Categorias da galeria

### Modo `imagens`

| Categoria | Label | Sub-categorias | Pasta |
|-----------|-------|----------------|-------|
| `fachada` | Fachada | — | `assets/fachada/` |
| `aereas` | Aéreas | — | `assets/aereas/` |
| `residencial` | Residências | Tipo · Duplex | `assets/residencial/*` |
| `lazer` | Lazer | — | `assets/lazer/` |

### Modo `plantas`

| Tipologia | Label | Formato |
|-----------|-------|---------|
| `pl-terreo-lazer` | Térreo & Lazer | card de abas (2 pisos) + "Sobrepor térreo + lazer" |
| `pl-tipo` | Tipo | card individual (182 m²) |
| `pl-duplex` | Duplex | card de abas (2 pisos) + "Sobrepor os dois pisos" |

---

## Cards de plantas com sobreposição (`cobertura-plan`)

Plantas que são **níveis de um mesmo conjunto** são agrupadas num único card com abas
que alternam (e sobrepõem) as variantes. Com **exatamente 2 pisos** aparece também o
botão de **sobreposição** (comparação lado a lado no lightbox).

- **Térreo & Lazer** — térreo (1º pav.) sobreposto ao lazer (4º pav.).
- **Duplex** — piso inferior (17º) sobreposto ao piso superior (18º).

---

## Fachada Interativa (`fachada-interativa.html`)

Tela auto-suficiente (HTML + CSS + JS inline, sem build) que apresenta a torre em 3D e
permite explorar as vistas 360° por **faixa de andares**. Abre como overlay do 3DVista
(via `AbrirFachada`, ver integração) e, ao escolher um andar, navega o tour para o
panorama correspondente por `setMediaByIndex` — sem recarregar.

### Assets — `assets/fachada-interativa-assets/` (PNG, 1038 × 1080)

| Arquivo | Papel |
|---------|-------|
| `fachada-integral.png` | Torre inteira sólida — **estado normal** (repouso). |
| `1-5-selected.png`, `6-10-selected.png`, `11-cob-selected.png` | Torre com **uma faixa em foco** (sólida) e o restante fantasma. Camadas de **cross-fade**. |
| `partes-separadas/{1-5,6-10,11-cob}.png` | Recorte isolado de cada faixa — a peça que **desliza para fora** ao destacar. |

As camadas ficam empilhadas e alinhadas ao mesmo quadro 1038 × 1080; a troca é por opacidade.

### Faixas e mapeamento andar → índice do panorama

Os `idx` são passados para `setMediaByIndex(idx)` do 3DVista. Passo de **3**, sempre
listados **do mais alto para o mais baixo**:

| Faixa | Andares (label → idx) |
|-------|-----------------------|
| **11º a Cobertura** | Cobertura=6 · 14º=9 · 13º=12 · 12º=15 · 11º=18 |
| **6º ao 10º** | 10º=21 · 9º=24 · 8º=27 · 7º=30 · 6º=33 |
| **Lazer ao 5º** | 5º=36 · 4º=39 · 3º=42 · 2º=45 · 1º=48 · Lazer=51 |

> Os índices vivem no objeto `FI.bands[].floors` no topo do `<script>` de
> `fachada-interativa.html`. Se uma vista abrir deslocada, ajuste ali.

### Interação

- **Desktop** — hover numa faixa faz cross-fade `integral → -selected`; o clique **trava**
  a faixa e o recorte **desliza para fora** como destaque. O painel lateral lista as vistas
  360°; o botão **"Conheça a localização"** fica fixo no rodapé do painel.
- **Mobile (≤ 820 px)** — fachada em **tela cheia**; toca-se direto nas **regiões da torre**
  (rótulos visíveis) → destaque + um **popup (bottom-sheet) semitransparente** sobe com os
  andares daquela faixa. Botão **"Conheça a localização"** fixo no rodapé do palco.
- **"Conheça a localização"** (ambos) → `goToPanorama(3)` — navega o tour para a mídia de
  índice **3** (cena de localização).

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
ignora `thumbs/`, `video/` e o PDF. Última geração: **47 MB → 2,8 MB** (37 imagens).

> Alternativa multiplataforma: `python generate_thumbs.py` (requer Python + Pillow).

---

## Deploy AWS S3

> **Windows:** use o script pronto `./deploy.ps1`. Requer **AWS CLI** + `aws configure` (região `sa-east-1`).

```powershell
./deploy.ps1              # sync completo (sem o vídeo) + cache-control no HTML/JS
./deploy.ps1 -WithVideo   # inclui o teaser (~200 MB) — necessário na 1ª vez / ao trocá-lo
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
  s.src = 'https://skylineip.s3.sa-east-1.amazonaws.com/Tour+Virtual/tauf/ferramentas/galeria/inject.js?v=' + Date.now();
  document.head.appendChild(s);
})();
```

> **`?v=` + `Date.now()`** — cache-busting: força o browser a baixar sempre a versão mais
> recente do script, evitando que o 3DVista sirva uma versão antiga em cache.

### Passo 2 — Acionar nos hotspots/botões

```js
GaleriaImagens(1);      // abre galeria de imagens   · GaleriaImagens(0) fecha
GaleriaPlantas(1);      // abre galeria de plantas    · GaleriaPlantas(0) fecha
AbrirGaleriaVideos(1);  // abre o vídeo teaser         · AbrirGaleriaVideos(0) fecha
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

Tema **areia + marrom** do Nuar / Tauf:

| Token CSS | Valor | Papel |
|-----------|-------|-------|
| `--bg` (fundo) | `#E6E2DC` | Areia — fundo principal |
| `--surface` | `#DCD6CC` | Superfície de card (skeleton) |
| `--dark` (foreground) | `#442702` | Texto/ícones — marrom Tauf |
| `--accent` | `#442702` | Marrom — destaque / estado ativo |
| Lightbox | `#1e1103` | Marrom quase preto — palco da imagem/vídeo |
| Fonte títulos | Cormorant Garamond | — |
| Fonte UI | Inter | — |

> Cards de plantas mantêm **fundo branco** (legibilidade do desenho), com texto marrom.
