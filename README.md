# Povltavská stavební společnost — website

Modernized responsive website for [Povltavská stavební společnost s.r.o.](https://www.povltavska.cz/) — a general contractor, steel-structure fabricator and building-materials dealer based in Český Krumlov, Czechia.

Rebuilt from the original site with a crisp modern design, mobile-first responsive layout, CZ/EN localization, and a full project gallery lightbox — deployed as a static site on GitHub Pages.

## Stack

- Plain HTML + CSS + vanilla JS — no build step, no framework
- Google Fonts: Inter + Playfair Display
- Dynamic galleries rendered from `galleries.js`
- i18n via `i18n.js` with `data-i18n` attributes
- Custom lightbox (keyboard + touch friendly)
- OpenStreetMap embed on contact page

## Structure

```
index.html                 Home
stavby.html                General contractor
ocelove-konstrukce.html    Steel structures
stavebniny.html            Building materials
galerie.html               Gallery landing
galerie-*.html             Gallery category pages
kontakt.html               Contact
styles.css                 All styles
script.js                  Menu, i18n, lightbox, gallery rendering
i18n.js                    CZ + EN strings
galleries.js               Project metadata + image URLs
images/                    Project photography + brand logos
```

## Local preview

Any static server works:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000

## Deployment

Pushed to the `main` branch; GitHub Pages serves from the repo root.

## Credits

All photography, project descriptions and company info © Povltavská stavební společnost s.r.o.
