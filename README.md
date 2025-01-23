# baukasten

This project is based on the [Baukasten](https://github.com/matthacksteiner/baukasten) template.

**Template Release:** v1.1.8

## Update von Template Origin

run the script `update-template-version.sh` to fetch and merge the latest changes from the template repository. use git-bash or WSL on Windows.

## Installation

Anleitung siehe https://github.com/matthacksteiner/cms.baukasten

## Semantic Versioning

This project uses semantic versioning for automatic version management. The version number is automatically incremented based on commit message patterns:

- `major:` in commit message: Increments major version (e.g., 1.0.0 -> 2.0.0)
- `feat:` in commit message: Increments minor version (e.g., 1.0.0 -> 1.1.0)
- `fix:` in commit message: Increments patch version (e.g., 1.0.0 -> 1.0.1)

> **Info:** If no pattern is found, the version is incremented by 0.0.1.
