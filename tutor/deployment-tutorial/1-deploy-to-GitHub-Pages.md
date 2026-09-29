# Deployment Tutorial ①: Publish to GitHub Pages (Free)

> Goal: turn your fork of this 3D résumé into a URL anyone can visit, such as
> `https://your-username.github.io/sen-3d-resume/`.
>
> All you need is a GitHub account — **it's all point-and-click, no commands to type**.
> Want to use your own domain? See the other guide,
> [② Deploy to Cloudflare Pages](2-deploy-to-Cloudflare-Pages.md).

---

## How it works in one minute (optional)

- This repo already includes an "auto-deploy script":
  [`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml).
- What it does: **every time you push code to GitHub, GitHub automatically builds and
  publishes the site for you** — you don't need to install anything.
- So you only have two things to do: ① put the code in your own GitHub repo; ② turn on
  the "Pages" switch in the repo settings.

---

## Prerequisites

1. A [GitHub](https://github.com) account.
2. The project is **under your own account** (not the original author's repo). Two common
   ways to get there:
   - **Fork**: click `Fork` in the top-right of the original repo to copy it into your
     account.
   - **Upload it yourself**: create a new repo and push the code to it.
3. Make sure your repo's **default branch is `main`** (most new repos are). The
   auto-deploy script listens to the `main` branch.

> 💡 As long as the code is under your account and the default branch is `main`, you're
> ready for the next step.

---

## Step 1: Turn on GitHub Pages

1. Go to your repo's home page and click **Settings** at the top.
2. Scroll down the left menu to **Pages** and click it.
3. Under **Build and deployment → Source**, choose **GitHub Actions** from the dropdown.

   > ⚠️ Be sure to pick **GitHub Actions**, not "Deploy from a branch".
   > This project is built automatically with Actions — pick the wrong one and nothing
   > will publish.

No need to click save — it remembers your choice automatically.

---

## Step 2: Trigger a deployment

The auto-deploy script only runs when "code is pushed" or when you "click to run it
manually". For the first run you can trigger it manually:

1. Go back to the repo home page and click the **Actions** tab at the top.
2. On the left, click the **Deploy to GitHub Pages** workflow.
3. On the right, click **Run workflow ▸**, choose the `main` branch, then click the green
   **Run workflow** button.

> From then on, **every time you change the code and push to `main`, it redeploys
> automatically** — no more manual clicks.

---

## Step 3: Wait for it to finish and get your URL

1. Still on the **Actions** page, you'll see a run in progress (a spinning yellow dot,
   about 1–3 minutes).
2. When it turns into a **green ✓**, it succeeded.
3. Go back to **Settings → Pages** — your URL is shown at the top of the page:

   ```
   https://your-github-username.github.io/repo-name/
   ```

   For example, the original author's is <https://dayinji.github.io/sen-3d-resume/>.

Open that URL and your 3D résumé is live 🎉

---

## FAQ (check when you hit a problem)

**Q: The run in Actions turned into a red ✗ — what now?**
Click into the failed run and expand the red step to see the error. The most common cause
is a syntax error in the code itself — first get `cd web && npm run build` working
locally, then push.

**Q: The URL shows a 404 / a blank page?**
- Make sure **Source is set to GitHub Actions** (Step 1), not branch mode.
- Make sure the run in Actions **succeeded (green)**.
- Right after deploying you sometimes need to wait 1–2 minutes, or hard-refresh
  (`Ctrl/Cmd + Shift + R`).

**Q: The page opens, but the 3D model / images don't load?**
This project's build already uses **relative paths** (`base: './'` in
`web/vite.config.ts`), so it loads fine from a subdirectory — usually nothing to change.
If you swapped in your own model/images, check that the files actually ended up in the
`web/public/` directory.

**Q: My repo is private — can I use Pages?**
On a free account, GitHub Pages requires the repo to be **public**. To use Pages with a
private repo you need GitHub Pro, or use [Cloudflare Pages](2-deploy-to-Cloudflare-Pages.md)
instead (free for private repos too).

**Q: I want to use my own domain (e.g. `me.example.com`)?**
GitHub Pages supports custom domains too (Settings → Pages → Custom domain). But if you
care about access speed in mainland China or want more flexible domain/caching control,
[Cloudflare Pages](2-deploy-to-Cloudflare-Pages.md) is the better choice.

---

## Next steps

- Want to swap in your own content (name / model / résumé / works)? See the customization
  sections of [`README.md`](../../README.md) at the repo root, and [`NOTICE`](../../NOTICE)
  (the original author's personal assets are not part of the open-source release —
  remember to replace them).
- Want to deploy on Cloudflare / use a custom domain? →
  [② Deploy to Cloudflare Pages](2-deploy-to-Cloudflare-Pages.md)
