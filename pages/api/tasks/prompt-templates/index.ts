import type { NextApiRequest, NextApiResponse } from "next";
import { createPromptTemplateAdmin } from "@/lib/commandCenter.server";
import { parsePromptTemplateCreate } from "@/lib/commandCenterValidation";

/**
 * POST /api/tasks/prompt-templates — create a prompt template (task b696ede8).
 *
 * Lives under /api/tasks/… because that is the only Basic-Auth-protected API
 * prefix in proxy.ts that fits, and proxy.ts could not be edited
 * in this change; a follow-up moves it to /api/prompt-templates with a
 * matcher entry. The static `prompt-templates` segment takes precedence
 * over the dynamic `[id]` route in Next.js routing.
 *
 * Body: { name, target_agent, template, description? }
 * 201 { template } | 400 | 405 | 500
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const parsed = parsePromptTemplateCreate(req.body);
  if (!parsed.ok) return res.status(400).json({ error: parsed.error });

  try {
    const template = await createPromptTemplateAdmin(parsed.value);
    return res.status(201).json({ template });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({ error: msg });
  }
}
