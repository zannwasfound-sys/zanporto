/* ═══════════════════════════════════════════════
   PORTFOLIO – Andi Muhammad Fauzan
   script.js  —  v3 full rewrite, scroll bug fixed
═══════════════════════════════════════════════ */

/* ── Scroll to top on every load/refresh ── */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

/* ── Init Lucide icons ── */
lucide.createIcons();

/* ══════════════════════════════════════════
   SMOOTH SCROLL (Desktop wheel only)
   Root-cause fix: NEVER reset currentY inside
   the wheel handler. targetY accumulates, currentY
   chases it via lerp. The only time we sync both
   is when the RAF has fully settled (settled=true).
══════════════════════════════════════════ */
(function () {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  var targetY  = 0;
  var currentY = 0;
  var rafId    = null;
  var settled  = true;

  var EASE = 0.1;

  function maxScroll() {
    return Math.max(0, document.body.scrollHeight - window.innerHeight);
  }
  function clamp(v) { return Math.max(0, Math.min(v, maxScroll())); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    currentY = lerp(currentY, targetY, EASE);
    if (Math.abs(targetY - currentY) < 0.5) {
      currentY = targetY;
      window.scrollTo(0, currentY);
      rafId   = null;
      settled = true;
      return;
    }
    window.scrollTo(0, currentY);
    rafId = requestAnimationFrame(tick);
  }

  function startRaf() {
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  window.addEventListener('wheel', function (e) {
    e.preventDefault();

    /* Sync to real scroll position ONLY when animation has fully settled.
       This prevents the reverse-direction bug when scroll hasn't caught up yet. */
    if (settled) {
      currentY = window.scrollY;
      targetY  = window.scrollY;
      settled  = false;
    }

    var delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 32;
    if (e.deltaMode === 2) delta *= window.innerHeight;

    targetY = clamp(targetY + delta);
    startRaf();
  }, { passive: false });

  window._smoothScroll = {
    stop: function () {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      currentY = window.scrollY;
      targetY  = window.scrollY;
      settled  = true;
    }
  };
})();

/* ══════════════════════════════════════════
   SMOOTH SCROLL — Nav anchor links
══════════════════════════════════════════ */
function easeInOutQuart(t) {
  return t < 0.5
    ? 8 * t * t * t * t
    : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

function smoothScrollTo(target, duration) {
  duration = duration || 900;
  var nav   = document.getElementById('navbar');
  var navH  = nav ? nav.offsetHeight : 0;
  var destY = Math.max(0, target.getBoundingClientRect().top + window.scrollY - navH - 8);
  var startY = window.scrollY;
  var dist   = destY - startY;
  var startTs = null;

  if (window._smoothScroll) window._smoothScroll.stop();

  function step(ts) {
    if (!startTs) startTs = ts;
    var elapsed  = ts - startTs;
    var progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + dist * easeInOutQuart(progress));
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      if (window._smoothScroll) window._smoothScroll.stop();
    }
  }
  requestAnimationFrame(step);
}

(function () {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      closeMobileMenu();
      smoothScrollTo(target, 950);
    });
  });
})();

/* ══════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════ */
var navbar   = document.getElementById('navbar');
var navLinks = document.querySelectorAll('.nav-link');
var sections = document.querySelectorAll('section[id]');

function updateNavbar() {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  var current = '';
  sections.forEach(function (sec) {
    if (window.scrollY >= sec.offsetTop - 160) current = sec.id;
  });
  navLinks.forEach(function (link) {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
}

window.addEventListener('scroll', updateNavbar, { passive: true });
updateNavbar();

/* ══════════════════════════════════════════
   HAMBURGER MENU
══════════════════════════════════════════ */
var hamburger  = document.getElementById('hamburger');
var navLinksEl = document.getElementById('navLinks');
var navOverlay = document.getElementById('navOverlay');

function openMobileMenu() {
  hamburger.classList.add('open');
  navLinksEl.classList.add('open');
  navOverlay.classList.add('show');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  hamburger.classList.remove('open');
  navLinksEl.classList.remove('open');
  navOverlay.classList.remove('show');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', function () {
  hamburger.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
});
navOverlay.addEventListener('click', closeMobileMenu);
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeMobileMenu();
});

/* ══════════════════════════════════════════
   REVEAL ON SCROLL
══════════════════════════════════════════ */
var revealObserver = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08, rootMargin: '0px 0px -24px 0px' }
);

document.querySelectorAll('.reveal').forEach(function (el) {
  revealObserver.observe(el);
});

/* ══════════════════════════════════════════
   SKILL BARS
══════════════════════════════════════════ */
var skillObserver = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var fill = entry.target;
        fill.style.width = fill.dataset.width + '%';
        skillObserver.unobserve(fill);
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll('.skill-fill').forEach(function (el) {
  skillObserver.observe(el);
});

/* ══════════════════════════════════════════
   VIDEO SLIDER
══════════════════════════════════════════ */
(function () {
  var track    = document.getElementById('sliderTrack');
  var prevBtn  = document.getElementById('sliderPrev');
  var nextBtn  = document.getElementById('sliderNext');
  var dotsWrap = document.getElementById('sliderDots');
  if (!track) return;

  var cards      = Array.from(track.querySelectorAll('.project-card'));
  var totalCards = cards.length;
  var currentIdx = 0;

  cards.forEach(function (_, i) {
    var dot = document.createElement('button');
    dot.className = 'dot-btn' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    dot.addEventListener('click', function () { userNavigated = true; goTo(i); });
    dotsWrap.appendChild(dot);
  });

  function goTo(idx) {
    currentIdx = Math.max(0, Math.min(idx, totalCards - 1));
    var offset = currentIdx * track.parentElement.offsetWidth;
    track.style.transform = 'translateX(-' + offset + 'px)';
    dotsWrap.querySelectorAll('.dot-btn').forEach(function (dot, i) {
      dot.classList.toggle('active', i === currentIdx);
    });
    prevBtn.disabled = currentIdx === 0;
    nextBtn.disabled = currentIdx === totalCards - 1;
    prevBtn.style.opacity = currentIdx === 0 ? '.4' : '1';
    nextBtn.style.opacity = currentIdx === totalCards - 1 ? '.4' : '1';
    resetAllVideos(); /* reset & pause all on slide change */
    if (userNavigated) playCurrentVideo();
  }

  var userNavigated = false;

  prevBtn.addEventListener('click', function () { userNavigated = true; goTo(currentIdx - 1); });
  nextBtn.addEventListener('click', function () { userNavigated = true; goTo(currentIdx + 1); });
  goTo(0);

  /* ── Resize: only re-layout, never reset video.
     On mobile, address-bar show/hide fires resize with
     only a height change. We debounce and only act on
     meaningful WIDTH changes to avoid false triggers. ── */
  var lastKnownWidth = window.innerWidth;
  var resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var newWidth = window.innerWidth;
      if (Math.abs(newWidth - lastKnownWidth) < 10) return; /* height-only = address bar, skip */
      lastKnownWidth = newWidth;
      /* Re-position track without touching video state */
      var offset = currentIdx * track.parentElement.offsetWidth;
      track.style.transform = 'translateX(-' + offset + 'px)';
    }, 150);
  }, { passive: true });

  /* ── Touch swipe support (mobile) ── */
  var swipeHint = document.getElementById('swipeHint');
  var touchStartX = 0;
  var touchStartY = 0;
  var isSwiping   = false;

  track.addEventListener('touchstart', function (e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isSwiping   = false;
  }, { passive: true });

  track.addEventListener('touchmove', function (e) {
    var dx = e.touches[0].clientX - touchStartX;
    var dy = e.touches[0].clientY - touchStartY;
    /* Geser horizontal lebih dominan → ini swipe slider */
    if (!isSwiping && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
      isSwiping = true;
    }
  }, { passive: true });

  track.addEventListener('touchend', function (e) {
    if (!isSwiping) return;
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) < 40) return; /* terlalu pendek, abaikan */
    userNavigated = true;
    goTo(dx < 0 ? currentIdx + 1 : currentIdx - 1);
    /* Sembunyikan hint setelah swipe pertama */
    if (swipeHint) swipeHint.classList.add('hidden');
  }, { passive: true });

  function pauseAllVideos() {
    cards.forEach(function (card) {
      var vid = card.querySelector('.cv-video');
      if (vid) {
        vid.pause();
        /* Do NOT reset currentTime here — address-bar resize
           would restart the video from 0. currentTime is only
           reset when the user explicitly navigates slides. */
      }
    });
  }

  function resetAllVideos() {
    cards.forEach(function (card) {
      var vid = card.querySelector('.cv-video');
      if (vid) {
        vid.pause();
        vid.currentTime = 0;
      }
    });
  }

  function playCurrentVideo() {
    var vid = cards[currentIdx] && cards[currentIdx].querySelector('.cv-video');
    if (vid) {
      vid.play().catch(function () {});
    }
  }



})();

/* ══════════════════════════════════════════
   IFRAME OVERLAY
══════════════════════════════════════════ */
(function () {
  var overlays = document.querySelectorAll('.iframe-overlay');
  if (!overlays.length) return;

  overlays.forEach(function (ov) {
    ov.addEventListener('click', function () { ov.classList.add('hidden'); });
  });
  window.addEventListener('wheel', function () {
    overlays.forEach(function (ov) { ov.classList.remove('hidden'); });
  }, { passive: true });

  var projectsSection = document.getElementById('projects');
  if (projectsSection) {
    projectsSection.addEventListener('mouseleave', function () {
      overlays.forEach(function (ov) { ov.classList.remove('hidden'); });
    });
  }
})();

/* ══════════════════════════════════════════
   GLITCH INTRO
══════════════════════════════════════════ */
(function () {
  var wrap = document.querySelector('.hero-photo-wrap');
  if (!wrap) return;

  function triggerGlitch() {
    wrap.classList.add('glitch-active');
    function handler(e) {
      if (e.animationName !== 'glitchFrame') return;
      wrap.classList.remove('glitch-active');
      wrap.removeEventListener('animationend', handler);

      /* Trigger stroke fill dari bawah ke atas setelah glitch selesai */
      var strokeRect = wrap.querySelector('.photo-stroke-rect');
      if (strokeRect) strokeRect.classList.add('stroke-animate');

      /* Trigger scan reveal pada foto bersamaan dengan stroke */
      var flipFront = wrap.querySelector('.flip-front');
      if (flipFront) {
        flipFront.classList.remove('scan-pending');
        flipFront.classList.add('scan-active');

        /* Setelah animasi scan selesai, tandai sebagai done */
        flipFront.addEventListener('animationend', function onScanEnd(ev) {
          if (ev.animationName === 'scanLineMove') {
            flipFront.classList.remove('scan-active');
            flipFront.classList.add('scan-done');
            flipFront.removeEventListener('animationend', onScanEnd);

            /* Aktifkan idle glitch periodik setelah scan intro selesai */
            setTimeout(function () {
              wrap.classList.add('idle-glitch-ready');
            }, 800);
          }
        });
      }
    }
    wrap.addEventListener('animationend', handler);
  }

  var glitchObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        glitchObs.disconnect();
        setTimeout(triggerGlitch, 850);
      }
    });
  }, { threshold: 0.5 });

  glitchObs.observe(wrap);
})();

/* ══════════════════════════════════════════
   MOBILE SCROLL PERFORMANCE
   Pause animasi berat saat user scroll
   supaya frame rate tetap smooth
══════════════════════════════════════════ */
(function () {
  if (!window.matchMedia('(pointer: coarse)').matches) return;

  var photoWrap = document.querySelector('.hero-photo-wrap');
  var scrollTimer = null;
  var isScrolling = false;

  window.addEventListener('scroll', function () {
    if (!isScrolling) {
      isScrolling = true;
      /* Pause animasi float saat scroll */
      if (photoWrap) photoWrap.style.animationPlayState = 'paused';
      document.querySelectorAll('.glow-1, .glow-2').forEach(function (el) {
        el.style.animationPlayState = 'paused';
      });
    }

    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () {
      isScrolling = false;
      /* Resume animasi setelah scroll berhenti */
      if (photoWrap) photoWrap.style.animationPlayState = '';
      document.querySelectorAll('.glow-1, .glow-2').forEach(function (el) {
        el.style.animationPlayState = '';
      });
    }, 150);
  }, { passive: true });
})();

/* ══════════════════════════════════════════
   Spasi tidak boleh scroll halaman, kecuali
   user sedang fokus di input/textarea
══════════════════════════════════════════ */
window.addEventListener('keydown', function (e) {
  if (e.key !== ' ' && e.code !== 'Space') return;
  var tag = document.activeElement && document.activeElement.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  e.preventDefault();
}, { passive: false });

/* ══════════════════════════════════════════
   CURSOR GLOW (Desktop only)
══════════════════════════════════════════ */
(function () {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  var glow = document.createElement('div');
  Object.assign(glow.style, {
    position:      'fixed',
    width:         '320px',
    height:        '320px',
    borderRadius:  '50%',
    background:    'radial-gradient(circle, rgba(34,197,94,.055) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex:        '0',
    transform:     'translate(-50%, -50%)',
    left:          '-999px',
    top:           '-999px',
    willChange:    'left, top',
  });
  document.body.appendChild(glow);

  var glowX = -999, glowY = -999;
  function paint() {
    glow.style.left = glowX + 'px';
    glow.style.top  = glowY + 'px';
  }
  window.addEventListener('mousemove', function (e) {
    glowX = e.clientX; glowY = e.clientY;
    requestAnimationFrame(paint);
  }, { passive: true });
})();

/* ══════════════════════════════════════════
   CUSTOM VIDEO PLAYERS
   Features: play/pause, progress bar (scrub),
   buffer display, +10/-10 skip, volume bar,
   mute toggle, fullscreen. Mobile-safe.
══════════════════════════════════════════ */
(function () {
  function initPlayer(wrap) {
    var video    = wrap.querySelector('.cv-video');
    var playBtn  = wrap.querySelector('.cv-play');
    var iconPlay = playBtn.querySelector('.icon-play');
    var iconPause= playBtn.querySelector('.icon-pause');
    var skipBtns = wrap.querySelectorAll('.cv-skip');
    var progBg   = wrap.querySelector('.cv-progress-bg');
    var progFill = wrap.querySelector('.cv-progress-fill');
    var progBuf  = wrap.querySelector('.cv-progress-buf');
    var progThumb= wrap.querySelector('.cv-progress-thumb');
    var curEl    = wrap.querySelector('.cv-cur');
    var durEl    = wrap.querySelector('.cv-dur');
    var muteBtn  = wrap.querySelector('.cv-mute');
    var iconVol  = muteBtn.querySelector('.icon-vol');
    var iconMuted= muteBtn.querySelector('.icon-muted');
    var volBg    = wrap.querySelector('.cv-vol-bg');
    var volFill  = wrap.querySelector('.cv-vol-fill');
    var volThumb = wrap.querySelector('.cv-vol-thumb');
    var fsBtn    = wrap.querySelector('.cv-fs');
    var iconFs   = fsBtn.querySelector('.icon-fs');
    var iconExFs = fsBtn.querySelector('.icon-exit-fs');
    var playerWrap = wrap.closest('.video-player-wrap');

    /* ── Helpers ── */
    function fmtTime(s) {
      s = Math.floor(s || 0);
      var m = Math.floor(s / 60);
      var ss = s % 60;
      return m + ':' + (ss < 10 ? '0' : '') + ss;
    }

    function setPct(el, pct) {
      el.style.width = Math.max(0, Math.min(100, pct)) + '%';
    }

    function setThumbPos(thumbEl, pct) {
      thumbEl.style.left = Math.max(0, Math.min(100, pct)) + '%';
    }

    /* ── Play / Pause ── */
    function syncPlayUI() {
      var paused = video.paused;
      iconPlay.style.display  = paused ? '' : 'none';
      iconPause.style.display = paused ? 'none' : '';
    }

    playBtn.addEventListener('click', function () {
      video.paused ? video.play() : video.pause();
    });

    /* Click on video itself toggles play */
    video.addEventListener('click', function () {
      video.paused ? video.play() : video.pause();
    });

    video.addEventListener('play',  syncPlayUI);
    video.addEventListener('pause', syncPlayUI);
    video.addEventListener('ended', function () { syncPlayUI(); });

    /* ── Skip ± 10s ── */
    skipBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var s = parseFloat(btn.dataset.skip) || 0;
        video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + s));
      });
    });

    /* ── Progress ── */
    video.addEventListener('loadedmetadata', function () {
      durEl.textContent = fmtTime(video.duration);
    });

    video.addEventListener('timeupdate', function () {
      if (!video.duration) return;
      var pct = (video.currentTime / video.duration) * 100;
      setPct(progFill, pct);
      setThumbPos(progThumb, pct);
      curEl.textContent = fmtTime(video.currentTime);
    });

    video.addEventListener('progress', function () {
      if (!video.duration || !video.buffered.length) return;
      var pct = (video.buffered.end(video.buffered.length - 1) / video.duration) * 100;
      setPct(progBuf, pct);
    });

    /* Progress scrub — mouse */
    var scrubbing = false;
    function scrubTo(e) {
      var rect = progBg.getBoundingClientRect();
      var pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      if (video.duration) video.currentTime = pct * video.duration;
    }
    progBg.addEventListener('mousedown', function (e) {
      scrubbing = true;
      scrubTo(e);
    });
    window.addEventListener('mousemove', function (e) {
      if (scrubbing) scrubTo(e);
    });
    window.addEventListener('mouseup', function () {
      scrubbing = false;
    });

    /* Progress scrub — touch */
    progBg.addEventListener('touchstart', function (e) {
      e.stopPropagation(); /* don't trigger slider swipe */
      scrubTo(e.touches[0]);
    }, { passive: true });
    progBg.addEventListener('touchmove', function (e) {
      e.stopPropagation();
      scrubTo(e.touches[0]);
    }, { passive: true });

    /* ── Volume ── */
    var lastVol = 1;
    video.volume = 1;

    function setVolUI(vol) {
      setPct(volFill, vol * 100);
      setThumbPos(volThumb, vol * 100);
      var muted = vol === 0;
      iconVol.style.display   = muted ? 'none' : '';
      iconMuted.style.display = muted ? '' : 'none';
    }
    setVolUI(1);

    muteBtn.addEventListener('click', function () {
      if (video.volume > 0) {
        lastVol = video.volume;
        video.volume = 0;
      } else {
        video.volume = lastVol || 1;
      }
      setVolUI(video.volume);
    });

    function scrubVol(e) {
      var rect = volBg.getBoundingClientRect();
      var vol  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      video.volume = vol;
      if (vol > 0) lastVol = vol;
      setVolUI(vol);
    }
    var volScrubbing = false;
    volBg.addEventListener('mousedown', function (e) {
      volScrubbing = true;
      scrubVol(e);
    });
    window.addEventListener('mousemove', function (e) {
      if (volScrubbing) scrubVol(e);
    });
    window.addEventListener('mouseup', function () {
      volScrubbing = false;
    });

    /* Volume touch */
    volBg.addEventListener('touchstart', function (e) {
      e.stopPropagation();
      scrubVol(e.touches[0]);
    }, { passive: true });
    volBg.addEventListener('touchmove', function (e) {
      e.stopPropagation();
      scrubVol(e.touches[0]);
    }, { passive: true });

    /* ── Fullscreen ── */
    function syncFsUI() {
      var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
      iconFs.style.display   = isFs ? 'none' : '';
      iconExFs.style.display = isFs ? '' : 'none';
    }
    document.addEventListener('fullscreenchange', syncFsUI);
    document.addEventListener('webkitfullscreenchange', syncFsUI);

    fsBtn.addEventListener('click', function () {
      var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
      if (!isFs) {
        if (playerWrap.requestFullscreen) playerWrap.requestFullscreen();
        else if (playerWrap.webkitRequestFullscreen) playerWrap.webkitRequestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      }
    });
  }

  /* Init all players on page */
  document.querySelectorAll('.video-player-wrap').forEach(initPlayer);
})();
