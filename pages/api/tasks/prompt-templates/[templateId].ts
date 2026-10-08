import type { NextApiRequest, NextApiResponse } from "next";
import {
  updatePromptTemplateAdmin,
  deletePromptTemplateAdmin,
} from "@/lib/commandCenter.server";
import { isUuid, parsePromptTemplatePatch } from "@/lib/commandCenterValidation";

/**
 * /api/tasks/prompt-templates/[templateId] (task b696ede8)
 *
 * PATCH  → body PromptTemplatePatch → 200 { template } | 400 | 404
 * DELETE → 204 | 404
 *
 * See ./index.ts for why this lives under /api/tasks/….
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { templateId } = req.query;
  if (!isUuid(templateId)) {
    return res.status(400).json({ error: "Invalid template id" });
  }

  try {
    switch (req.method) {
      case "PATCH": {
        const parsed = parsePromptTemplatePatch(req.body);
        if (!parsed.ok) return res.status(400).json({ error: parsed.error });
        const template = await updatePromptTemplateAdmin(templateId, parsed.value);
        if (!template) return res.status(404).json({ error: "Template not found" });
        return res.status(200).json({ template });
      }
      case "DELETE": {
        const deleted = await deletePromptTemplateAdmin(templateId);
        if (!deleted) return res.status(404).json({ error: "Template not found" });
        return res.status(204).end();
      }
      default:
        res.setHeader("Allow", "PATCH, DELETE");
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({ error: msg });
  }
}
