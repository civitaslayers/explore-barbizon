#!/usr/bin/env bash
# Civitas Layers / ExploreBarbizon — session orientation hook
# Runs at the start of every Claude Code session.
# Output is injected into Claude's session context.

echo "╔══════════════════════════════════════════════════════════╗"
echo "║         CIVITAS LAYERS — SESSION START                   ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "Read the following files before doing anything:"
echo "  1. MAIN_BRAIN.md          — master project orientation"
echo "  2. brain/current-state.md — operational state + next steps"
echo "  3. brain/decisions.md     — architectural decision log"
echo "  4. docs/schema-reference.md — live schema + proposed model"
echo ""
echo "After reading, output:"
echo "  - One-line project status"
echo "  - The single most important next action"
echo "  - Any blockers"
echo ""
echo "══════════════════════════════════════════════════════════"
echo "CURRENT STATE SNAPSHOT:"
echo "══════════════════════════════════════════════════════════"
echo ""

# Print the operational state file so Claude sees it immediately
if [ -f "brain/current-state.md" ]; then
  cat brain/current-state.md
else
  echo "[WARNING] brain/current-state.md not found"
fi

echo ""
echo "══════════════════════════════════════════════════════════"
echo "Stack: Next.js (Pages Router) · Supabase · Mapbox · Tailwind"
echo "Do not change the stack. Prefer refinement over rewrites."
echo "Update brain/current-state.md after completing significant work."
echo "══════════════════════════════════════════════════════════"
