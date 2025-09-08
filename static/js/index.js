window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}


$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

    });

    var options = {
			slidesToScroll: 1,
			slidesToShow: 3,
			loop: true,
			infinite: true,
			autoplay: false,
			autoplaySpeed: 3000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Loop on each carousel initialized
    for(var i = 0; i < carousels.length; i++) {
    	// Add listener to  event
    	carousels[i].on('before:show', state => {
    		console.log(state);
    	});
    }

    // Access to bulmaCarousel instance of an element
    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	// bulmaCarousel instance is available as element.bulmaCarousel
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

    /*var player = document.getElementById('interpolation-video');
    player.addEventListener('loadedmetadata', function() {
      $('#interpolation-slider').on('input', function(event) {
        console.log(this.value, player.duration);
        player.currentTime = player.duration / 100 * this.value;
      })
    }, false);*/
    preloadInterpolationImages();

    $('#interpolation-slider').on('input', function(event) {
      setInterpolationImage(this.value);
    });
    setInterpolationImage(0);
    $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    bulmaSlider.attach();

  // ===== Plein écran + Playlist (FIX) pour #heroVideo =====
const v       = document.getElementById('heroVideo');
const wrapper = document.getElementById('intr_video');
const fsBtn   = document.querySelector('.video-fs-btn');
const labelEl = document.querySelector('.video-label');
const prevBtn = document.querySelector('.video-nav-btn.prev');
const nextBtn = document.querySelector('.video-nav-btn.next');

if (v) {
  // --- Playlist à adapter ---
  const playlist = [
    { src: 'static/videos/Video_Globe.mp4',                         label: 'RayGaussX — Globe' },
    { src: 'static/videos/Video_Beryl.mp4',                         label: 'RayGaussX — Béryl' },
    { src: 'static/videos/Rendering_RayGauss_Vas_Diatretum_v3.mp4', label: 'RayGaussX — Vase' },
  ];
  let idx = 0;

  // -------- Fullscreen helpers --------
  function isFullscreen() {
    return document.fullscreenElement === wrapper ||
           document.fullscreenElement === v ||
           document.webkitFullscreenElement === wrapper ||
           document.webkitFullscreenElement === v;
  }
  async function enterFullscreen() {
    if (wrapper && wrapper.requestFullscreen) return wrapper.requestFullscreen();
    if (v && v.requestFullscreen) return v.requestFullscreen();
    if (v && v.webkitEnterFullscreen) { v.webkitEnterFullscreen(); return 'iosNative'; } // iOS ancien
  }
  async function exitFullscreen() {
    if (document.exitFullscreen) return document.exitFullscreen();
    if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
  }
  function setFSState(active){
    if (!fsBtn) return;
    fsBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
    fsBtn.title = active ? 'Quitter le plein écran' : 'Plein écran';
    fsBtn.textContent = active ? '⤡' : '⤢';
  }

  // -------- Changement de vidéo --------
  function loadAndPlay(i){
    if (!playlist.length) return;
    idx = ((i % playlist.length) + playlist.length) % playlist.length; // wrap
    const item = playlist[idx];
    const wasMuted  = v.muted;

    v.pause();
    v.src = item.src;
    v.load();
    if (labelEl && item.label) labelEl.textContent = item.label;

    v.addEventListener('loadedmetadata', function onLM(){
      v.removeEventListener('loadedmetadata', onLM);
      v.muted = wasMuted;
      v.play().catch(()=>{});
    });
  }

  // -------- Init : aligner sur la source actuelle --------
  {
    const cur = v.getAttribute('src') || (v.querySelector('source')?.getAttribute('src'));
    const found = playlist.findIndex(p => p.src === cur);
    if (found >= 0) {
      idx = found;
      if (labelEl) labelEl.textContent = playlist[idx].label || (labelEl.textContent || 'Vidéo');
    } else if (cur) {
      playlist.unshift({ src: cur, label: labelEl?.textContent || 'Vidéo' });
      idx = 0;
    }
  }

  // -------- Listeners UI --------
  fsBtn?.addEventListener('click', () => { isFullscreen() ? exitFullscreen() : enterFullscreen(); });
  v.addEventListener('dblclick',          () => { isFullscreen() ? exitFullscreen() : enterFullscreen(); });
  document.addEventListener('fullscreenchange',       () => setFSState(isFullscreen()));
  document.addEventListener('webkitfullscreenchange', () => setFSState(isFullscreen()));
  setFSState(false);

  prevBtn?.addEventListener('click', () => loadAndPlay(idx - 1));
  nextBtn?.addEventListener('click', () => loadAndPlay(idx + 1));

  // Flèches clavier
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  loadAndPlay(idx - 1);
    if (e.key === 'ArrowRight') loadAndPlay(idx + 1);
    if (e.key && e.key.toLowerCase() === 'f') { isFullscreen() ? exitFullscreen() : enterFullscreen(); }
  });

  // -------- Fin de vidéo : un seul handler --------
  v.addEventListener('ended', () => {
    if (playlist.length > 1) loadAndPlay(idx + 1);
    else { try { v.currentTime = 0; v.play(); } catch(e) {} }
  });
}

(() => {
  if (window.ChartDataLabels) Chart.register(ChartDataLabels);

  // Données + échelles par dataset
  const DATASETS = [
    { key:'mip', title:'Mip-NeRF360',
      vals:{ gs:27.91, zip:28.56, rg:28.23, rgx:28.43 }, y:[27.0, 29.0] },
    { key:'tnt', title:'Tanks & Temples',
      vals:{ gs:23.72, zip:10.85, rg:23.20, rgx:23.76 }, y:[23.0, 24.0] },
    { key:'db',  title:'Deep Blending',
      vals:{ gs:29.92, zip:30.76, rg:30.30, rgx:30.32 }, y:[29.5, 31.1] }
  ];

  const titleEl = document.getElementById('psnr-title');
  const ctx  = document.getElementById('psnr_chart').getContext('2d');
  const prev = document.querySelector('.psnr-prev');
  const next = document.querySelector('.psnr-next');

  let idx = 0;
  let savedPalette = null; // mémorise les couleurs auto de Chart.js au 1er rendu

  function makeData(meta, palette){
    const v = meta.vals;
    const ds = [
      { label:'3D-GS',     data:[v.gs],  borderRadius:8 },
      { label:'Zip-NeRF',  data:[v.zip], borderRadius:8 },
      { label:'RayGauss',  data:[v.rg],  borderRadius:8 },
      { label:'RayGaussX', data:[v.rgx], borderRadius:8, borderWidth:3, order:-1 }
    ];
    if (palette) {
      ds.forEach((d, i) => {
        d.backgroundColor = palette[i].bg;
        d.borderColor = palette[i].border;
      });
    }
    return { labels:[''], datasets: ds };
  }

  const chart = new Chart(ctx, {
    type: 'bar',
    data: makeData(DATASETS[idx]),
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
        title: { display: false, text: DATASETS[idx].title },
        tooltip: { mode: 'index', intersect: false },
        datalabels: window.ChartDataLabels ? {
          anchor:'end', align:'end', color:'#111',
          font:{ size:11, weight:'600' },
          formatter: (v, ctx) => {
            const rgx = DATASETS[idx].vals.rgx;
            if (ctx.dataset.label === 'RayGaussX') return v.toFixed(2);
            const d = v - rgx, sign = d >= 0 ? '+' : '';
            return `${v.toFixed(2)} (${sign}${d.toFixed(2)})`;
          }
        } : undefined
      },
      datasets: { bar: { categoryPercentage:.6, barPercentage:.9 } },
      scales: {
        x: { grid:{ display:false }, ticks:{ display:false } },
        y: {
          beginAtZero:false,
          min: DATASETS[idx].y[0], max: DATASETS[idx].y[1],
          title:{ display:true, text:'PSNR ↑ (dB)' },
          grid:{ drawBorder:false }
        }
      }
    }
  });

  // Capture la palette auto générée au 1er rendu
  setTimeout(() => {
    savedPalette = chart.data.datasets.map(ds => ({
      bg: ds.backgroundColor,
      border: ds.borderColor || ds.backgroundColor
    }));
  }, 0);

  function updateChart(){
    const meta = DATASETS[idx];
    titleEl.textContent = meta.title;
    chart.data = makeData(meta, savedPalette || chart.data.datasets.map(d=>({bg:d.backgroundColor, border:d.borderColor||d.backgroundColor})));
    chart.options.plugins.title.text = meta.title;
    chart.options.scales.y.min = meta.y[0];
    chart.options.scales.y.max = meta.y[1];
    chart.update();
  }

  // Flèches
  prev?.addEventListener('click', () => { idx = (idx - 1 + DATASETS.length) % DATASETS.length; updateChart(); });
  next?.addEventListener('click', () => { idx = (idx + 1) % DATASETS.length; updateChart(); });

  // Clavier ← / →
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  prev.click();
    if (e.key === 'ArrowRight') next.click();
  });

  // Swipe sur mobile (sur le canvas)
  let startX=null;
  ctx.canvas.addEventListener('touchstart', e => startX = e.touches[0].clientX, { passive:true });
  ctx.canvas.addEventListener('touchend', e => {
    if (startX===null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev).click();
    startX=null;
  });
})();

})
