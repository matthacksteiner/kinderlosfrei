# baukasten

This project is based on the [Baukasten](https://github.com/matthacksteiner/baukasten) template.

**Template Release:** v0.0.0

## Update von Template Origin

### automated

run the script `update-template-version.sh` to fetch and merge the latest changes from the template repository.
use git-bash or WSL on Windows.

### manual

1. `git remote add template https://github.com/matthacksteiner/baukasten`
2. `git fetch --all`
3. `git merge template/main --allow-unrelated-histories`
4. run the script `update-template-version.sh` to add the new version to the README.md or manually edit the file.

## Installation

Setup: https://github.com/matthacksteiner/cms.baukasten

## Semantic Versioning

This project uses semantic versioning for automatic version management. The version number is automatically incremented based on commit message patterns:

- `major:` in commit message: Increments major version (e.g., 1.0.0 -> 2.0.0)
- `feat:` in commit message: Increments minor version (e.g., 1.0.0 -> 1.1.0)
- `fix:` in commit message: Increments patch version (e.g., 1.0.0 -> 1.0.1)

> **Info:** If no pattern is found, the version is incremented by 0.0.1.
