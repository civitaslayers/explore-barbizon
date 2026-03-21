#!/usr/bin/env node
/**
 * scripts/run-task.js
 *
 * Runs a CCC task through Claude Code CLI and posts the output back.
 *
 * Usage:
 *   node scripts/run-task.js <task-id> [agent] [--base-url=http://localhost:3000]
 *
 * Examples:
 *   node scripts/run-task.js abc-123
 *   node scripts/run-task.js abc-123 claude
 *   node scripts/run-task.js abc-123 claude --base-url=http://localhost:3001
 *
 * Requirements:
 *   - Next.js dev server running (npm run dev)
 *   - claude CLI in PATH (already installed as Claude Code)
 */

const { spawnSync } = require("child_process");

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const taskId = args.find((a) => !a.startsWith("--") && !["claude", "cursor", "chatgpt", "human", "codex"].includes(a));
const agentArg = args.find((a) => ["claude", "cursor", "chatgpt", "human", "codex"].includes(a));
const baseUrlArg = args.find((a) => a.startsWith("--base-url="));
const baseUrl = baseUrlArg ? baseUrlArg.split("=")[1] : "http://localhost:3000";

if (!taskId) {
  console.error("Usage: node scripts/run-task.js <task-id> [agent] [--base-url=http://localhost:3000]");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // 1. Dispatch — get brief + callback URL
  console.log(`\n→ Dispatching task ${taskId}…`);
  const dispatchRes = await fetch(`${baseUrl}/api/tasks/${taskId}/dispatch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(agentArg ? { agent: agentArg } : {}),
  });

  if (!dispatchRes.ok) {
    const err = await dispatchRes.json().catch(() => ({}));
    console.error(`✗ Dispatch failed (${dispatchRes.status}):`, err.error ?? dispatchRes.statusText);
    process.exit(1);
  }

  const dispatch = await dispatchRes.json();
  const { agent, brief, callback_url } = dispatch;

  console.log(`  agent:        ${agent}`);
  console.log(`  callback_url: ${callback_url}`);
  console.log(`  brief length: ${brief.length} chars\n`);

  // 2. Run Claude Code CLI with the brief
  console.log("→ Running Claude Code CLI…\n");
  const result = spawnSync("claude", ["--print"], {
    input: brief,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
    stdio: ["pipe", "pipe", "inherit"], // stderr goes to terminal so you see progress
  });

  if (result.error) {
    console.error("✗ Failed to spawn claude CLI:", result.error.message);
    console.error("  Make sure the claude command is in your PATH.");
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`✗ claude exited with status ${result.status}`);
    process.exit(1);
  }

  const response = (result.stdout ?? "").trim();
  if (!response) {
    console.warn("⚠ Claude returned empty output. Output not recorded.");
    process.exit(0);
  }

  console.log("\n→ Output received. Posting to CCC…");

  // 3. POST output back to the CCC
  const outputRes = await fetch(callback_url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agent, response, version: 1 }),
  });

  if (!outputRes.ok) {
    const err = await outputRes.json().catch(() => ({}));
    console.error(`✗ Output POST failed (${outputRes.status}):`, err.error ?? outputRes.statusText);
    process.exit(1);
  }

  const saved = await outputRes.json();
  console.log(`✓ Output saved (output id: ${saved.output?.id ?? "?"})`);
  console.log(`\n  View in CCC: ${baseUrl}/command-center/tasks/${taskId}\n`);
}

main().catch((e) => {
  console.error("✗ Unexpected error:", e.message);
  process.exit(1);
});
