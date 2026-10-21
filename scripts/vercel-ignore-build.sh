#!/usr/bin/env bash
# Vercel Ignored Build Step, wired in vercel.json:
#   "ignoreCommand": "bash scripts/vercel-ignore-build.sh"
# Vercel's convention: exit 0 = SKIP the build, any other exit = BUILD.
#
# Skip only when nothing outside docs/** and brain/** changed.
# - Production, main, or an unknown environment: compare HEAD with
#   VERCEL_GIT_PREVIOUS_SHA (last successful deployment of this branch).
# - Preview: compare HEAD with its merge base with main, fetched from
#   GitHub (public repo, anonymous), so a brand-new docs-only branch with
#   no previous deployment is skipped too. If main cannot be fetched or no
#   merge base is found, fall back to the previous-SHA rule.
# Fail safe: a missing variable, a missing commit, a network or git error
# always ends in BUILD, never in SKIP. Must stay bash 3.2 compatible.

export GIT_TERMINAL_PROMPT=0
NS="refs/vercel-ignore"
DEPTH=200
ENV_NAME="${VERCEL_ENV:-}"
REF="${VERCEL_GIT_COMMIT_REF:-}"

build() { echo "vercel-ignore: BUILD ($*)"; exit 1; }
skip()  { echo "vercel-ignore: SKIP ($*)"; exit 0; }
note()  { echo "vercel-ignore: $*"; }

has_commit() {
  [ -n "$1" ] && git cat-file -e "$1^{commit}" 2>/dev/null
}

# 0 only when HEAD differs from $1 in docs/** or brain/** alone.
# git diff --quiet returns 0 (no diff), 1 (diff) or 128 (error): only 0 skips.
only_docs_changed() {
  git diff --quiet "$1" HEAD -- . ':(exclude)docs/**' ':(exclude)brain/**' 2>/dev/null
}

repo_url() {
  [ "${VERCEL_GIT_PROVIDER:-}" = "github" ] || return 1
  [ -n "${VERCEL_GIT_REPO_OWNER:-}" ] && [ -n "${VERCEL_GIT_REPO_SLUG:-}" ] || return 1
  echo "https://github.com/${VERCEL_GIT_REPO_OWNER}/${VERCEL_GIT_REPO_SLUG}.git"
}

# fetch_branch <url> <branch> <local ref>: bounded, never prompts.
fetch_branch() {
  if command -v timeout >/dev/null 2>&1; then
    timeout 60 git fetch --quiet --no-tags --depth="$DEPTH" "$1" "+refs/heads/$2:$3" 2>/dev/null
  else
    git fetch --quiet --no-tags --depth="$DEPTH" "$1" "+refs/heads/$2:$3" 2>/dev/null
  fi
}

check_previous_sha() {
  prev="${VERCEL_GIT_PREVIOUS_SHA:-}"
  [ -n "$prev" ] || build "no VERCEL_GIT_PREVIOUS_SHA (first deployment of this branch)"
  if ! has_commit "$prev"; then
    # Older than the depth-10 clone: try to deepen this branch's history once.
    url="$(repo_url)" && [ -n "$REF" ] && fetch_branch "$url" "$REF" "$NS/head"
    has_commit "$prev" || build "previous deployment $prev not in the clone"
  fi
  only_docs_changed "$prev" && skip "only docs/ or brain/ changed since $prev"
  build "files outside docs/ and brain/ changed since $prev"
}

if [ "$ENV_NAME" != "preview" ] || [ -z "$REF" ] || [ "$REF" = "main" ]; then
  check_previous_sha
fi

url="$(repo_url)" || { note "no GitHub repo variables, falling back to previous SHA"; check_previous_sha; }
if fetch_branch "$url" main "$NS/main"; then
  # Deepen HEAD's own history too, so branches with more than ~9 commits
  # (the bundled night docs branch) still reach their fork point.
  fetch_branch "$url" "$REF" "$NS/head" || note "could not deepen $REF, continuing"
  base="$(git merge-base "$NS/main" HEAD 2>/dev/null)"
  if [ -n "$base" ]; then
    only_docs_changed "$base" && skip "preview: only docs/ or brain/ differ from main (merge base $base)"
    build "preview: files outside docs/ and brain/ differ from main (merge base $base)"
  fi
  note "no merge base with main in the fetched history, falling back to previous SHA"
else
  note "fetch of main from $url failed, falling back to previous SHA"
fi
check_previous_sha
