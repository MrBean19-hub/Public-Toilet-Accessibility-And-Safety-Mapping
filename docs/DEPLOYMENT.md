# Deployment: get a live working prototype URL

The submission needs a live prototype that reviewers can use without installing anything. This app builds to static files, so any of the three options below works.

## Option A: GitHub Pages (automatic, recommended)

1. Push the repository to GitHub (branch `main`).
2. Open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. The workflow `.github/workflows/deploy.yml` runs on every push. Open the **Actions** tab and wait for the green check.
4. Your site is at `https://YOUR-USERNAME.github.io/YOUR-REPO/`. Paste it into the registration form and the top of the README.

## Option B: Vercel

1. Go to vercel.com, choose **Add New → Project**, and import the GitHub repository.
2. Keep the detected settings (Vite). Click **Deploy**.
3. Use the `*.vercel.app` URL.

## Option C: Netlify

1. Go to netlify.com, choose **Add new site → Import an existing project**, and pick the repository.
2. Build command `npm run build`, publish directory `dist` (already set in `netlify.toml`).

## Before you submit

- Open the live URL on your phone and on a laptop; add a review with a photo.
- Keep the links working until evaluation ends (do not delete or rename the repository).
- Optional: set `VITE_DEFAULT_LAT` and `VITE_DEFAULT_LNG` (in GitHub: Settings → Secrets and variables → Actions → Variables, then pass them to the build step) so the demo opens in your city.
