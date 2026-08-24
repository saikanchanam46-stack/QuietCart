# QuietCart

Marketing site for QuietCart — a sensory-friendly attachment for an ordinary shopping cart.

**Tagline:** Support through every aisle.

Static HTML, CSS and vanilla JavaScript. No build step, no dependencies, no framework.
Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000    # then visit http://localhost:8000
```

## Structure

```
index.html              the whole page (single page, anchor navigation)
assets/css/styles.css   design tokens + all styles
assets/js/main.js       nav, scroll-spy, reveal-on-scroll, form validation
assets/img/*.svg        illustrations (see "Artwork" below)
assets/img/photos/      drop real photography here
```

## Before this goes live

Four things are deliberately unfinished. Each is marked with a `TODO` comment in the source.

1. **Connect the contact form.** `index.html` → `<form id="contactForm" data-endpoint="">`.
   Put a form handler URL in `data-endpoint` (Formspree, Netlify Forms, your own endpoint) and
   the form will POST to it. While it is empty, the form validates but tells the visitor plainly
   that it is not connected rather than pretending a message was sent.
2. **Add the real LinkedIn URL.** `index.html` → footer, `Elsewhere` list. It currently points at `#`.
   No other social accounts are listed; don't add one until it exists.
3. **Fill in or remove the statistic placeholders.** The Problem section has two dashed
   `.data-slot` boxes. They are placeholders on purpose — no figure on this site is invented.
   Replace each with a real, citable number, or delete the whole `.data-panel` block.
4. **Swap in real photographs** as they become available (see below).

## Artwork

Every image is an original SVG illustration built for this site, drawn in the brand palette.
They are vector, so they stay sharp at any size and cost very little bandwidth.

They are also the first thing worth replacing. Real photographs of the actual prototype — on a
real cart, in a real store — will do more for trust than any illustration. To swap one in:

1. Put the photo in `assets/img/photos/`.
2. Change the `src` on the matching `<img>` in `index.html`.
3. Update the `alt` text to describe the photo, and keep `width`/`height` accurate so the page
   doesn't shift while images load.

Priority order, highest impact first:

| Illustration | Replace with |
|---|---|
| `product-on-cart.svg` | the prototype strapped to a real shopping cart |
| `prototype-bench.svg` | the actual prototype 3 build |
| `product-board.svg` | clean product shot of the board and card set |
| `aisle-hero.svg` | a real grocery aisle, cart in the foreground |
| `detail-*.svg` | close-ups of the board, cards and sensory pieces |

Avoid staged stock photography of children — the brief for this site is that it should look real.

## Copy rules

The language on this page was written to stay accurate about an early-stage product:

- QuietCart is an **attachment**, never a replacement cart. Several sections say so explicitly.
- It is a support tool. It does not treat, cure, prevent or stop anything, and the For Families
  section states that it is not a substitute for professional guidance.
- The Frisco Fresh Market relationship is a **potential 2027 pilot** under discussion. Nothing has
  been agreed. Please keep that wording as it is.
- The only figures on the site — 50+ families interviewed, 3 prototypes built — come from the
  project's own work. Everything else is a marked placeholder.

## Accessibility

Skip link, semantic landmarks, labelled form fields with inline errors, visible focus rings,
`aria-current` on the active nav item, and descriptive `alt`/`<title>` text on every illustration.
Motion is small by default and removed entirely under `prefers-reduced-motion: reduce`.

## Browser support

Modern evergreen browsers. Fonts load from Google Fonts (Source Serif 4 + Inter) with system
fallbacks, so the page still reads correctly if they fail to load.
