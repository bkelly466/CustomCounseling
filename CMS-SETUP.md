# Content Editing Setup — Sveltia CMS

This site's editable copy lives in `src/content/` as Markdown/YAML files, and
[Sveltia CMS](https://sveltiacms.app/) gives Eric a simple, non-technical
editing screen at `/admin` that writes to those files for him. No database,
no extra hosting — Sveltia is a static JS app loaded from a CDN, and it
commits changes straight to this GitHub repo. Every commit triggers a
Cloudflare Pages rebuild, so edits go live within about a minute.

## What Eric can edit

| Section | Where it lives | What's editable |
|---|---|---|
| Home page | `src/content/pages/home.md` | Hero heading/subheading, intro text, SEO description |
| About page | `src/content/pages/about.md` | Bio text, SEO description |
| Services | `src/content/services/*.md` | Add/remove/reorder services, title, summary, optional long description |
| FAQ | `src/content/faq/*.md` | Add/remove/reorder questions and answers |
| Site settings | `src/content/settings/site.yml` | Phone, email, booking link, service-area text, crisis disclaimer |

All current content is placeholder text flagged `_Draft placeholder..._` —
replace it with real copy during the content review pass with Eric before
launch.

## One-time setup (Brandon)

Sveltia authenticates through GitHub, and since we're not on Netlify there's
no built-in OAuth handler — it needs one small Cloudflare Worker. All of this
is free and stays inside the Cloudflare/GitHub accounts you already have.

**1. Push this repo to GitHub**, if it isn't already:
```
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

**2. Connect the repo to Cloudflare Pages** (if not done yet): build command
`npm run build`, output directory `dist`.

**3. Deploy the Sveltia auth worker.** This is a one-click deploy — no code
to write:
- Go to https://github.com/sveltia/sveltia-cms-auth and click **Deploy to
  Cloudflare Workers**, sign in with your existing Cloudflare account, and
  deploy.
- Once deployed, copy the worker's URL from the Cloudflare dashboard
  (`https://sveltia-cms-auth.<your-subdomain>.workers.dev`).

**4. Register a GitHub OAuth App**: https://github.com/settings/applications/new
- Application name: `Denver Custom Counseling CMS` (or anything)
- Homepage URL: your site's URL
- Authorization callback URL: `<worker URL from step 3>/callback`
- Click **Generate a new client secret** and copy both the **Client ID** and
  **Client Secret**.

**5. Add the OAuth credentials to the worker.** In the Cloudflare dashboard:
`Workers & Pages` → the `sveltia-cms-auth` worker → `Settings` → `Variables`,
add:
- `GITHUB_CLIENT_ID` — from step 4
- `GITHUB_CLIENT_SECRET` — from step 4 (click **Encrypt**)
- `ALLOWED_DOMAINS` — your site's domain, e.g. `denvercustomcounseling.com`

**6. Update `public/admin/config.yml`** — replace the two `TODO` values:
```yaml
backend:
  repo: <you>/<repo>
  base_url: https://sveltia-cms-auth.<your-subdomain>.workers.dev
```
Commit and push. Cloudflare Pages will redeploy automatically.

**7. Give Eric access.** On GitHub: repo → `Settings` → `Collaborators` →
invite Eric's GitHub account (he'll need a free one — signing up takes two
minutes) with **Write** access. He never needs to open GitHub itself; this
just authorizes his login on the `/admin` screen.

## Eric's day-to-day workflow

1. Go to `yoursite.com/admin`.
2. Sign in with GitHub (only required the first time on a given device).
3. Pick a page or item from the sidebar, edit the fields, click **Publish**.
4. The change is live in about a minute — no need to tell Brandon unless
   something looks wrong.

## Notes

- **Cost:** $0/month added. Sveltia CMS is free/open source, the auth worker
  runs on Cloudflare's free tier, and Cloudflare Pages builds are also free
  at this traffic level.
- **Multi-user caution:** Sveltia doesn't lock entries while someone's
  editing. Since only Eric (and occasionally Brandon) will touch this, that's
  not a real risk here — just don't edit the same item at the same time.
- **Why Sveltia over Decap CMS:** Sveltia is the actively maintained
  successor to Decap/Netlify CMS — mobile-friendly, faster, and its GitHub
  auth piece is a small Cloudflare Worker, which fits this stack better than
  Decap's equivalent (same idea, less polished tooling around it).
