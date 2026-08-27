/* Comunidad Python Guatemala — interacciones */
(function () {
  "use strict";

  /* ===== ENLACES DE INSCRIPCIÓN =====
     Reemplaza estos dos enlaces por tus formularios reales (Google Forms, etc.).
     Mientras estén vacíos, los botones llevan a la sección de eventos. */
  var REG_FORM_URL = "";       // formulario para inscribirse como ASISTENTE
  var SPEAKER_FORM_URL = "";   // formulario para CONFERENCISTA / TALLERISTA / EXPOSITOR

  function wireForm(sel, url) {
    document.querySelectorAll(sel).forEach(function (a) {
      if (url) { a.setAttribute("href", url); a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener"); }
    });
  }
  wireForm(".js-inscribir", REG_FORM_URL);
  wireForm(".js-ponente", SPEAKER_FORM_URL || REG_FORM_URL);

  // ---- Gallery data (Python Exposition Day 2025) ----
  var PHOTOS = [
    { f: "ped2025-01.jpg", c: "Apertura del Python Exposition Day 2025" },
    { f: "ped2025-02.jpg", c: "Conferencia magistral en el auditorio" },
    { f: "ped2025-03.jpg", c: "Charla sobre Inteligencia Artificial" },
    { f: "ped2025-04.jpg", c: "Ponencia principal" },
    { f: "ped2025-05.jpg", c: "Taller práctico de Python" },
    { f: "ped2025-06.jpg", c: "Parte de la comunidad" },
    { f: "ped2025-07.jpg", c: "Del pasado al futuro de la computación" },
    { f: "ped2025-08.jpg", c: "Reconocimiento a los expositores" },
    { f: "ped2025-09.jpg", c: "Manos a la obra en los talleres" },
    { f: "ped2025-10.jpg", c: "Entrega de diplomas" },
    { f: "ped2025-11.jpg", c: "Auditorio lleno" },
    { f: "ped2025-12.jpg", c: "Networking y refacción" },
    { f: "ped2025-13.jpg", c: "Compartiendo conocimiento" },
    { f: "ped2025-14.jpg", c: "Foto de familia de la comunidad" },
    { f: "ped2025-15.jpg", c: "Premiación de proyectos" },
    { f: "ped2025-16.jpg", c: "Reconocimiento a ponentes" },
    { f: "ped2025-17.jpg", c: "Concentración en el taller" },
    { f: "ped2025-18.jpg", c: "La comunidad Python Guatemala" },
    { f: "ped2025-19.jpg", c: "Aprendiendo en comunidad" },
    { f: "ped2025-20.jpg", c: "Ciudad de Guatemala, sede del evento" },
    { f: "ped2025-21.jpg", c: "Bienvenidos al Python Exposition Day 2025" },
    { f: "ped2025-22.jpg", c: "Nuevas amistades en la comunidad" },
    { f: "ped2025-23.jpg", c: "Python para todas las edades" },
    { f: "ped2025-24.jpg", c: "Voluntarios y asistentes" },
    { f: "ped2025-25.jpg", c: "Pausa para la refacción" },
    { f: "ped2025-26.jpg", c: "Espacios de networking" },
    { f: "ped2025-27.jpg", c: "Entrega de reconocimientos" },
    { f: "ped2025-28.jpg", c: "El rol de Python" },
    { f: "ped2025-29.jpg", c: "Preguntas y respuestas" },
    { f: "ped2025-30.jpg", c: "Pasión por la programación" },
    { f: "ped2025-31.jpg", c: "Voces de la comunidad" },
    { f: "ped2025-32.jpg", c: "Exposición de proyectos" },
    { f: "ped2025-33.jpg", c: "Talleres especializados" },
    { f: "ped2025-34.jpg", c: "Automatización y nuevas tecnologías" },
    { f: "ped2025-35.jpg", c: "Mujeres en Python Guatemala" },
    { f: "ped2025-36.jpg", c: "Oportunidades con los patrocinadores" },
    { f: "ped2025-37.jpg", c: "El equipo organizador" },
    { f: "ped2025-38.jpg", c: "Comunidad y colaboración" },
    { f: "ped2025-39.jpg", c: "Charlas técnicas" },
    { f: "ped2025-40.jpg", c: "Productividad y automatización con n8n" },
    { f: "ped2025-41.jpg", c: "Exposición de proyectos de la comunidad" },
    { f: "ped2025-42.jpg", c: "Un auditorio repleto" },
    { f: "ped2025-43.jpg", c: "¡Gracias por acompañarnos!" },
    { f: "ped2025-44.jpg", c: "La energía de la comunidad" },
    { f: "ped2025-45.jpg", c: "Panorámica del evento" },
    { f: "ped2025-46.jpg", c: "Asistentes del Python Exposition Day 2025" },
    { f: "ped2025-47.jpg", c: "Autoridades y organizadores" }
  ];
  var THUMB = "assets/img/eventos/2025/thumb/";
  var FULL = "assets/img/eventos/2025/full/";
  var INITIAL = 12; // fotos visibles antes de "ver todas"
  var TALL = { 2: 1, 13: 1, 20: 1, 34: 1 }; // índices que ocupan 2 filas para dar ritmo

  // ---- Build gallery ----
  var gallery = document.getElementById("gallery");
  PHOTOS.forEach(function (p, i) {
    var fig = document.createElement("figure");
    fig.setAttribute("data-index", i);
    if (TALL[i]) fig.className = "tall";
    if (i >= INITIAL) fig.style.display = "none";
    var img = document.createElement("img");
    img.src = THUMB + p.f;
    img.alt = p.c;
    img.loading = "lazy";
    var cap = document.createElement("figcaption");
    cap.textContent = p.c;
    fig.appendChild(img);
    fig.appendChild(cap);
    fig.addEventListener("click", function () { openLightbox(i); });
    gallery.appendChild(fig);
  });
  document.getElementById("galleryCount").textContent = PHOTOS.length + " fotos";

  // ---- Show all toggle ----
  var expanded = false;
  var toggle = document.getElementById("galleryToggle");
  toggle.addEventListener("click", function () {
    expanded = !expanded;
    var figs = gallery.querySelectorAll("figure");
    figs.forEach(function (f, i) { if (i >= INITIAL) f.style.display = expanded ? "" : "none"; });
    toggle.textContent = expanded ? "Ver menos" : "Ver todas las fotos";
    if (!expanded) document.getElementById("galeria").scrollIntoView({ behavior: "smooth" });
  });

  // ---- Lightbox ----
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCap = document.getElementById("lbCap");
  var lbCount = document.getElementById("lbCount");
  var current = 0;

  function showAt(i) {
    current = (i + PHOTOS.length) % PHOTOS.length;
    var p = PHOTOS[current];
    lbImg.src = FULL + p.f;
    lbImg.alt = p.c;
    lbCap.textContent = p.c;
    lbCount.textContent = (current + 1) + " / " + PHOTOS.length;
  }
  function openLightbox(i) {
    showAt(i);
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  document.getElementById("lbClose").addEventListener("click", closeLightbox);
  document.getElementById("lbNext").addEventListener("click", function () { showAt(current + 1); });
  document.getElementById("lbPrev").addEventListener("click", function () { showAt(current - 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowRight") showAt(current + 1);
    else if (e.key === "ArrowLeft") showAt(current - 1);
  });

  // ---- Navbar scroll state + mobile menu ----
  var nav = document.getElementById("nav");
  var navLinks = document.getElementById("navLinks");
  var navToggle = document.getElementById("navToggle");
  function onScroll() { nav.classList.toggle("scrolled", window.scrollY > 24); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  navToggle.addEventListener("click", function () {
    navLinks.classList.toggle("open");
    navToggle.classList.toggle("open");
  });
  navLinks.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { navLinks.classList.remove("open"); navToggle.classList.remove("open"); });
  });

  // ---- Reveal on scroll ----
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  // ---- Count up stats ----
  var counted = false;
  var statsIo = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting && !counted) {
        counted = true;
        document.querySelectorAll("[data-count]").forEach(function (el) {
          var target = parseInt(el.getAttribute("data-count"), 10);
          var suffix = el.getAttribute("data-suffix") || "";
          var start = null, dur = 1400;
          function step(ts) {
            if (!start) start = ts;
            var prog = Math.min((ts - start) / dur, 1);
            var eased = 1 - Math.pow(1 - prog, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (prog < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        });
      }
    });
  }, { threshold: 0.4 });
  var statsEl = document.querySelector(".stats");
  if (statsEl) statsIo.observe(statsEl);

  // ---- Botón volver arriba ----
  var toTop = document.getElementById("toTop");
  if (toTop) {
    function onScrollTop() { toTop.classList.toggle("show", window.scrollY > 600); }
    window.addEventListener("scroll", onScrollTop, { passive: true });
    onScrollTop();
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ---- Year ----
  document.getElementById("year").textContent = new Date().getFullYear();
})();
