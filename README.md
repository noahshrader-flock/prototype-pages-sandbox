# Prototype sandbox

A test of publishing **built React prototypes** to GitHub Pages and collecting comments on them. Everything here is
invented: the company, the data and the page. Nothing in it comes from a real product.

- `src/` is the React prototype's source. `node build.mjs` bundles it into one self-contained page at `site/`.
- `.github/workflows/pages.yml` publishes `site/` to GitHub Pages on every push that changes it.
- Comments go on the review thread (issue #1), the same way comments are stored in the real workflow.

To delete the experiment, delete this repository (Settings, then the danger zone). Nothing else depends on it.
