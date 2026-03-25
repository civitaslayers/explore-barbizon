# CCC API Contract

Internal API reference for the Command Center (CCC).

All endpoints are Next.js API routes under `pages/api/`. Endpoints marked **dev-only** return `403` in production.

---

## Endpoints

### POST /api/brain/sync-tasks

**Dev-only.** Reads all tasks from Supabase and overwrites `brain/task-queue.md` with the current task state, partitioned by status and priority.

**Request:** No body required.

**Response:**
```json
{ "success": true, "count": 12 }
```
`count` = number of active (non-done) tasks written.

**Side effects:** Writes to `brain/task-queue.md` on disk.

---

### POST /api/tasks/suggest

**Dev-only.** Audits project state and asks Claude to suggest 4–7 new tasks. Reads `brain/current-state.md` and `brain/task-queue.md` alongside live Supabase tasks, then spawns `claude --print` with a structured prompt.

**Request:** No body required.

**Response:**
```json
{
  "suggestions": [
    {
      "title": "string",
      "description": "string",
      "priority": 3,
      "task_type": "string",
      "related_area": "string",
      "assigned_to": "string",
      "rationale": "string",
      "next_step": "string",
      "implementation_notes": "string"
    }
  ]
}
```

---

### POST /api/tasks/[id]/dispatch

Marks a task as dispatched and returns a full agent brief. Sets `execution_status = "in_progress"` on the task.

**Request:** No body required. Optionally pass `{ "agent": "cursor" }` to override `task.assigned_to`.

**Response:**
```json
{
  "success": true,
  "task_id": "uuid",
  "agent": "cursor",
  "dispatched_at": "2026-03-25T10:00:00.000Z",
  "brief": "Human-readable prose brief for the agent...",
  "brief_json": {
    "task_id": "uuid",
    "title": "string",
    "description": "string",
    "agent": "string",
    "priority": 3,
    "task_type": "string",
    "related_area": "string",
    "next_step": "string",
    "implementation_notes": "string",
    "callback_url": "https://…/api/tasks/[id]/outputs"
  },
  "callback_url": "https://…/api/tasks/[id]/outputs"
}
```

`callback_url` is derived from `NEXT_PUBLIC_SITE_URL` env var, falling back to request headers. Agents should POST results to this URL when done.

---

### POST /api/tasks/[id]/run

**Dev-only. Claude-assigned tasks only.** Full automated execution loop: builds task brief → spawns `claude --print` → saves output row → sets `execution_status = "review"`.

**Request:** No body required.

**Response:**
```json
{
  "success": true,
  "output_id": "uuid",
  "execution_status": "review",
  "response_preview": "First 300 characters of Claude output…"
}
```

---

### POST /api/tasks/[id]/review

**Dev-only.** Asks Claude to review the latest task output against requirements. Spawns `claude --print` with a structured review prompt, saves the review as a new output row.

**Request:** No body required.

**Response:**
```json
{
  "success": true,
  "review": "Verdict: PASS\n\nIssues: …\n\nSuggested changes: …\n\nRecommended next step: …",
  "output_id": "uuid"
}
```

`output_id` is the newly created output row containing the review. `null` if saving failed.

---

### POST /api/tasks/[id]/outputs

Generic callback for agents to submit task output. **Not dev-only** — designed for production use. Stores the result as an output row and syncs `latest_output` on the task.

**Request:**
```json
{
  "agent": "cursor",
  "prompt": "optional — the prompt that was sent to the agent",
  "response": "The agent's output…",
  "version": 1
}
```

`agent` is required. All other fields are optional.

**Response:**
```json
{
  "success": true,
  "output": {
    "id": "uuid",
    "task_id": "uuid",
    "agent": "cursor",
    "prompt": "string | null",
    "response": "string | null",
    "version": 1,
    "created_at": "ISO string",
    "updated_at": "ISO string"
  }
}
```

---

## Summary

| Endpoint | Method | Dev-only | Purpose |
|----------|--------|----------|---------|
| `/api/brain/sync-tasks` | POST | Yes | Sync Supabase tasks → brain markdown |
| `/api/tasks/suggest` | POST | Yes | Generate task suggestions via Claude |
| `/api/tasks/[id]/dispatch` | POST | No | Dispatch task to agent, return brief |
| `/api/tasks/[id]/run` | POST | Yes | Auto-run claude task end-to-end |
| `/api/tasks/[id]/review` | POST | Yes | Claude review of latest output |
| `/api/tasks/[id]/outputs` | POST | No | Agent callback to submit output |

---

## Environment Variables

| Variable | Used by |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | All Supabase calls |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All Supabase calls |
| `NEXT_PUBLIC_SITE_URL` | `/dispatch` — builds `callback_url` |

---

## External Dependencies

- **Supabase** — task reads/writes via `lib/commandCenter.ts`
- **Claude CLI** (`claude --print`) — spawned via `child_process` in `suggest`, `run`, `review`
