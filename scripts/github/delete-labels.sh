#!/usr/bin/env bash

# ============================================================================
# Delete all GitHub labels from the current repository.
#
# Use with caution.
# ============================================================================

set -Eeuo pipefail

REPOSITORY=$(gh repo view --json nameWithOwner --jq '.nameWithOwner')

echo "Repository: $REPOSITORY"
echo

gh label list --json name --jq '.[].name' |
while read -r label; do
  echo "Deleting: $label"
  gh label delete "$label" --yes
done

echo
echo "All labels have been deleted."
