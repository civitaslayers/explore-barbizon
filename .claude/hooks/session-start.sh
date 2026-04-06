#!/usr/bin/env bash
# Civitas Layers / ExploreBarbizon — session orientation hook
# Low-token startup: show only the minimum needed to begin safely.

echo "╔══════════════════════════════════════════════════════════╗"
echo "║ CIVITAS LAYERS — SESSION START                         ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

echo "Read this first:"
echo " 1. CLAUDE.md (session start protocol)"
echo ""

echo "If the task touches SQL, Supabase, or schema fields, also read:"
echo " - docs/schema-reference.md"
echo ""

echo "If the task touches strategy, major UX direction, roadmap, or multi-town architecture, also read:"
echo " - MAIN_BRAIN.md"
echo ""

echo "Operational preview"
echo "══════════════════════════════════════════════════════════"

echo ""
echo "[current-state.md preview]"
if [ -f "brain/current-state.md" ]; then
  sed -n '1,80p' brain/current-state.md
else
  echo "[WARNING] brain/current-state.md not found"
fi

echo ""
echo "[task-queue.md preview]"
if [ -f "brain/task-queue.md" ]; then
  sed -n '1,120p' brain/task-queue.md
else
  echo "[WARNING] brain/task-queue.md not found"
fi

echo ""
echo "[decisions.md preview]"
if [ -f "brain/decisions.md" ]; then
  sed -n '1,60p' brain/decisions.md
else
  echo "[WARNING] brain/decisions.md not found"
fi

echo ""
echo "After reading, return only:"
echo " - Status"
echo " - Top 3 next unblocked tasks"
echo " - Active blockers"
echo " - Recommended next step"
echo ""

echo "Recommended commands:"
echo " - /next-task"
echo " - /session-summary"
echo " - /update-brain"
echo " - /ship-feature [description]"
echo ""

echo "Rules:"
echo " - Do not scan the entire repo"
echo " - Prefer smallest safe change"
echo " - Preserve Pages Router, Supabase, Mapbox, Tailwind stack"
echo " - Use agents deliberately"
echo ""
