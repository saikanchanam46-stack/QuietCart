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

## Deploying

The site is hosted on **Netlify**, deployed straight from this repository. There is no build
step — Netlify serves the files as they are.

### First-time setup

1. Sign in at [netlify.com](https://netlify.com) with your GitHub account.
2. **Add new site → Import an existing project → GitHub**, and pick `QuietCart`.
3. Set **Branch to deploy** to `claude/quietcart-website-5ido0y`.
4. Leave **Build command** empty and **Publish directory** as `.` (`netlify.toml` already sets this).
5. **Deploy**. You get a URL like `quietcart.netlify.app`, renameable under
   *Site configuration → Change site name*.

Every push to that branch redeploys automatically.

### The contact form

The form is wired to **Netlify Forms** — no backend and no third-party service. Netlify detects it
during deploy from the `data-netlify` attribute in `index.html`.

After the first deploy:

1. Open **Forms** in the Netlify dashboard. A form named `contact` should be listed. If it is
   missing, redeploy — detection only runs at deploy time.
2. Under **Forms → Form notifications**, add an email notification so messages reach your inbox
   instead of sitting in the dashboard.
3. Send yourself a test message through the live site to confirm the path end to end.

Submissions record name, email, organization, message, and which audience box was ticked. A hidden
honeypot field catches most spam bots. The free tier covers 100 submissions per month.

### A custom domain

To use something like `quietcart.com`: buy the domain, then in Netlify go to
*Domain management → Add a domain* and follow the DNS instructions. HTTPS is issued automatically.

## Before this goes live

Two things are still unfinished. Both are marked with `TODO` comments in the source.

1. **Add the real LinkedIn URL.** `index.html` → footer, `Elsewhere` list. It points at `#`.
   No other social accounts are listed; don't add one until it exists.
2. **Add the founder's name** to the byline under the portrait in Our Story. It currently reads
   just "Founder, QuietCart".

Also worth deciding before launch: the two dashed statistic placeholders in the Problem section.
They are placeholders on purpose — no figure on this site is invented. Replace each with a real,
citable number, or delete the `.data-panel` block.

## Photographs

**To add a photo, drop a file into `assets/img/photos/` with the right name. Nothing else.**

Each photo slot ships with an illustration as its actual `src`. On load, the page checks whether
the matching photo exists and swaps it in if it does. A missing photo simply leaves the
illustration in place, so the site never shows a broken image and never needs an edit to work.

| Filename | Where it appears | Shape | Suggested size |
|---|---|---|---|
| `founder.jpg` | Our Story portrait | portrait 4:5 | 1200 x 1500 |
| `prototype.jpg` | Product Development | wide 16:9 | 1600 x 900 |
| `hero-store.jpg` | Hero | landscape 4:3 | 1600 x 1200 |
| `aisle.jpg` | The Problem | landscape 4:3 | 1600 x 1200 |
| `family-shopping.jpg` | For Families | landscape 4:3 | 1600 x 1200 |

Photos are cropped to fill their slot (`object-fit: cover`), so any reasonable size works — but
keep the subject near the middle, and keep files under roughly 400 KB so pages stay quick.

`family-shopping.jpg` is the one exception: that block stays hidden until the file exists, because
there is no illustration standing in for it.

### Sourcing stock photography

Free for commercial use, no attribution required:

- **Unsplash** — unsplash.com
- **Pexels** — pexels.com
- **Burst** — burst.shopify.com

Search terms that match these slots: *grocery store aisle*, *supermarket aisle*, *shopping cart*,
*shopping trolley*, *family grocery shopping*, *parent child supermarket*.

Two things to check before using one:

1. **Make sure it is a photograph.** Unsplash and Pexels both host AI-generated images now. Look
   for the giveaways — melted text on packaging, hands with wrong fingers, shelves whose products
   repeat, lighting that comes from nowhere. A real store photo has messy, specific detail.
2. **Be careful with recognizable people.** The Unsplash and Pexels licenses cover the photo, but
   not the person in it. A site selling a product implies the people shown endorse it, which needs
   a model release. Safest choices: photos where faces are turned away, cropped out, or out of
   focus — or hire a photographer for the ones with people. This matters most for
   `family-shopping.jpg`.

### The illustrations

Every other image is an original SVG built for this site, in the brand palette. They are vector,
so they stay sharp at any size. They are also placeholders in spirit — a real photo of the actual
prototype will do more for trust than any drawing. `prototype.jpg` and `founder.jpg` are the two
worth adding first.

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
