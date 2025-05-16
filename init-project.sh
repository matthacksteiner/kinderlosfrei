#!/bin/bash

# init-project.sh
#
# This script removes template maintenance files that are not needed
# in child repositories. Run this script once after creating a new
# project from the Baukasten template.

echo "Initializing project by removing template maintenance files..."

# Remove workflow files
if [ -f .github/workflows/semantic-version.yml ]; then
  rm .github/workflows/semantic-version.yml
  echo "✓ Removed semantic-version.yml"
else
  echo "✗ semantic-version.yml not found"
fi

if [ -f .github/workflows/update-child-repos.yml ]; then
  rm .github/workflows/update-child-repos.yml
  echo "✓ Removed update-child-repos.yml"
else
  echo "✗ update-child-repos.yml not found"
fi

# Remove configuration files
if [ -f .github/child-repositories.json ]; then
  rm .github/child-repositories.json
  echo "✓ Removed child-repositories.json"
else
  echo "✗ child-repositories.json not found"
fi

# Optional: Remove this script itself
read -p "Do you want to remove this script (init-project.sh) as well? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  rm -- "$0"
  echo "✓ Removed init-project.sh"
fi

echo "Initialization complete! Your project is now ready for development."