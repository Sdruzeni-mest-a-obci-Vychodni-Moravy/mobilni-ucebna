/* Mobilní učebna KONEKT-ED – drobná interaktivita (menu, galerie, filtr) */
(function () {
  'use strict';

  // ---------- Mobilní menu ----------
  var panel = document.querySelector('.menu-panel');
  var backdrop = document.querySelector('.menu-backdrop');
  var openBtn = document.querySelector('.menu-toggle[aria-controls="menu"]');
  var closeBtn = document.querySelector('.menu-close');
  function setMenu(open) {
    if (!panel) return;
    panel.setAttribute('data-open', open);
    backdrop.setAttribute('data-open', open);
    openBtn.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) closeBtn.focus(); else openBtn.focus();
  }
  if (openBtn) {
    openBtn.addEventListener('click', function () { setMenu(true); });
    closeBtn.addEventListener('click', function () { setMenu(false); });
    backdrop.addEventListener('click', function () { setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.getAttribute('data-open') === 'true') setMenu(false);
    });
  }

  // ---------- Filtr alb podle aktivity ----------
  var filters = document.querySelector('[data-filters]');
  if (filters) {
    filters.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      var value = btn.getAttribute('data-filter');
      filters.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b === btn); });
      document.querySelectorAll('[data-activities]').forEach(function (card) {
        var show = value === 'vse' || card.getAttribute('data-activities').split(' ').indexOf(value) !== -1;
        card.hidden = !show;
      });
      document.querySelectorAll('.month').forEach(function (m) {
        m.hidden = !m.querySelector('[data-activities]:not([hidden])');
      });
    });
  }

  // ---------- Lightbox ----------
  var links = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
  if (!links.length) return;
  var box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', document.documentElement.lang === 'sk' ? 'Prehliadač fotografií' : 'Prohlížeč fotografií');
  var icon = function (d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>'; };
  var sk = document.documentElement.lang === 'sk';
  box.innerHTML =
    '<img alt="">' +
    '<button class="lightbox__close" type="button" aria-label="' + (sk ? 'Zavrieť' : 'Zavřít') + '">' + icon('M6 6l12 12M18 6L6 18') + '</button>' +
    '<button class="lightbox__prev" type="button" aria-label="' + (sk ? 'Predchádzajúca' : 'Předchozí') + '">' + icon('M15 5l-7 7 7 7') + '</button>' +
    '<button class="lightbox__next" type="button" aria-label="' + (sk ? 'Nasledujúca' : 'Další') + '">' + icon('M9 5l7 7-7 7') + '</button>' +
    '<div class="lightbox__count" aria-live="polite"></div>';
  document.body.appendChild(box);
  var img = box.querySelector('img');
  var count = box.querySelector('.lightbox__count');
  var index = 0, lastFocus = null;

  function show(i) {
    index = (i + links.length) % links.length;
    img.src = links[index].getAttribute('href');
    img.alt = links[index].querySelector('img').getAttribute('alt') || '';
    count.textContent = (index + 1) + ' / ' + links.length;
  }
  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    box.setAttribute('data-open', 'true');
    document.body.style.overflow = 'hidden';
    box.querySelector('.lightbox__close').focus();
  }
  function close() {
    box.removeAttribute('data-open');
    document.body.style.overflow = '';
    img.removeAttribute('src');
    if (lastFocus) lastFocus.focus();
  }
  links.forEach(function (a, i) {
    a.addEventListener('click', function (e) { e.preventDefault(); open(i); });
  });
  box.querySelector('.lightbox__close').addEventListener('click', close);
  box.querySelector('.lightbox__prev').addEventListener('click', function () { show(index - 1); });
  box.querySelector('.lightbox__next').addEventListener('click', function () { show(index + 1); });
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  document.addEventListener('keydown', function (e) {
    if (box.getAttribute('data-open') !== 'true') return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
  var startX = null;
  box.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    startX = null;
  });
})();
