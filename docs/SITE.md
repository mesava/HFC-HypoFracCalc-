# HFC website

HFC is implemented as a static React + TypeScript + Vite site.

## Site sections

- **Home** — project overview and module status.
- **Quick EQD** — evidence-driven BED/EQD2 calculator.
- **Compare Regimens** — multi-regimen tumour/OAR comparison matrix.
- **Treatment Gap** — interruption and compensation workflow.
- **Methodology** — formulas, evidence governance and intended use.
- **Reirradiation** — planned future module.

## Local development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run typecheck
npm test
npm run build
```

CI runs all three steps on pull requests.

## GitHub Pages

`.github/workflows/deploy-pages.yml` builds and deploys the site after a push to `main`.

Repository settings must allow **GitHub Actions** as the Pages source. Once enabled and the website branch stack is merged into `main`, the workflow will publish the generated `dist/` artifact.

Vite currently uses a relative base path (`./`), allowing the same production bundle to work under the repository sub-path used by GitHub Pages.

## No backend in v0.1

All calculations and evidence lookups run locally in the browser. No patient identifiers or clinical inputs are sent to a server by the HFC application itself.

If future DICOM or account-backed functionality is introduced, privacy/security architecture must be reviewed separately before implementation.
