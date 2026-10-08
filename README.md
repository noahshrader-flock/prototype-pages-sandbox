# Prototype sandbox

A test of publishing **built React prototypes** to GitHub Pages and collecting comments on them. Everything here is
invented: the company, the data and the page. Nothing in it comes from a real product.

- `src/` is the React prototype's source. `node build.mjs` bundles it into one self-contained page at `site/`.
- `.github/workflows/pages.yml` publishes `site/` to GitHub Pages on every push that changes it.
- Comments go on the review thread (issue #1), the same way comments are stored in the real workflow.
- `src/review.ts` adds commenting to the published page: pick an element, pin a comment, see the pins others left.
  The picking, the pins and the comment format are Flock Designer's own code, bundled in at build time (not included
  in this repository). To post from the page you paste a GitHub token with **Issues: read and write** on this
  repository; without one the page still shows comments, and the banner link opens the thread on GitHub.

To delete the experiment, delete this repository (Settings, then the danger zone). Nothing else depends on it.
