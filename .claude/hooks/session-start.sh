#!/usr/bin/env bash
# Civitas Layers / ExploreBarbizon — session orientation hook
# Runs at the start of every Claude Code session.
# Output is injected into Claude's session context.

echo "╔══════════════════════════════════════════════════════════╗"
echo "║         CIVITAS LAYERS — SESSION START                   ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "Read these files in order before doing anything:"
echo "  1. MAIN_BRAIN.md              — master project orientation"
echo "  2. brain/current-state.md     — operational state"
echo "  3. brain/decisions.md         — architectural decision log"
echo "  4. brain/task-queue.md        — Now / Next / Later / Blocked"
echo "  5. docs/schema-reference.md   — live schema + proposed model"
echo ""
echo "After reading, output:"
echo "  - Current state summary (2-3 sentences)"
echo "  - Top 3 next unblocked tasks"
echo "  - Active blockers"
echo "  - Recommended next implementation step"
echo ""
echo "══════════════════════════════════════════════════════════"
echo "CURRENT STATE:"
echo "══════════════════════════════════════════════════════════"
if [ -f "brain/current-state.md" ]; then
  cat brain/current-state.md
else
  echo "[WARNING] brain/current-state.md not found"
fi

echo ""
echo "══════════════════════════════════════════════════════════"
echo "TASK QUEUE:"
echo "══════════════════════════════════════════════════════════"
if [ -f "brain/task-queue.md" ]; then
  cat brain/task-queue.md
else
  echo "[WARNING] brain/task-queue.md not found"
fi

echo ""
echo "══════════════════════════════════════════════════════════"
echo "Stack: Next.js Pages Router · Supabase · Mapbox · Tailwind"
echo "Do not change the stack. Prefer refinement over rewrites."
echo "Run /next-task to pick work. Run /update-brain after completing work."
echo "══════════════════════════════════════════════════════════"
