# Baukasten Frontend

This is the Astro frontend part of the Baukasten project. It works in conjunction with the [CMS Baukasten](https://github.com/matthacksteiner/cms.baukasten) backend.

**Template Release:** v0.0.0

## Project Structure

## Update von Template Origin

### automated

run the script `update-template-version.sh` to fetch and merge the latest changes from the template repository.
use git-bash or WSL on Windows.

### manual

1. `git remote add template https://github.com/matthacksteiner/baukasten`
2. `git fetch --all`
3. `git merge template/main --allow-unrelated-histories`
4. run the script `update-template-version.sh` to add the new version to the README.md or manually edit the file.

## Semantic Versioning

This project uses semantic versioning for automatic version management. The version number is automatically incremented based on commit message patterns:

- `major:` in commit message: Increments major version (e.g., 1.0.0 -> 2.0.0)
- `feat:` in commit message: Increments minor version (e.g., 1.0.0 -> 1.1.0)
- `fix:` in commit message: Increments patch version (e.g., 1.0.0 -> 1.0.1)

> **Info:** If no pattern is found, the version is incremented by 0.0.1.

---

# Setup Instructions

## 1. Astro Frontend Installation

1. Create a new repository from the [Baukasten template](https://github.com/matthacksteiner/baukasten).
2. Update the `remote_images` domain in `netlify.toml`.
3. Create a new site on Netlify:
   - Set `npm run build` as the build command.
   - Add the following environment variables:
     - `KIRBY_URL`: `https://baukasten.matthiashacksteiner.net`
     - `NETLIFY_URL`: `https://baukasten.netlify.app`
4. Restart the build if necessary.

---

## 2. Setting Up Webhooks

1. **Netlify Build Hook:**
   - Go to **Site Settings > Build & Deploy > Build Hooks** and create a new hook.
   - Add the hook URL to `site/config/config.php`.
2. **Outgoing Webhooks:**
   - Under **Settings > Deploys > Deploy Notifications**, create two new outgoing webhooks:
     1. **Deploy Succeeded:** `https://cms.domain.de/webhook/netlify_deploy/success`
     2. **Deploy Failed:** `https://cms.domain.de/webhook/netlify_deploy/error`
3. Update the Netlify hook URL in `site/config/config.php` on the SSH server.

---
