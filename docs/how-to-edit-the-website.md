# How to Edit Your Website Yourself

Your site auto-deploys: whenever a change is saved to the `main` branch on GitHub, Vercel rebuilds and publishes it live within ~1-2 minutes. If a change ever breaks the build, your **old site stays live** until a working version is ready — you can't accidentally take the site down.

**Repo:** https://github.com/ghorditoo/-sun-valley-scraps-no-README-license-

## The easiest way to edit (no computer setup needed)

1. Go to the repo link above on GitHub (log in with your account).
2. Click into any file listed below.
3. Click the **pencil icon** (top right of the file view) to edit.
4. Make your change.
5. Scroll down, click **"Commit changes..."** → **"Commit directly to the main branch"** → **Commit changes**.
6. Wait ~1-2 minutes, then refresh `sunvalleyscraps.com`.

That's it — no downloads, no terminal.

---

## 1. Changing Colors (one file controls the whole site)

File: **`web/src/app/globals.css`**

Near the top you'll see:

```css
@theme {
  --color-brand-50: #fffbeb;
  --color-brand-100: #fef3c7;
  --color-brand-200: #fde68a;
  --color-brand-300: #fcd34d;
  --color-brand-400: #fbbf24;
  --color-brand-500: #f59e0b;
  --color-brand-600: #d97706;
  --color-brand-700: #b45309;
  --color-brand-800: #92400e;
  --color-brand-900: #78350f;
}
```

Every button, link, and accent color on the site reads from these 10 values. Change the hex codes and the **entire site retints automatically** — you don't need to touch any other file.

- Get new hex codes from any color picker (e.g. search "hex color picker" in your browser, or use Adobe Color / Coolors.co).
- Keep them roughly light→dark in order (50 = lightest, 900 = darkest) so text stays readable.
- `--color-brand-700` is the most visible one (main button color) — if you only change one, change that.

Section background tints (the warm cream areas) use Tailwind's built-in `orange-50` / `orange-100` classes directly in a few component files — those are cosmetic and lower priority; ask me to adjust them if you want a different background tone.

---

## 2. Changing Images

| What you want to change | Where the files live | How |
|---|---|---|
| Logo | `web/public/logos/` (`logo-mark.svg`, `logo-horizontal.svg`, `logo-monochrome-white.svg`) | Upload a new file with the **exact same name** to replace it. |
| Real project photos (3D showcase + gallery) | `web/public/gallery/showcase/project-01.jpg` through `project-27.jpg` | Upload a replacement with the same filename, or add new files and list them in `web/src/data/showcasePhotos.ts`. |
| Homepage "Recent Projects" (3 photos) | `web/public/gallery/featured/` | Same — replace by filename, or edit `web/src/data/featuredProjects.ts` to point at new filenames. |
| Before/After slider pairs | `web/public/gallery/` (filenames listed in `web/src/data/projects.ts`) | Upload matching before/after JPGs using the filenames already referenced in that file. |
| Material dock thumbnails (pavers, turf, etc.) | `web/public/materials/` (filenames listed in `web/src/data/materials.ts`) | Upload a photo named to match, e.g. `paver-modern-gray.jpg`. |
| Service catalog category icons | `web/public/illustrations/` (7 SVGs — currently my hand-drawn placeholders) | Replace with real photos: add a `.jpg` with the same name (e.g. `hardscaping.jpg`) and edit the `src` path in `web/src/components/home/ServiceCatalog.tsx` from `.svg` to `.jpg`. |

**To upload a file via GitHub:** open the folder in the repo → click **"Add file" → "Upload files"** → drag your photo in → make sure the filename matches exactly → Commit changes.

---

## 3. Changing Text

- **Most site text (buttons, headings, service names, booking form labels) — both English and Spanish:**
  `web/src/i18n/dictionary.ts`
  Find the English phrase under `en: {...}` and its Spanish twin under `es: {...}`, edit the text between the quotes. Don't remove the quotes or commas.

- **The 7-category services list (descriptions, sub-services):**
  `web/src/data/serviceCatalog.ts`

- **Material prices and names in "Build Your Yard":**
  `web/src/data/materials.ts`

⚠️ When editing these files, only change the text **inside the quotation marks** — don't delete commas, colons, or curly braces, or the site will fail to build.

---

## 4. If Something Breaks

Any commit that fails to build simply won't replace your live site — check the **"Deployments"** tab in your Vercel dashboard for a red ✗ if you're unsure whether it worked. If you're ever unsure or something looks wrong, just tell me what you changed and I'll fix it.
