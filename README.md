# Alton Chocolates — Squarespace Developer Mode Template

Production-ready Squarespace **Developer Mode** template converted from the Figma file [Square Space Projects (Copy)](https://www.figma.com/design/icTCW38viivToWwIXIOIoM/Square-Space-Projects--Copy-?node-id=505-2) for **Alton Chocolates**.

## What was built

A complete Squarespace template (JSON-T + LESS + JS) covering all five Figma frames:

| Page | Figma frame | Template file |
|------|-------------|---------------|
| Home | `505:3` Home | `pages/home.page` |
| Shop | `511:2` Shop | `pages/shop.page` |
| Build Box | `517:278` Build Box | `pages/build-box.page` |
| Gifts | `537:259` Gift | `pages/gifts.page` |
| Our Story | `538:890` Our Story | `pages/our-story.page` |

Hidden Figma frames (`Design 2`, `Group 1`, `Group 2`) were intentionally excluded.

## Design system (from Figma)

| Token | Value |
|-------|--------|
| Background | `#F5F2EC` |
| Primary text | `#2F1A0D` |
| Secondary / olive | `#626145` |
| Blush accent | `#ECD7D0` |
| Terracotta CTA | `#A9705E` |
| Muted text | `#5D5958` |
| Border | `#F0E8E0` |
| Heading font | **Playfair Display** |
| Body / UI font | **Poppins** |

Fonts load from Google Fonts (exact Figma families).

## Project structure

```
/
├── assets/
│   ├── icons/          # SVG icons exported from Figma
│   └── images/         # Photography & product imagery from Figma
├── blocks/             # Reusable JSON-T partials
├── collections/        # Products, categories, gifts, treats, testimonials
├── pages/              # Static page templates + .page.conf
├── preview/            # Local static HTML preview (not deployed to Squarespace)
├── scripts/site.js
├── styles/*.less
├── site.region
├── template.conf
└── README.md
```

## Squarespace setup (Developer Mode)

1. Create or open a Squarespace site on a plan that supports **Developer Mode**.
2. Enable Developer Mode: **Settings → Developer Tools → Developer Mode**.
3. Clone the site template repository with Git (Squarespace provides the remote URL).
4. Replace the template contents with this project (keep `.git` from Squarespace).
5. Push to the Squarespace Git remote.
6. In the Squarespace editor:
   - Set **Site Title / Logo** under Branding (header/footer use `{logoImage}` when set).
   - Create pages and assign URLs: `/`, `/shop`, `/build-box`, `/gifts`, `/our-story`.
   - Add pages to **Main Navigation** (`mainNav`) and footer navigations (`footerShop`, `footerOther`, `footerHelp`, `footerLegal`).
   - Create collections linked to `products`, `categories`, `gifts`, `treats`, `testimonials` (or use Summary / Product blocks inside the page block fields).
   - Drop **Form** blocks into Contact block fields and a **Newsletter** block into the newsletter field.
   - Populate announcement, hero CTAs, and section copy via the labeled `squarespace:block-field` regions.

### Recommended page wiring

1. Create a **Cover / Blank** page for Home and set it as the homepage using the `home` static page content, **or** paste/assign the Home static page.
2. For Commerce: enable Squarespace Commerce and map the Products / Gifts collections (or replace demo product grids with Product Blocks / Summary Blocks pointing at your store).
3. Style Forms: add a Form Block into each page’s `contactForm` field; newsletter into `newsletterForm`.

> **Important:** Static `.page` files in Developer Mode appear under **Not Linked** / Static Pages depending on your Squarespace version. Link them into navigation after push.

## Local preview

Squarespace JSON-T does not render without Squarespace’s server. Use the static preview:

```bash
# From the project root (Python)
python -m http.server 8080
```

Then open:

- http://localhost:8080/preview/index.html
- http://localhost:8080/preview/shop.html
- http://localhost:8080/preview/build-box.html
- http://localhost:8080/preview/gifts.html
- http://localhost:8080/preview/our-story.html

`preview/site.css` is a compiled snapshot of the LESS files for local viewing only. On Squarespace, styles compile from `/styles` via `template.conf`.

## Editable elements

### Global (CMS / Site Settings)

- Site title & logo
- Main navigation (`mainNav`)
- Footer navigations (Shop / Other / Help / Legal)
- Announcement bar (`announcementText` block field)
- Footer brand text, copyright, social links (block fields)
- Contact form & newsletter (native Squarespace blocks)

### Per page (block fields)

Hero copy/CTAs, section intros, contact intro/details, testimonials summary slots, product summary slots, corporate gifting copy, story feature columns, etc. Each field is labeled in the template markup.

### Collections

| Collection | Purpose |
|------------|---------|
| `products` | Shop / bestsellers (Commerce `store-item`) |
| `categories` | Category circles |
| `gifts` | Gift catalog |
| `treats` | Build-a-box selectable treats |
| `testimonials` | Quote carousel content |

Demo product markup is included so the design looks complete before CMS content is added. Replace grids with Summary/Product blocks or collection loops as you populate data.

## Assets

All primary photography and icons were exported from Figma MCP asset URLs and stored under `/assets`. Key files:

- `assets/icons/logo.svg` — brand wordmark lockup
- Hero images per page (`hero-home.png`, `shop-hero.png`, `buildbox-hero.png`, `gifts-hero.png`, `story-hero.png`)
- Category circles, product shots, gift collections, craft/detail imagery

If any asset needs a higher-resolution re-export from Figma, replace the file in place (keep the same filename).

## Scripts

`scripts/site.js` handles:

- Announcement dismiss (session)
- Mobile navigation
- Quantity steppers
- Build-a-box size selection, treat filters, order summary
- Testimonials prev/next scroll

## Limitations & notes

1. **Fluid Engine / 7.1 sections** — Classic Developer Mode templates use JSON-T regions and block fields, not the Fluid Engine canvas editor. Editability is via block fields, collections, and navigations (Squarespace’s supported Developer Mode model).
2. **Build-a-box checkout** — Interactive UX matches the Figma flow (sizes, quantities, summary). Production payment should connect to Squarespace Commerce (custom product / product options) or an external checkout. The order form block field is the place for a real Form / checkout CTA.
3. **Commerce pricing / inventory** — Demo prices are design placeholders until store items are connected.
4. **Search & account** — Links point to Squarespace `/search` and `/account/login` routes; enable those features on the site.
5. **LESS color helpers** — `darken()` / `lighten()` / `fade()` are used in LESS; Squarespace’s LESS compiler supports these. The preview CSS uses pre-resolved values.
6. **Figma placeholder copy** — Many Figma text layers use “sample text goes here” / lorem; the template preserves that structure and exposes block fields so you can replace copy without editing code.

## Manual configuration checklist

- [ ] Enable Developer Mode and push this template
- [ ] Upload / confirm logo in Branding
- [ ] Create navigations and assign pages
- [ ] Add Form blocks to contact fields
- [ ] Add Newsletter block
- [ ] Create Products / Gifts / Treats / Testimonials content
- [ ] Connect Commerce checkout for products and build-a-box
- [ ] Set homepage
- [ ] QA at 1440 / 1024 / 768 / 390 widths

## Visual QA breakpoints

Styles target polished layouts at **1440, 1280, 1024, 768, 480, 390, 375, and 320px**.

## License / credit

Design source: Figma — Alton Chocolates. Template implementation for Developer Mode deployment.
