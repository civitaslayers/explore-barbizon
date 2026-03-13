#!/usr/bin/env bash
# Pre-commit validation hook
# Runs automatically before any git commit via PreToolUse hook.
# A non-zero exit blocks the commit and shows errors to Claude.

set -e

echo "--- pre-commit: running typecheck ---"
if ! npx tsc --noEmit 2>&1; then
  echo ""
  echo "BLOCKED: TypeScript errors must be fixed before committing."
  exit 1
fi

echo "--- pre-commit: running lint ---"
if ! npm run lint 2>&1; then
  echo ""
  echo "BLOCKED: Lint errors must be fixed before committing."
  exit 1
fi

echo "--- pre-commit: all checks passed ---"
exit 0
