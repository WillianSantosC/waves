#!/usr/bin/env bash

# ============================================================================
# GitHub Labels Synchronization
#
# Synchronizes the repository labels defined in .github/labels.json with the
# current GitHub repository.
#
# Features:
# - Creates labels that do not exist.
# - Updates color and description of existing labels.
# - Safe to execute multiple times (idempotent).
#
# Requirements:
# - GitHub CLI (gh)
# - jq
#
# Usage:
#   ./scripts/github/sync-labels.sh
# ============================================================================

set -Eeuo pipefail

LABELS_FILE=".github/labels.json"

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is not installed."
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is not installed."
  exit 1
fi

if [[ ! -f "$LABELS_FILE" ]]; then
  echo "Labels file not found: $LABELS_FILE"
  exit 1
fi

REPOSITORY=$(gh repo view --json nameWithOwner --jq '.nameWithOwner')

echo "Repository: $REPOSITORY"
echo

echo "Synchronizing GitHub labels..."
echo

jq -c '.[]' "$LABELS_FILE" | while read -r label; do

  NAME=$(echo "$label" | jq -r '.name')
  COLOR=$(echo "$label" | jq -r '.color')
  DESCRIPTION=$(echo "$label" | jq -r '.description')

  if gh label list --json name --jq '.[].name' | grep -Fxq "$NAME"; then

    echo "Updating: $NAME"

    gh label edit "$NAME" \
      --color "$COLOR" \
      --description "$DESCRIPTION"

  else

    echo "Creating: $NAME"

    gh label create "$NAME" \
      --color "$COLOR" \
      --description "$DESCRIPTION"

  fi

done

echo
echo "GitHub labels synchronized successfully."
