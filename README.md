# vyu.frames — v3

## What's new in v3
- **Globe Express-style showcase** — full-bleed hero image with a floating 4-card stack on the right. Clicking any stack card promotes it to the hero.
- **Wordmark = editor trigger** — hold "vyu.frames" (top-left) for 7 seconds, enter PIN `150106`.
- **Per-image fields** — each photo has its own Location (eyebrow), Title (big text), and Description shown on the hero.
- Single-page design, no Photos grid tab anymore.

---

## Setup before deploying

1. Unzip and `cd vyu-frames`
2. Edit `.env.local` with your values:
   - `GITHUB_TOKEN` — GitHub Personal Access Token with **repo** scope (github.com/settings/tokens)
   - `GITHUB_REPO` — e.g. `yourusername/vyu-frames`
   - `EDITOR_PIN` — default `150106`, change anytime
   - `SESSION_SECRET` — **change to a long random string before going live**

3. Push to GitHub via Termux:
   ```bash
   git init
   git add .
   git commit -m "vyu.frames v3"
   git branch -M main
   git remote add origin https://github.com/yourusername/vyu-frames.git
   git push -u origin main
   ```

4. Import the repo in Vercel.
5. **In Vercel → Project Settings → Environment Variables**, add the same 4 vars manually:
   - `GITHUB_TOKEN`
   - `GITHUB_REPO`
   - `EDITOR_PIN`
   - `SESSION_SECRET`
   
   Vercel does NOT read `.env.local` from the repo — these must be added in the Vercel dashboard.

6. Deploy. Every time you save from the editor, it commits to GitHub → Vercel auto-redeploys.

---

## How the editor works

1. Hold the **vyu.frames** wordmark (top-left corner) for 7 seconds.
2. A progress bar fills below the text as you hold.
3. PIN screen appears — enter `150106`.
4. Editor opens with 3 tabs: **Content** (site name), **Images** (upload, titles, descriptions), **Logo** (replace live).
5. Hit **Save All Changes** — writes to GitHub, triggers Vercel redeploy.

---

## Security

- All write endpoints (`/api/save-data`, `/api/upload-image`, `/api/upload-logo`) require a signed Bearer token — not just the PIN. Direct API calls without a valid session token return 401.
- Hero subtitle is plain text — no HTML injection possible.
- File uploads: 8MB max for images, 3MB for logo. Type-checked server-side.
- `SESSION_SECRET` signs the editor token — keep it secret and non-trivial.
