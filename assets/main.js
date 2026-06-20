/* ============================================================
   REELHAUS – Interaktivität
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobileMenu");

  function closeMenu() {
    mobileMenu.classList.remove("is-open");
    burger.setAttribute("aria-label", "Menü öffnen");
    burger.classList.remove("is-active");
  }

  if (burger && mobileMenu) {
    burger.addEventListener("click", function () {
      const open = mobileMenu.classList.toggle("is-open");
      burger.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    });
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }

  /* ---------- Sticky nav: shrink/darken on scroll ---------- */
  const nav = document.getElementById("nav");
  const toTop = document.getElementById("toTop");

  function onScroll() {
    const y = window.scrollY;
    if (nav) {
      if (y > 40) {
        nav.classList.add("py-3", "shadow-lg", "shadow-black/30");
        nav.classList.remove("py-4");
      } else {
        nav.classList.add("py-4");
        nav.classList.remove("py-3", "shadow-lg", "shadow-black/30");
      }
    }
    if (toTop) {
      toTop.classList.toggle("is-visible", y > 600);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- Selectable chips (service / budget) ---------- */
  document.querySelectorAll("[data-group]").forEach(function (group) {
    const single = group.getAttribute("data-single") === "true";
    group.querySelectorAll(".chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        if (single) {
          group.querySelectorAll(".chip").forEach(function (c) {
            c.classList.remove("is-active");
          });
          chip.classList.add("is-active");
        } else {
          chip.classList.toggle("is-active");
        }
      });
    });
  });

  /* ---------- Arbeiten: render feed + pinned scroll-scrub ---------- */
  // Reel showcase. To use real clips: drop files into assets/videos/ and set
  // `video` (and optionally `poster`). If the file is missing, the gradient
  // `tint` is shown as a graceful fallback — nothing breaks.
  const WORK_POSTS = [
    { name: "Reel 01", niche: "Gastronomie · Signature Dish", handle: "@reelhaus", views: "1.2M", likes: "45.2K", comments: "892",  tint: "rgba(224,58,30,.55)",  video: "assets/videos/reel-1.mp4", poster: "assets/videos/reel-1.jpg" },
    { name: "Reel 02", niche: "Fashion · Lookbook Drop",      handle: "@reelhaus", views: "980K", likes: "150K",  comments: "2.1K", tint: "rgba(201,168,76,.55)",  video: "assets/videos/reel-2.mp4", poster: "assets/videos/reel-2.jpg" },
    { name: "Reel 03", niche: "Luxus · Behind the Scenes",    handle: "@reelhaus", views: "870K", likes: "95.4K", comments: "2.3K", tint: "rgba(225,29,72,.55)",   video: "assets/videos/reel-3.mp4", poster: "assets/videos/reel-3.jpg" },
    { name: "Reel 04", niche: "Gastronomie · POV Genuss",     handle: "@reelhaus", views: "1.5M", likes: "67.3K", comments: "1.2K", tint: "rgba(245,158,11,.55)",  video: "assets/videos/reel-4.mp4", poster: "assets/videos/reel-4.jpg" },
    { name: "Reel 05", niche: "Fashion · Campaign",           handle: "@reelhaus", views: "640K", likes: "73.2K", comments: "1.5K", tint: "rgba(16,185,129,.55)",  video: "assets/videos/reel-5.mp4", poster: "assets/videos/reel-5.jpg" },
    { name: "Reel 06", niche: "Luxus · Produkt-Story",        handle: "@reelhaus", views: "1.1M", likes: "112K",  comments: "1.9K", tint: "rgba(99,102,241,.55)",  video: "assets/videos/reel-6.mp4", poster: "assets/videos/reel-6.jpg" },
  ];

  // Short-form social icons (SVG) for the reel side rail.
  var ICON_HEART = '<svg viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 drop-shadow-[0_1px_2px_rgba(0,0,0,.5)]"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
  var ICON_COMMENT = '<svg viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 drop-shadow-[0_1px_2px_rgba(0,0,0,.5)]"><path d="M12 2C6.49 2 2 5.92 2 10.7c0 2.62 1.36 4.96 3.5 6.54V22l3.7-2.05c.9.23 1.84.35 2.8.35 5.51 0 10-3.92 10-8.6S17.51 2 12 2z"/></svg>';
  var ICON_SHARE = '<svg viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7 drop-shadow-[0_1px_2px_rgba(0,0,0,.5)]"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';
  var ICON_MUTE = '<svg viewBox="0 0 24 24" class="w-4 h-4" fill="currentColor"><path d="M11 5L6 9H3v6h3l5 4z"/><path d="M16 9.5l5 5m0-5l-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  var ICON_UNMUTE = '<svg viewBox="0 0 24 24" class="w-4 h-4" fill="currentColor"><path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 010 7M18.5 6a9 9 0 010 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  function railItem(icon, label) {
    return '<span class="flex flex-col items-center gap-1">' + icon +
           '<span class="text-[11px] font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,.6)]">' + label + '</span></span>';
  }

  function postHTML(p, i) {
    var video = p.video
      ? '<video class="work-video absolute inset-0 w-full h-full object-cover" data-src="' + p.video + '"' +
          (p.poster ? ' poster="' + p.poster + '"' : '') +
          ' muted loop playsinline preload="none" onerror="this.style.display=\'none\'"></video>'
      : '';
    return (
      '<article class="work-post">' +
        // gradient fallback (shown until/unless a video loads)
        '<div class="absolute inset-0" style="background-image:linear-gradient(135deg,' + p.tint + ' 0%, #060606 55%, #000 100%)"></div>' +
        video +
        // readability scrim (top + bottom) over gradient/video
        '<div class="absolute inset-0 z-[5] pointer-events-none" style="background:linear-gradient(to bottom, rgba(0,0,0,.45) 0%, transparent 22%, transparent 58%, rgba(0,0,0,.7) 100%)"></div>' +
        // top bar (views only — mute toggle lives at phone level)
        '<div class="absolute top-7 left-3 text-white text-xs z-10">' +
          '<span class="bg-black/40 backdrop-blur px-2.5 py-1 rounded-full font-bold">👁 ' + p.views + '</span>' +
        '</div>' +
        // center play (hidden by JS while the video is playing)
        '<div class="work-play absolute inset-0 flex items-center justify-center z-10">' +
          '<span class="w-16 h-16 rounded-full bg-white/15 backdrop-blur border border-white/40 flex items-center justify-center text-white text-2xl">▶</span>' +
        '</div>' +
        // right rail (short-form style icons)
        '<div class="absolute right-3 bottom-28 flex flex-col items-center gap-5 text-white z-10">' +
          railItem(ICON_HEART, p.likes) +
          railItem(ICON_COMMENT, p.comments) +
          railItem(ICON_SHARE, "Teilen") +
        '</div>' +
        // bottom caption (no title — handle + niche + sound)
        '<div class="absolute left-3 right-16 bottom-7 text-white z-10">' +
          '<p class="font-bold text-sm">' + (p.handle || "@reelhaus") + '</p>' +
          '<p class="text-xs text-white/70 mt-1">' + p.niche + '</p>' +
          '<p class="mt-2 text-xs flex items-center gap-1.5 text-white/90"><span>♪</span> Original Sound – REELHAUS</p>' +
        '</div>' +
      '</article>'
    );
  }

  (function initWorkFeed() {
    const section = document.getElementById("arbeiten");
    const screen = document.getElementById("phoneScreen");
    if (!section || !screen) return;

    // Render the reels directly into the phone screen (= the snap scroll container)
    screen.innerHTML = WORK_POSTS.map(postHTML).join("");
    if (!screen.querySelector(".work-post")) return;

    // Enable the sticky pin only once posts exist (avoids an empty tall track).
    section.classList.add("work-pinned");

    // Progress indicator follows the phone's own scroll position.
    const progressBar = document.getElementById("workProgress");
    const countEl = document.getElementById("workCount");
    const total = WORK_POSTS.length;
    const pad = function (n) { return ("0" + n).slice(-2); };

    let ticking = false;
    function update() {
      ticking = false;
      const max = screen.scrollHeight - screen.clientHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, screen.scrollTop / max)) : 0;
      if (progressBar) progressBar.style.width = progress * 100 + "%";
      if (countEl) {
        const idx = Math.min(total, Math.round(progress * (total - 1)) + 1);
        countEl.textContent = pad(idx) + " / " + pad(total);
      }
    }
    screen.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();

    // Global mute state for the feed (default muted, required for autoplay).
    let feedMuted = true;
    const muteBtn = document.getElementById("reelMute");
    function applyMute() {
      screen.querySelectorAll(".work-video").forEach(function (v) { v.muted = feedMuted; });
      if (muteBtn) {
        muteBtn.innerHTML = feedMuted ? ICON_MUTE : ICON_UNMUTE;
        muteBtn.setAttribute("aria-label", feedMuted ? "Ton einschalten" : "Ton ausschalten");
        muteBtn.setAttribute("aria-pressed", feedMuted ? "false" : "true");
      }
    }
    if (muteBtn) {
      muteBtn.addEventListener("click", function () {
        feedMuted = !feedMuted;
        applyMute();
        // keep the visible reel playing after the toggle (the click is a user
        // gesture, so unmuted playback is now allowed)
        screen.querySelectorAll(".work-video").forEach(function (v) {
          if (!v.paused) { const pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
        });
      });
    }
    applyMute();

    // Play only the reel that's currently in view; lazy-load its source.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const posts = screen.querySelectorAll(".work-post");
    if (!reduce && "IntersectionObserver" in window) {
      const vio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          const video = entry.target.querySelector(".work-video");
          const play = entry.target.querySelector(".work-play");
          if (!video) return;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            if (video.dataset.src && !video.getAttribute("src")) {
              video.setAttribute("src", video.dataset.src);
            }
            video.muted = feedMuted;
            const pr = video.play();
            // Hide the ▶ only if playback actually starts; on error keep the
            // play-look over the gradient fallback.
            if (pr && pr.then) {
              pr.then(function () { if (play) play.style.opacity = "0"; })
                .catch(function () { if (play) play.style.opacity = "1"; });
            } else if (play) {
              play.style.opacity = "0";
            }
          } else {
            video.pause();
            if (play) play.style.opacity = "1";
          }
        });
      }, { root: screen, threshold: [0, 0.6, 1] });
      posts.forEach(function (post) { vio.observe(post); });
    }
  })();

  /* ---------- Blueprint: scroll-linked progress line + step activation ---------- */
  (function initBlueprint() {
    const timeline = document.getElementById("blueprintTimeline");
    const fill = document.getElementById("blueprintFill");
    if (!timeline || !fill) return;
    const steps = Array.prototype.slice.call(timeline.querySelectorAll(".bp-step"));
    if (!steps.length) return;

    let ticking = false;
    function update() {
      ticking = false;
      const rect = timeline.getBoundingClientRect();
      // The line fills as the timeline passes the 55% line of the viewport.
      const trigger = window.innerHeight * 0.55;
      const filled = Math.min(Math.max(trigger - rect.top, 0), rect.height);
      fill.style.height = filled + "px";
      // Light up each step once the fill reaches its dot.
      steps.forEach(function (step) {
        const center = step.offsetTop + step.offsetHeight / 2;
        step.classList.toggle("is-active", filled >= center - 8);
      });
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("load", update);
    update();
  })();

  /* ---------- Contact form (front-end only demo) ---------- */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = form.querySelector("#name").value.trim();
      const email = form.querySelector("#email").value.trim();
      const services = Array.from(
        form.querySelectorAll('[data-group="service"] .chip.is-active')
      ).map(function (c) { return c.textContent.trim(); });
      const budget = (form.querySelector('[data-group="budget"] .chip.is-active') || {}).textContent;

      if (!name || !email) {
        status.textContent = "Bitte Name und E-Mail ausfüllen.";
        status.classList.add("text-red-500");
        return;
      }

      status.classList.remove("text-red-500");
      status.classList.add("text-brand-red");
      status.textContent =
        "Danke, " + name + "! Wir melden uns in Kürze. 🚀" +
        (budget ? " (Budget: " + budget.trim() + ")" : "");

      // In production: send to backend / mail provider here.
      console.log("Contact request:", { name, email, services, budget: budget && budget.trim() });
      form.reset();
      form.querySelectorAll(".chip.is-active").forEach(function (c) {
        c.classList.remove("is-active");
      });
    });
  }

  /* ---------- Current year in footer ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Smooth scroll w/ nav offset for hash links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      const id = link.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  });
})();
