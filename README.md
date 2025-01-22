# baukasten

Template: https://github.com/matthacksteiner/baukasten

## Update von Template Origin

`git remote add template https://github.com/matthacksteiner/baukasten`

`git fetch --all`

`git merge template/main --allow-unrelated-histories`

## Installation

Anleitung siehe https://github.com/matthacksteiner/cms.baukasten

## Semantic Versioning

This project uses semantic versioning for automatic version management. The version number is automatically incremented based on commit message patterns:

- `major:` in commit message: Increments major version (e.g., 1.0.0 -> 2.0.0)
- `feat:` in commit message: Increments minor version (e.g., 1.0.0 -> 1.1.0)
- `fix:` in commit message: Increments patch version (e.g., 1.0.0 -> 1.0.1)

> **Info:** If no pattern is found, the version is incremented by 0.0.1.

![GitHub release](https://img.shields.io/github/v/release/matthacksteiner/baukasten?display_name=tag)

Current version: v0.0.0
