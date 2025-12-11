#!/bin/bash

# Release script using standard-version for automated versioning and changelog
# Usage: ./scripts/release.sh [patch|minor|major]
# Example: ./scripts/release.sh minor
#
# This script uses standard-version which:
# - Bumps version in package.json based on SemVer
# - Generates/updates CHANGELOG.md from commit messages
# - Creates a git tag
# - Commits the changes
#
# Note: This assumes a PR-based workflow. Releases should be created from main after PRs are merged.

set -e

RELEASE_TYPE=${1:-patch}

if [[ ! "$RELEASE_TYPE" =~ ^(patch|minor|major)$ ]]; then
  echo "ERROR: Invalid release type: $RELEASE_TYPE"
  echo "   Usage: ./scripts/release.sh [patch|minor|major]"
  exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "WARNING: You're not on main branch (currently on $CURRENT_BRANCH)"
  echo "   Releases should typically be created from main after PRs are merged."
  read -p "   Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Ensure we're up to date with remote
echo "Fetching latest changes..."
git fetch origin

# Check if local main is behind remote
if [ "$CURRENT_BRANCH" = "main" ]; then
  LOCAL=$(git rev-parse @)
  REMOTE=$(git rev-parse @{u})
  BASE=$(git merge-base @ @{u})

  if [ "$LOCAL" != "$REMOTE" ] && [ "$LOCAL" = "$BASE" ]; then
    echo "WARNING: Your local main is behind remote. Pulling latest changes..."
    git pull origin main
  fi
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo "ERROR: You have uncommitted changes. Please commit or stash them first."
  exit 1
fi

# Run standard-version
echo "Creating $RELEASE_TYPE release with standard-version..."
npm run "release:$RELEASE_TYPE"

# Get the new version
NEW_VERSION=$(node -p "require('./package.json').version")

echo ""
echo "Release v${NEW_VERSION} created!"
echo ""
echo "Next steps:"
echo "   1. Review the changes: git log HEAD~1..HEAD"
echo "   2. Review CHANGELOG.md"
echo "   3. Push the release: git push --follow-tags origin main"
echo "   4. Create GitHub release: https://github.com/MildTomato/summersmuir/releases/new"
echo "      (Select tag v${NEW_VERSION} and copy from CHANGELOG.md)"

