import type { NextPage } from "next";
import type { ReactElement, ReactNode } from "react";
import { useEffect, useState } from "react";
import { CommandCenterLayout } from "@/components/CommandCenterLayout";
import {
  getPromptTemplates,
  createPromptTemplate,
  updatePromptTemplate,
  deletePromptTemplate,
} from "@/lib/commandCenter";
import type { PromptTemplate } from "@/lib/commandCenter";

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

const AGENTS = ["chatgpt", "claude", "cursor", "manual"];

const AGENT_STYLE: Record<string, string> = {
  chatgpt: "bg-umber/10 text-umber",
  claude: "bg-moss/15 text-moss",
  cursor: "bg-ink/10 text-ink/60",
  manual: "border border-ink/20 text-ink/50",
};

const emptyForm = {
  name: "",
  target_agent: "claude",
  description: "",
  template: "",
};

const PromptsPage: NextPageWithLayout = () => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      setTemplates(await getPromptTemplates());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load templates");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.template.trim()) return;
    setSaving(true);
    setFormError(null);
    try {
      await createPromptTemplate({
        name: form.name.trim(),
        target_agent: form.target_agent,
        description: form.description.trim() || null,
        template: form.template.trim(),
      });
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id: string) {
    setSaving(true);
    try {
      await updatePromptTemplate(id, {
        name: editForm.name.trim(),
        target_agent: editForm.target_agent,
        description: editForm.description.trim() || null,
        template: editForm.template.trim(),
      });
      setEditingId(null);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this template?")) return;
    try {
      await deletePromptTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  async function handleCopy(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  }

  function startEdit(t: PromptTemplate) {
    setEditingId(t.id);
    setEditForm({
      name: t.name,
      target_agent: t.target_agent,
      description: t.description ?? "",
      template: t.template,
    });
    setExpandedId(t.id);
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="eyebrow mb-1">Command Center</p>
          <h1 className="font-serif text-2xl tracking-tight">Prompt Templates</h1>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="btn btn-primary text-[11px] py-2.5 px-5"
        >
          {showForm ? "Cancel" : "+ New Template"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 p-5 border border-ink/15 rounded-xl bg-white/60 space-y-3"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-ink/40 mb-1">New Template</p>
          {formError && <p className="text-xs text-red-600">{formError}</p>}
          <div className="flex gap-3">
            <input
              required
              placeholder="Template name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="flex-1 rounded border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder-ink/30 focus:outline-none focus:border-ink/50"
            />
            <select
              value={form.target_agent}
              onChange={(e) => setForm({ ...form, target_agent: e.target.value })}
              className="rounded border border-ink/20 bg-white px-2 py-2 text-sm text-ink focus:outline-none"
            >
              {AGENTS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <input
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder-ink/30 focus:outline-none focus:border-ink/50"
          />
          <textarea
            required
            placeholder="Prompt template..."
            value={form.template}
            onChange={(e) => setForm({ ...form, template: e.target.value })}
            rows={6}
            className="w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder-ink/30 focus:outline-none resize-y font-mono leading-relaxed"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary text-[11px] py-2 px-5 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Template"}
            </button>
          </div>
        </form>
      )}

      {error && (
        <p className="text-sm text-red-600 mb-4 p-3 bg-red-50 rounded border border-red-200">
          {error}
        </p>
      )}

      {loading && (
        <p className="text-sm text-ink/40 py-8 text-center">Loading...</p>
      )}

      {!loading && templates.length === 0 && (
        <p className="text-sm text-ink/35 py-10 text-center border border-ink/8 rounded-xl">
          No prompt templates yet.
        </p>
      )}

      <div className="space-y-3">
        {templates.map((t) => {
          const expanded = expandedId === t.id;
          const isEditing = editingId === t.id;
          return (
            <div
              key={t.id}
              className="border border-ink/10 rounded-xl overflow-hidden group"
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-ink/2 transition-colors"
                onClick={() =>
                  setExpandedId(expanded && !isEditing ? null : t.id)
                }
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {isEditing ? (
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      className="font-medium text-sm bg-transparent border-b border-ink/30 focus:outline-none focus:border-ink flex-1"
                    />
                  ) : (
                    <span className="font-medium text-sm text-ink truncate">{t.name}</span>
                  )}
                  <span className={`text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full shrink-0 ${AGENT_STYLE[t.target_agent] ?? "bg-ink/10 text-ink/60"}`}>
                    {t.target_agent}
                  </span>
                  {t.description && !isEditing && (
                    <span className="text-[11px] text-ink/40 truncate hidden md:block">
                      {t.description}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {!isEditing && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(t.template, t.id);
                        }}
                        className="text-[10px] uppercase tracking-[0.15em] text-ink/30 hover:text-ink transition-colors opacity-0 group-hover:opacity-100"
                      >
                        {copied === t.id ? "Copied!" : "Copy"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(t);
                        }}
                        className="text-[10px] uppercase tracking-[0.15em] text-ink/30 hover:text-ink transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(t.id);
                        }}
                        className="text-[10px] uppercase tracking-[0.15em] text-ink/30 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Del
                      </button>
                    </>
                  )}
                  <span className="text-ink/25 text-xs">{expanded ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* Expanded */}
              {expanded && (
                <div className="px-5 pb-5 border-t border-ink/8 pt-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <select
                          value={editForm.target_agent}
                          onChange={(e) => setEditForm({ ...editForm, target_agent: e.target.value })}
                          className="rounded border border-ink/20 bg-white px-2 py-1.5 text-sm text-ink focus:outline-none"
                        >
                          {AGENTS.map((a) => (
                            <option key={a} value={a}>{a}</option>
                          ))}
                        </select>
                        <input
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          placeholder="Description"
                          className="flex-1 rounded border border-ink/20 bg-white px-3 py-1.5 text-sm text-ink focus:outline-none"
                        />
                      </div>
                      <textarea
                        value={editForm.template}
                        onChange={(e) => setEditForm({ ...editForm, template: e.target.value })}
                        rows={8}
                        className="w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm font-mono text-ink focus:outline-none resize-y leading-relaxed"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-[10px] uppercase tracking-[0.15em] px-3 py-1.5 rounded border border-ink/20 text-ink/50 hover:text-ink transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdate(t.id)}
                          disabled={saving}
                          className="text-[10px] uppercase tracking-[0.15em] px-3 py-1.5 rounded bg-ink text-cream hover:bg-ink/90 transition-colors disabled:opacity-50"
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <pre className="text-sm text-ink/75 leading-relaxed whitespace-pre-wrap font-mono bg-ink/3 rounded-lg px-4 py-3 overflow-auto">
                      {t.template}
                    </pre>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

PromptsPage.getLayout = (page: ReactElement) => (
  <CommandCenterLayout>{page}</CommandCenterLayout>
);

export default PromptsPage;
