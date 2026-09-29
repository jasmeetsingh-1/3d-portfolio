# Deployment Tutorial ②: Deploy to Cloudflare Pages (Free + Custom-Domain Friendly)

> Goal: deploy your fork of this 3D résumé to Cloudflare, get a
> `https://your-project-name.pages.dev` URL, and easily attach your own domain.
>
> Compared with [GitHub Pages](1-deploy-to-GitHub-Pages.md), Cloudflare Pages has these
> advantages: **free for private repos too**, a global CDN, and easier custom domains.
> It's also **mostly point-and-click**.

---

## How it works in one minute (optional)

- Cloudflare Pages **connects to your GitHub repo**; every time you push code, it pulls,
  builds, and publishes automatically.
- We need to tell it three things: **the code is in the `web/` subdirectory**, **which
  command builds it**, and **which folder the build output goes to**.
- This project builds with relative paths (`base: './'` in `web/vite.config.ts`), so it
  loads fine at the root of `*.pages.dev` — no code changes needed.

---

## Prerequisites

1. A [Cloudflare](https://dash.cloudflare.com/sign-up) account (free sign-up).
2. The project code is under **your own GitHub account** (forked or uploaded, either
   works).
3. Remember this project's key structure: **the front-end app lives in the `web/`
   directory, not the repo root** — this matters when you fill in the build settings.

---

## Step 1: Create a Pages project and connect GitHub

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com).
2. In the left menu choose **Workers & Pages**, then click **Create**.
3. Select the **Pages** tab and click **Connect to Git**.
4. Authorize Cloudflare to access your GitHub (the first time it redirects to GitHub for
   authorization — just approve; you can grant access to only this one repo).
5. Select your `sen-3d-resume` repo from the list and click **Begin setup**.

---

## Step 2: Fill in the build settings (**the most important step**)

On the "Set up builds and deployments" page, fill in the following:

| Setting | Value | Notes |
| --- | --- | --- |
| **Production branch** | `main` | The main branch you normally push to |
| **Framework preset** | `Vite` (choose `None` if it's not listed) | Doesn't matter much; the three below are what count |
| **Build command** | `npm run build` | The build command |
| **Build output directory** | `dist` | The folder the build output goes into |
| **Root directory (under Advanced)** | `web` | ⚠️ **Must be `web`**, since the app lives in the `web/` subdirectory |

> ⚠️ **The easiest place to go wrong**: because the code is in the `web/` subdirectory,
> you must expand **Root directory (advanced)** and enter `web`. Once that's set, the
> build command `npm run build` and output directory `dist` are correct (both are
> relative to `web/`).
>
> If you can't find "Root directory" in your UI, you can do this instead:
> set the build command to `cd web && npm install && npm run build` and the output
> directory to `web/dist`.

**Add one environment variable too (important — the build may fail otherwise):**

Under **Environment variables** on the same page, add:

```
Variable name: NODE_VERSION
Value:         20
```

> This project needs Node 20 (matching the repo's bundled GitHub deploy script). If you
> don't specify it, Cloudflare may use an older Node and the build will error out.

When you're done, click **Save and Deploy**.

---

## Step 3: Wait for it to finish and get your URL

1. Cloudflare starts building (you can watch the live log; about 1–3 minutes).
2. Once you see **Success**, the page gives you a URL:

   ```
   https://your-project-name.pages.dev
   ```

3. Open it and your 3D résumé is live 🎉

From then on, **every time you push code to `main`, Cloudflare redeploys
automatically**.

---

## Step 4 (optional): Attach your own domain

If you have your own domain (e.g. `me.example.com`):

1. In this Pages project, open the **Custom domains** tab and click **Set up a custom
   domain**.
2. Enter the domain you want to use and follow the prompts:
   - Domain already managed by Cloudflare → configured automatically in one click.
   - Domain managed elsewhere → it gives you a **CNAME record** to add at your domain
     registrar/DNS provider.
3. Wait for DNS to propagate (usually a few minutes to a few tens of minutes), and you
   can visit via your own domain; Cloudflare issues the HTTPS certificate automatically.

---

## FAQ (check when you hit a problem)

**Q: The build failed with an error in the log?**
- First check whether you forgot to set `NODE_VERSION=20` (Step 2).
- Make sure **Root directory is set to `web`** (or the build command uses `cd web && ...`).
- Run `cd web && npm run build` locally to confirm the code itself builds, then push.

**Q: The URL opens, but the page is blank / assets don't load?**
- Make sure the **output directory** is correct (`dist`, or `web/dist`).
- Try a hard refresh (`Ctrl/Cmd + Shift + R`).
- If you swapped in your own model/images, make sure the files are actually in
  `web/public/`.

**Q: Can I use GitHub Pages and Cloudflare Pages at the same time?**
Yes, they don't interfere with each other — you'll just have two URLs. Put whichever one
you want to promote in your résumé/README.

**Q: Can I skip connecting GitHub and just upload the built files?**
Yes. After running `cd web && npm run build` locally, drag the generated `web/dist`
folder into Pages via **Upload assets** to deploy — you'll just have to upload manually
every time you update, which is less convenient than the automatic Git connection.

---

## Next steps

- Want to swap in your own content (name / model / résumé / works)? See
  [`README.md`](../../README.md) and [`NOTICE`](../../NOTICE) at the repo root (the
  original author's personal assets are not part of the open-source release — remember to
  replace them).
- Want the other free option? → [① Publish to GitHub Pages](1-deploy-to-GitHub-Pages.md)
