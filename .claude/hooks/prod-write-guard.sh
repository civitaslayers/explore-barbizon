#!/usr/bin/env bash
# prod-write-guard.sh — PreToolUse guard for the autonomous loop.
#
# Blocks the two gated actions so no agent can cross them autonomously:
#   1. Merging a Supabase dev branch to production (merge_branch)
#   2. Publishing content live (a write that sets is_published = true)
#
# A human runs these manually after review. Exit non-zero blocks the tool call.
#
# NOTE: validate the tool name and input shape against YOUR Claude Code + Supabase
# MCP registration. PreToolUse passes a JSON payload on stdin with tool_name and
# tool_input; field names can vary by version. Adjust the greps if your payload differs.

payload="$(cat)"

# Pull tool name + a flattened blob of the input (jq if present, else raw payload).
if command -v jq >/dev/null 2>&1; then
  tool_name="$(printf '%s' "$payload" | jq -r '.tool_name // .toolName // empty' 2>/dev/null)"
  tool_input="$(printf '%s' "$payload" | jq -r '.tool_input // .toolInput // empty | tostring' 2>/dev/null)"
else
  tool_name="$payload"
  tool_input="$payload"
fi
blob="$(printf '%s\n%s' "$tool_name" "$tool_input")"

# 1. Production merge — human only.
if printf '%s' "$blob" | grep -Eiq 'merge_branch'; then
  echo "BLOCKED: merging a Supabase branch to production is a human action. Review the branch, then merge it yourself." >&2
  exit 2
fi

# 2. Publishing content — human only. Block writes that set is_published true.
if printf '%s' "$blob" | grep -Eiq '(INSERT|UPDATE)' \
   && printf '%s' "$blob" | grep -Eiq 'is_published[^,;]*(=|,)[^,;]*\btrue\b|\btrue\b[^,;]*is_published'; then
  echo "BLOCKED: setting is_published = true publishes content live. Seed as a draft (false); a human flips it live after review." >&2
  exit 2
fi

# 3. Destructive SQL — human only. DROP TABLE, TRUNCATE, or DELETE FROM without a WHERE clause.
if printf '%s' "$blob" | grep -Eiq '\bDROP[[:space:]]+TABLE\b|\bTRUNCATE\b'; then
  echo "BLOCKED: destructive statement on production requires human execution." >&2
  exit 2
fi
if printf '%s' "$blob" | grep -Eiq '\bDELETE[[:space:]]+FROM\b' \
   && ! printf '%s' "$blob" | grep -Eiq '\bDELETE[[:space:]]+FROM\b[^;]*\bWHERE\b'; then
  echo "BLOCKED: destructive statement on production requires human execution." >&2
  exit 2
fi

exit 0
