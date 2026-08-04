# Goal: Advanced Modern Futuristic GK Platform

Create a premium‑looking, fast, and feature‑rich web experience that combines the existing quiz platform with a new badge‑catalog built with Next.js. The admin panel must be able to add quizzes that appear instantly for users, and users earn badge icons shown in a futuristic gallery.

## User Review Required
> [!IMPORTANT]
> - Confirm the Netlify site names for the **quiz platform** and the **badge catalog** (e.g., `gk-quiz` and `gk-badges`).
> - Approve the chosen color palette and Google Font (default: Inter). If you prefer a different palette, let me know.
> - Decide whether badge icons should be generated now (placeholder neon icons) or supplied later.

## Open Questions
> [!WARNING]
> - **Badge icon source**: Should we generate 50 neon‑cyber‑punk icons using the `generate_image` tool now, or will you provide assets?
> - **Deployment domains**: Do you want both sites under the same Netlify account with sub‑paths (e.g., `/quiz` and `/badges`) or separate Netlify sites?
> - **User authentication sharing**: Should the Next.js badge app read the existing `localStorage` data (`alaquizpedia_db`) directly, or should we expose a tiny JSON endpoint from the quiz site?

## Proposed Changes
---
### 1. Scaffold Badge Catalog (Next.js)
- **[NEW] gk-badge-next/** – run `npx -y create-next-app@latest .` inside this folder.
- Add `tsconfig.json`, `next.config.js` with strict TypeScript.
- Install TailwindCSS (optional) – but we will use vanilla CSS with custom variables for the premium look.
- Create a design system (`styles/theme.css`) with:
  - Dark mode, glass‑morphism containers, neon gradient accent.
  - Google Font **Inter** loaded via `<link>` in `_document.js`.
- Pages:
  - `/` – landing with animated badge gallery.
  - `/profile` – reads user scores from `localStorage` (or fetches `/api/user`) and displays earned badges.
  - `/api/user` – simple API route that returns the user data stored in `localStorage` via a tiny server‑side script (fallback for static export).

---
### 2. Badge Generation Script
- **[NEW] tools/generate_badges.js** – Node script that uses the `generate_image` tool to create 50 placeholder badge PNGs (neon‑cyber‑punk style) saved in `public/badges/`.
- The script will be invoked after scaffolding; it will also create a `badges.json` manifest mapping badge IDs to image filenames and description.

---
### 3. Integrate with Existing Quiz Platform
- Update `index.html` and `admin-quiz-edit.html` to include a **"My Badges"** link that points to the badge catalog (`https://<badge‑site>.netlify.app`).
- Add a small JS module (`js/badge-sync.js`) in the quiz platform that writes earned badge IDs into `localStorage.alaquizpedia_db.badges` whenever a quiz is completed.
- Ensure the badge catalog can read this data instantly (no server request needed). Use lazy loading for badge images to keep UI snappy.

---
### 4. SEO & Performance Enhancements
- Add `<title>`, meta description, Open Graph tags to all pages.
- Use `preload` for critical CSS, `media` queries for responsive images.
- Enable `vite`/`next` static export (`next export`) for a fully static Netlify deployment.
- Add a service worker (`public/sw.js`) to cache assets and provide instant navigation.

---
### 5. Netlify Deployment
- **[NEW] netlify.toml** at repository root (shared for both projects) with two `[[redirects]]` rules:
  - `/quiz/*` → `https://<quiz‑site>.netlify.app/:splat`
  - `/badges/*` → `https://<badge‑site>.netlify.app/:splat`
- Create a simple CI script (`deploy.sh`) that runs `npm run build && netlify deploy --dir=out --prod` for each project.

---
## Verification Plan
- **Automated**: Run `npm run lint` and `npm test` (placeholder) for the Next.js app.
- **Manual**: Open the deployed Netlify URLs, create a quiz via admin, complete it, and verify the badge appears instantly in the badge gallery.
- Check SEO tags with `curl -I` and ensure no 404s.

---
**Next Step**: Await your answers to the open questions and approval of the plan before we start creating files and running commands.
