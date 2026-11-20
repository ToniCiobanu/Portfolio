# Toni Ciobanu: Portfolio

Static site served by GitHub Pages. No build step: plain HTML plus one shared stylesheet.

```
index.html                 Homepage
homelab.html               Homelab case study
liftquest/index.html       LiftQuest case study (+ img/)
calendar-automation.html   Shift calendar sync
assets/css/site.css        Every page's styles
assets/images/             Photos and screenshots (profile.jpg is the web-sized portrait)
templates/case-study.html  Starting point for new project pages
```

## Adding a project

1. Copy `templates/case-study.html` to the repo root (e.g. `youtube-history.html`) or to its own
   folder if it has images (e.g. `car-repair/index.html`, like `liftquest/`).
2. Fix the stylesheet and nav paths (the comments in the template say how), and delete the
   `noindex` line.
3. Fill in each section. Keep the **Limits** and **How I built it** sections: they are what makes
   the project defensible in an interview.
4. Give the page a link preview: copy the `og:` and `twitter:card` meta tags from `homelab.html`, point
   them at the new page, and add a 1200×627 JPG to `assets/images/og/`. LinkedIn and other sites use it
   as the thumbnail; without it they guess an image from the page, or show none.
5. Add a card to the `#projects` grid in `index.html`. Copy an existing `<a class="card">` block.
   Data/SQL projects go first, since the site leads with analyst roles; only one card should use
   `class="card feature"` (the full-width one).

Planned: YouTube watch history (SQL), car repair costs (SQL), homelab job scraper.
