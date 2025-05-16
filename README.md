# Baukasten Frontend

This is the Astro frontend part of the Baukasten project. It works in conjunction with the [CMS Baukasten](https://github.com/matthacksteiner/cms.baukasten) backend.

**Template Release:** v0.0.0

## Project Structure

## Template Maintenance & Automation

> **Note:** Template maintenance scripts and automation (such as updating child repositories and semantic versioning) are managed in the `template-tool` branch. If you are a template maintainer, please refer to the `template-tool` branch for documentation and configuration files related to:
>
> - Updating child repositories
> - Managing the list of children
> - Template semantic versioning

## Updating from Template (for Child Repositories)

### Automated

If you are using this repository as a child (project), you do **not** need to manage update automation or semantic versioning workflows. To update your project from the template:

1. Add the template as a remote:
   ```sh
   git remote add template https://github.com/matthacksteiner/baukasten
   git fetch --all
   git merge template/main --allow-unrelated-histories
   ```
2. Run the script `update-template-version.sh` to update the template version in your README, or manually edit the version.

### Manual

1. `git remote add template https://github.com/matthacksteiner/baukasten`
2. `git fetch --all`
3. `git merge template/main --allow-unrelated-histories`
4. Run the script `update-template-version.sh` to add the new version to the README.md or manually edit the file.

## Setup Instructions

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

## Template Maintainers

For documentation on managing child repositories, update automation, and semantic versioning, see the `README.md` in the `template-tool` branch.
