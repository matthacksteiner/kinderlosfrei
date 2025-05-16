# Baukasten Frontend

This is the Astro frontend part of the Baukasten project. It works in conjunction with the [CMS Baukasten](https://github.com/matthacksteiner/cms.baukasten) backend.

**Template Release:** v0.0.0

## Project Structure

## Update von Template Origin

### automated

run the script `update-template-version.sh` to fetch and merge the latest changes from the template repository.
use git-bash or WSL on Windows

### manual

1. `git remote add template https://github.com/matthacksteiner/baukasten`
2. `git fetch --all`
3. `git merge template/main --allow-unrelated-histories`
4. run the script `update-template-version.sh` to add the new version to the README.md or manually edit the file.

## Update Child Repositories

If you're using this repository as a template for multiple projects, you can use the GitHub Action to push template changes to all child repositories.

### Setup

1. Edit `.github/child-repositories.json` to add your child repositories.
2. You'll need to create a Personal Access Token (PAT) with `repo` permissions.
3. Add the token as a repository secret named `PAT_TOKEN`.

### Usage

1. Go to the Actions tab in GitHub.
2. Select the "Update Child Repositories" workflow.
3. Click "Run workflow".
4. Configure the options:
   - Commit message for the update
   - Branch name to create in child repositories
   - Whether to create a pull request
5. Click "Run workflow" to start the process.

## GitHub Workflow: Update Child Repositories

This project includes automation for propagating template changes to child repositories using a custom GitHub Actions workflow and configuration file.

### Workflow: `.github/workflows/update-child-repos.yml`

- **Purpose:** Automates the process of updating all child repositories with the latest changes from this template repository.
- **How it works:**
  - Can be triggered manually via GitHub Actions (workflow_dispatch).
  - Clones each child repository listed in `.github/child-repositories.json`.
  - Merges changes from the template repository into a new branch in each child repo.
  - Handles merge conflicts according to the selected strategy (abort or create a conflict PR).
  - Optionally creates a pull request in each child repository for review and merging.
- **Inputs:**
  - Commit message, branch name, whether to create a PR, and conflict strategy (abort or PR).

### Configuration: `.github/child-repositories.json`

- **Purpose:** Lists all child repositories that should receive updates from the template.
- **Format:**
  ```json
  {
  	"repositories": [
  		{
  			"name": "Super Baukasten",
  			"url": "https://github.com/matthacksteiner/super"
  		},
  		{
  			"name": "Betina Ammann Physio",
  			"url": "https://github.com/matthacksteiner/betinaamann-physio.at"
  		}
  	]
  }
  ```
- **How to use:**
  - Add or remove repositories as needed to control which projects receive updates.

### Usage Steps

1. Edit `.github/child-repositories.json` to include all relevant child repositories.
2. Trigger the workflow via the GitHub Actions tab ("Update Child Repositories").
3. Configure the workflow inputs as needed (commit message, branch name, PR creation, conflict strategy).
4. The workflow will process each child repository, merge changes, and create PRs if configured.

> **Note:** You need a Personal Access Token (PAT) with `repo` permissions stored as the `PAT_TOKEN` secret in your repository for this workflow to function.

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
