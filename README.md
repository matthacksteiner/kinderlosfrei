# Baukasten Frontend

This is the Astro frontend part of the Baukasten project. It works in conjunction with the [CMS Baukasten](https://github.com/matthacksteiner/cms.baukasten) backend.

## Project Structure

```
├── Frontend (this repository)
│   └── Astro-based frontend application
└── Backend (separate repository)
    └── Kirby CMS installation
```

## Updating from Template (for Child Repositories)

### Automated

Run the script `update-template-version.sh` to fetch and merge the latest changes from the template repository. Use Git Bash or WSL on Windows

### Manual

To update your project from the template:

```sh
git remote add template https://github.com/matthacksteiner/baukasten
git fetch --all
git merge template/main --allow-unrelated-histories
```

## Setup Instructions

1. Create a new repository from the [Baukasten template](https://github.com/matthacksteiner/baukasten).
2. Run the initialization script to remove template maintenance files:

   ```sh
   ./init-project.sh
   ```

   This script removes workflow files that are only needed in the template repository but not in child projects.

3. Create a new site on Netlify:
   - Set `npm run build` as the build command.
   - Add the following environment variables:
     - `KIRBY_URL`: `https://baukasten.matthiashacksteiner.net`
     - `NETLIFY_URL`: `https://baukasten.netlify.app`
4. Restart the build if necessary.

---

## Template Maintenance System

This repository uses a `.templateignore` system to prevent template-specific files from being pushed to child repositories during updates:

### For Template Maintainers

- Edit `.templateignore` to add or remove files that should be excluded from child repositories.
- The automated update workflow (`.github/workflows/update-child-repos.yml`) reads this file and automatically removes listed files from child repositories.
- Common files to exclude:
  - Template maintenance workflows.
  - Repository configuration files (like `child-repositories.json`).
  - Template-specific documentation.

### For Child Repository Owners

- Template-specific files are automatically excluded during updates.
- If you manually merge template changes, run `./init-project.sh` to clean up any template files.
- The init script also reads from `.templateignore` for consistency.

---

## Setting Up Webhooks

1. **Netlify Build Hook:**
   - Go to **Site Settings > Build & Deploy > Build Hooks** and create a new hook (e.g., `https://app.netlify.com/projects/arch-broger/configuration/deploys#build-hooks`).
   - Add the hook URL to `site/config/config.php`.
2. **Outgoing Webhooks:**
   - Under **Settings > Deploys > Deploy Notifications**, create two new outgoing webhooks:
     1. **Deploy Succeeded:** `https://your-cms-domain.com/webhook/netlify_deploy/success`
     2. **Deploy Failed:** `https://your-cms-domain.com/webhook/netlify_deploy/error`
3. Update the Netlify hook URL in `site/config/config.php` on the SSH server.
