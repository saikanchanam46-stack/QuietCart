/* QuietCart — small, self-contained page behaviour. No dependencies. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- mobile navigation ------------------------------------------------ */
  var toggle = document.getElementById('navToggle');
  var links  = document.getElementById('navLinks');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('is-open')) {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* --- header border once the page has moved ---------------------------- */
  var header = document.getElementById('siteHeader');
  var navAnchors = links ? Array.prototype.slice.call(links.querySelectorAll('a[href^="#"]')) : [];
  var spied = navAnchors
    .map(function (a) {
      var el = document.querySelector(a.getAttribute('href'));
      return el ? { anchor: a, el: el } : null;
    })
    .filter(Boolean);

  var ticking = false;
  function onScroll() {
    if (header) header.classList.toggle('is-stuck', window.scrollY > 8);

    var marker = window.scrollY + 140;
    var current = null;
    spied.forEach(function (s) {
      if (s.el.offsetTop <= marker) current = s;
    });
    // the last section counts as current once the page is scrolled to the end
    if (spied.length && window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) {
      current = spied[spied.length - 1];
    }
    spied.forEach(function (s) {
      if (s === current) s.anchor.setAttribute('aria-current', 'true');
      else s.anchor.removeAttribute('aria-current');
    });
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* --- reveal on scroll (opt-in, and only when motion is welcome) -------- */
  var revealables = document.querySelectorAll('.reveal');
  function disarm(el) { el.classList.remove('js-armed'); }
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });

    Array.prototype.forEach.call(revealables, function (el) {
      el.classList.add('js-armed');
      io.observe(el);
    });

    // Safety net: if the observer never reports back, drop the hidden state outright.
    window.setTimeout(function () {
      Array.prototype.forEach.call(revealables, disarm);
    }, 3000);
  }

  /* --- "Explore a Partnership" preselects the retailer option ----------- */
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-audience]');
    if (!trigger) return;
    var radio = document.querySelector('input[name="audience"][value*="' + trigger.dataset.audience + '" i]');
    if (radio) radio.checked = true;
  });


  /* --- photographs upgrade the illustrations, when they exist ------------
     Each slot ships with an illustration as its real src. If the matching
     photo in assets/img/photos/ loads, it takes over. A missing photo simply
     leaves the illustration in place, so the page never shows a broken image. */
  Array.prototype.forEach.call(document.querySelectorAll('[data-photo]'), function (img) {
    var probe = new Image();
    probe.onload = function () {
      img.src = img.dataset.photo;
      if (img.dataset.photoAlt) img.alt = img.dataset.photoAlt;
      img.removeAttribute('width');
      img.removeAttribute('height');
      var figure = img.closest('[data-photo-only]');
      if (figure) figure.hidden = false;
    };
    probe.src = img.dataset.photo;
  });

  /* --- contact form ------------------------------------------------------ */
  var form = document.getElementById('contactForm');
  if (!form) return;
  var status = document.getElementById('formStatus');

  function setError(field, message) {
    var box = document.getElementById(field.id + '-error');
    if (box) box.textContent = message || '';
    if (message) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
    if (box) field.setAttribute('aria-describedby', field.id + '-error');
  }

  function validate() {
    var problems = [];
    var name = form.elements.name;
    var email = form.elements.email;
    var message = form.elements.message;

    setError(name, ''); setError(email, ''); setError(message, '');

    if (!name.value.trim()) { setError(name, 'Please add your name.'); problems.push(name); }
    if (!email.value.trim()) {
      setError(email, 'Please add an email address so we can reply.'); problems.push(email);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
      setError(email, 'That email address doesn’t look quite right.'); problems.push(email);
    }
    if (!message.value.trim()) { setError(message, 'Please add a short message.'); problems.push(message); }
    return problems;
  }

  function showStatus(text, kind) {
    if (!status) return;
    status.textContent = text;
    status.className = 'form__status' + (kind ? ' form__status--' + kind : '');
    status.hidden = false;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var problems = validate();
    if (problems.length) {
      if (status) status.hidden = true;
      problems[0].focus();
      return;
    }

    var endpoint = (form.dataset.endpoint || '').trim();
    var button = form.querySelector('button[type="submit"]');
    var audience = form.ownerDocument.querySelector('input[name="audience"]:checked');
    var payload = new FormData(form);
    if (audience) payload.append('audience', audience.value);

    if (!endpoint) {
      showStatus('This form isn’t connected to an inbox yet, so nothing was sent. ' +
                 'Add a form endpoint to data-endpoint in index.html to start receiving messages.', 'setup');
      return;
    }

    button.disabled = true;
    var original = button.textContent;
    button.textContent = 'Sending…';

    fetch(endpoint, { method: 'POST', body: payload, headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('Request failed with status ' + res.status);
        form.reset();
        showStatus('Thank you — your message is on its way. We’ll be in touch soon.');
      })
      .catch(function () {
        showStatus('Something went wrong sending that. Please try again in a moment.', 'setup');
      })
      .then(function () {
        button.disabled = false;
        button.textContent = original;
      });
  });
})();
