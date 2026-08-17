# The Tiny Internet Museum

A spatial, interactive museum for seven artifacts from the handmade web.

## Technical collection

- **Next.js + React** — statically exported application architecture and interactive exhibit state
- **TypeScript** — strict catalog types, keyboard controls, audio synthesis, and interaction logic
- **Tailwind CSS + CSS** — build pipeline plus a custom responsive spatial system
- **Node.js** — type checking, production compilation, and GitHub Pages export
- **Python** — catalog validation and generation of the client-side search index
- **JSON** — portable, structured artifact collection
- **REST API** — live repository metadata from the GitHub API
- **Git + GitHub Actions** — automated validation, build, artifact packaging, and Pages deployment

## Local development

```bash
npm install
npm run dev
```

The production workflow validates the JSON collection with Python, type-checks the React application, performs a Next.js static export, and deploys the result to GitHub Pages.
