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
assets/fonts/           self-hosted Jost + Public Sans
assets/img/*.svg        illustrations
assets/img/photos/      photography
api/contact.js          serverless function behind the contact form
api/contact.test.js     its tests — node api/contact.test.js
vercel.json             headers and caching
tools/set-domain.sh     rewrites the site URL everywhere at once
```

## Deploying

Hosted on **Vercel**, deployed straight from this repository. There is no build step — Vercel
serves the static files and runs `api/contact.js` as a serverless function.

### First-time setup

1. Sign in at [vercel.com](https://vercel.com) with your GitHub account.
2. **Add New… → Project**, import `QuietCart`.
3. Framework preset: **Other**. Leave the build command and output directory empty —
   `vercel.json` already covers the configuration.
4. Set the production branch to `claude/quietcart-website-5ido0y` under
   *Settings → Git → Production Branch*.
5. **Deploy.** You get a URL like `quietcart.vercel.app`, renameable under *Settings → Domains*.

Every push to that branch redeploys. Pull requests get their own preview URL.

### Turning the contact form on

`api/contact.js` receives the form and emails it on through [Resend](https://resend.com)
(free tier: 3,000 emails/month, no card).

1. Create a Resend account and an API key.
2. In Vercel: *Settings → Environment Variables*, add
   - `RESEND_API_KEY` — the key
   - `CONTACT_TO` — the address that should receive messages
   - `CONTACT_FROM` — optional. Defaults to Resend's shared testing sender, which works
     immediately. To send from your own domain, verify it in Resend first and set this to
     something like `QuietCart <hello@quietcart.com>`.
3. Redeploy so the function picks the variables up.
4. Send yourself a test message from the live site.

Until those variables exist the endpoint returns 503 and the form tells the visitor plainly that
it is not connected yet, rather than pretending a message was sent. Replies go straight to the
sender, because the function sets `reply_to` to their address.

Run the handler's tests with `node api/contact.test.js` — no dependencies, no test runner.

### A custom domain

1. Buy the domain. Cloudflare Registrar sells at cost (about $10/yr for a .com); Porkbun and
   Namecheap are similar. Vercel sells them too, which is the least work.
2. In Vercel: *Settings → Domains*, add it, and follow the DNS instructions shown. **Use the values
   Vercel displays**, not any written down elsewhere, as they change.
3. HTTPS is issued automatically once DNS resolves.
4. Point the site at it: `./tools/set-domain.sh quietcart.com`, then commit and push.

### Where the site URL lives

The domain appears in the canonical link, the social preview tags, `robots.txt` and `sitemap.xml`.
`tools/set-domain.sh` updates all of them together so they cannot drift apart. It currently reads
`quietcart.vercel.app`.

After changing it, re-scrape the preview so the old card is not cached:
[LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) and the
[Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/).

## Before this goes live

One thing is still worth a look before launch.

1. **Check the Our Story copy.** It is written in Sai's first-person voice from the facts supplied
   so far. Correct anything that is not accurate.

No figure on this site is invented. The two that appear — 50+ families interviewed, 3 prototypes
built — come from the project's own research. Any external statistic added later needs a citable
source.

## Photographs

**To add a photo, drop a file into `assets/img/photos/` with the right name. Nothing else.**

Each photo slot ships with an illustration as its actual `src`. On load, the page checks whether
the matching photo exists and swaps it in if it does. A missing photo simply leaves the
illustration in place, so the site never shows a broken image and never needs an edit to work.

| Filename | Where it appears | Shape | Suggested size | Status |
|---|---|---|---|---|
| `founder.jpg` | Our Story portrait | portrait 4:5 | 1200 x 1500 | **in place** |
| `hero-store.jpg` | Hero | wide 16:9 | 1600 x 900 | **in place** |
| `aisle.jpg` | The Problem | landscape 4:3 | 1400 x 1050 | **in place** |
| `carts.jpg` | For Retailers | portrait 3:4 | 415 x 553 | **in place**, low resolution |
| `prototype.jpg` | Product Development | wide 16:9 | 1600 x 900 | wanted |
| `family-shopping.jpg` | For Families | landscape 4:3 | 1600 x 1200 | wanted |

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

## Design

Dark green/charcoal `#24342F` is the dominant brand colour. Major sections alternate between white
and that dark ground, with very light grey `#F7F7F5` as a quieter third step so the page does not
read as stripes. Light grey `#E5E7EB` carries hairlines on white and body copy on dark. The muted
green `#AFC5B5` appears only in small doses — eyebrow rules, the leaf in the mark, a single accent
on the product board.

Dark bands work by re-pointing the CSS custom properties inside `.section--dark` rather than by
writing a second set of component rules. A card, border or button inside a dark band picks up the
inverted values automatically, so the two modes cannot drift apart.

Buttons follow the ground they sit on: dark fill with white text on light sections, white fill with
dark text or a white outline on dark ones.

Every foreground/background pair in the palette meets WCAG AA, on both grounds.

Type is Jost for headings over Public Sans for body text.

The illustrations are recoloured to match: neutral structure sits on near-neutral greys, while
produce, packaging and the workbench keep their real colour so the scenes still read as places.

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

## Fonts

Jost and Public Sans are self-hosted in `assets/fonts/` (woff2, ~92 KB total, from @fontsource
under the SIL Open Font License). Nothing is fetched from Google, so the page does not wait on a
third party and no visitor request leaves the site — worth having on a site aimed at families.

## Browser support

Modern evergreen browsers, with system font fallbacks declared throughout.
