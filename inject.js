(function (w, d) {
  'use strict';

  var BASE = 'https://skylineip.s3.sa-east-1.amazonaws.com/Tour+Virtual/ghc/vertus+fascinna/ferramentas/galeria/';
  var GALLERY_URL       = BASE + 'index.html';
  var VIDEO_GALLERY_URL = BASE + 'video-gallery.html';
  var FACHADA_URL       = BASE + 'fachada-interativa.html';

  var overlay    = null;
  var msgHandler = null;

  // ── contexto do 3DVista (preenchido pela action ao abrir a fachada) ──
  var fdvPlayer = null;   // referência ao player (this na action do 3DVista)
  var hideId    = null;   // id HTML da tela a OCULTAR ao escolher um andar
  var showId    = null;   // id HTML da tela a EXIBIR  ao escolher um andar

  // Resolve o player do 3DVista de forma tolerante (o passado na action tem prioridade)
  function _player() {
    return fdvPlayer ||
           w.player ||
           (w.tour && w.tour.player) ||
           (w.TDV && w.TDV.PlayerAPI && w.TDV.PlayerAPI.getCurrentPlayer && w.TDV.PlayerAPI.getCurrentPlayer()) ||
           null;
  }
  // Chama uma função do 3DVista (setMediaByIndex/toggleAny) seja ela global ou método do player
  function _fdvCall(fn, args) {
    var p = _player();
    try { if (p && typeof p[fn] === 'function') { p[fn].apply(p, args); return true; } } catch (e) {}
    try { if (typeof w[fn] === 'function')     { w[fn].apply(w, args);   return true; } } catch (e) {}
    return false;
  }

  function _injectStyles() {
    if (d.getElementById('_gc_styles')) return;
    var s = d.createElement('style');
    s.id = '_gc_styles';
    s.textContent =
      '@keyframes _gcIn{from{opacity:0}to{opacity:1}}' +
      '@keyframes _gcOut{to{opacity:0}}';
    d.head.appendChild(s);
  }

  function _mount(iframeSrc, bg, allow) {
    if (overlay) _close();
    _injectStyles();

    overlay = d.createElement('div');
    overlay.id = '_gc_overlay';
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:2147483646;' +
      'animation:_gcIn 0.3s ease both;';

    var iframe = d.createElement('iframe');
    iframe.src = iframeSrc;
    iframe.style.cssText = 'width:100%;height:100%;border:none;display:block;background:' + bg + ';';
    iframe.setAttribute('allow', allow || 'fullscreen');

    overlay.appendChild(iframe);
    d.body.appendChild(overlay);

    msgHandler = function (e) {
      if (!e.data) return;
      if (e.data.action === 'closeGallery') _close();
      else if (e.data.action === 'goToPanorama') _goToPanorama(e.data.mediaIndex);
    };
    w.addEventListener('message', msgHandler);
  }

  // Abre o panorama do andar escolhido usando a API do 3DVista (sem reload):
  //   1) troca o media pelo índice (setMediaByIndex)
  //   2) oculta/exibe as telas indicadas na action (toggleAny)
  //   3) fecha a fachada, revelando o tour
  // Só recorre ao ?media-index (que recarrega o tour) se a API não existir.
  function _goToPanorama(idx) {
    if (idx == null) { _close(); return; }

    var switched = _fdvCall('setMediaByIndex', [idx]);

    if (hideId) _fdvCall('toggleAny', [hideId, 0]);
    if (showId) _fdvCall('toggleAny', [showId, 1]);

    _close();

    if (!switched) {   // fallback: sem API do 3DVista → injeta na URL
      try {
        var u = new URL(w.location.href);
        u.searchParams.set('media-index', String(idx));
        w.location.href = u.toString();
      } catch (e) {
        w.location.search = '?media-index=' + idx;
      }
    }
  }

  function _open(mode) {
    _mount(GALLERY_URL + '?mode=' + encodeURIComponent(mode || 'imagens') + '&v=' + Date.now(), '#FBF0E5');
  }

  function _close() {
    if (!overlay) return;
    overlay.style.animation = '_gcOut 0.25s ease forwards';
    var ref = overlay;
    setTimeout(function () {
      if (ref.parentNode) ref.parentNode.removeChild(ref);
    }, 260);
    overlay = null;
    if (msgHandler) {
      w.removeEventListener('message', msgHandler);
      msgHandler = null;
    }
  }

  // ── API pública ──────────────────────────────────────────────
  // GaleriaImagens(1) → abre galeria de imagens · GaleriaImagens(0) → fecha
  w.GaleriaImagens = function (show) {
    if (show === 1) _open('imagens'); else _close();
  };

  // GaleriaPlantas(1) → abre galeria de plantas · GaleriaPlantas(0) → fecha
  w.GaleriaPlantas = function (show) {
    if (show === 1) _open('plantas'); else _close();
  };

  // AbrirGaleriaVideos(1) → abre o vídeo teaser · AbrirGaleriaVideos(0) → fecha
  w.AbrirGaleriaVideos = function (show) {
    if (show === 1) _mount(VIDEO_GALLERY_URL + '?v=' + Date.now(), '#1c2213', 'fullscreen; autoplay');
    else _close();
  };

  // ── Fachada Interativa ────────────────────────────────────────
  // Chame na ACTION do 3DVista (onde `this` é o player e os IDs são válidos):
  //
  //   // abre a fachada:
  //   AbrirFachada(this);
  //   // abre e, ao escolher um andar, oculta a tela inicial:
  //   AbrirFachada(this, this.getComponentByName("Tela-Inicial").mH);
  //   // opcional: também exibir uma tela ao escolher um andar:
  //   AbrirFachada(this, this.getComponentByName("Tela-Inicial").mH,
  //                      this.getComponentByName("HUD-Andar").mH);
  //   // fecha:
  //   AbrirFachada(0);
  //
  // Ao clicar em "ver vista" o panorama troca por setMediaByIndex (sem reload),
  // as telas indicadas são ocultadas/exibidas por toggleAny e a fachada fecha.
  w.AbrirFachada = function (arg, hide, show) {
    if (arg === 0 || arg === false || arg == null) { _close(); return; }
    if (typeof arg === 'object') fdvPlayer = arg;   // captura o player (this)
    if (hide !== undefined) hideId = hide || null;
    if (show !== undefined) showId = show || null;
    _mount(FACHADA_URL + '?v=' + Date.now(), '#FBF0E5');
  };

}(window, document));
