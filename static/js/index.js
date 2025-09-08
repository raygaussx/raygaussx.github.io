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
    
})
