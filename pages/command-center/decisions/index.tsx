import type { NextPage } from "next";
import type { ReactElement, ReactNode } from "react";
import { useEffect, useState } from "react";
import { CommandCenterLayout } from "@/components/CommandCenterLayout";
import {
  getDecisions,
  createDecision,
  updateDecision,
  deleteDecision,
} from "@/lib/commandCenter";
import type { Decision } from "@/lib/commandCenter";

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

const emptyForm = {
  title: "",
  context: "",
  decision: "",
  reasoning: "",
};

const DecisionsPage: NextPageWithLayout = () => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      setDecisions(await getDecisions());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load decisions");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.decision.trim()) return;
    setSaving(true);
    setFormError(null);
    try {
      await createDecision({
        title: form.title.trim(),
        context: form.context.trim() || null,
        decision: form.decision.trim(),
        reasoning: form.reasoning.trim() || null,
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
      await updateDecision(id, {
        title: editForm.title.trim(),
        context: editForm.context.trim() || null,
        decision: editForm.decision.trim(),
        reasoning: editForm.reasoning.trim() || null,
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
    if (!confirm("Delete this decision?")) return;
    try {
      await deleteDecision(id);
      setDecisions((prev) => prev.filter((d) => d.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  function startEdit(d: Decision) {
    setEditingId(d.id);
    setEditForm({
      title: d.title,
      context: d.context ?? "",
      decision: d.decision,
      reasoning: d.reasoning ?? "",
    });
    setExpandedId(d.id);
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="eyebrow mb-1">Command Center</p>
          <h1 className="font-serif text-2xl tracking-tight">Decisions</h1>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="btn btn-primary text-[11px] py-2.5 px-5"
        >
          {showForm ? "Cancel" : "+ New Decision"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 p-5 border border-ink/15 rounded-xl bg-white/60 space-y-3"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-ink/40 mb-1">New Decision</p>
          {formError && <p className="text-xs text-red-600">{formError}</p>}
          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder-ink/30 focus:outline-none focus:border-ink/50"
          />
          <textarea
            placeholder="Context — what prompted this decision?"
            value={form.context}
            onChange={(e) => setForm({ ...form, context: e.target.value })}
            rows={2}
            className="w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder-ink/30 focus:outline-none resize-none"
          />
          <textarea
            required
            placeholder="Decision — what was decided?"
            value={form.decision}
            onChange={(e) => setForm({ ...form, decision: e.target.value })}
            rows={3}
            className="w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder-ink/30 focus:outline-none resize-none"
          />
          <textarea
            placeholder="Reasoning (optional)"
            value={form.reasoning}
            onChange={(e) => setForm({ ...form, reasoning: e.target.value })}
            rows={2}
            className="w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder-ink/30 focus:outline-none resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary text-[11px] py-2 px-5 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Decision"}
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

      {!loading && decisions.length === 0 && (
        <p className="text-sm text-ink/35 py-10 text-center border border-ink/8 rounded-xl">
          No decisions recorded yet.
        </p>
      )}

      <div className="space-y-3">
        {decisions.map((d) => {
          const expanded = expandedId === d.id;
          const isEditing = editingId === d.id;
          return (
            <div
              key={d.id}
              className="border border-ink/10 rounded-xl overflow-hidden group"
            >
              {/* Header row */}
              <div
                className="flex items-start justify-between px-5 py-4 cursor-pointer hover:bg-ink/2 transition-colors"
                onClick={() =>
                  setExpandedId(expanded && !isEditing ? null : d.id)
                }
              >
                <div className="flex-1 pr-4">
                  {isEditing ? (
                    <input
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="w-full font-serif text-base tracking-tight bg-transparent border-b border-ink/30 focus:outline-none focus:border-ink"
                    />
                  ) : (
                    <p className="font-serif text-base tracking-tight leading-snug">
                      {d.title}
                    </p>
                  )}
                  <p className="text-[10px] text-ink/30 mt-1">
                    {new Date(d.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!isEditing && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(d);
                      }}
                      className="text-[10px] uppercase tracking-[0.15em] text-ink/30 hover:text-ink transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(d.id);
                    }}
                    className="text-[10px] uppercase tracking-[0.15em] text-ink/30 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Del
                  </button>
                  <span className="text-ink/25 text-xs">{expanded ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* Expanded body */}
              {expanded && (
                <div className="px-5 pb-5 border-t border-ink/8 pt-4 space-y-3">
                  {isEditing ? (
                    <>
                      <div>
                        <label className="text-[9px] uppercase tracking-[0.2em] text-ink/35 block mb-1">Context</label>
                        <textarea
                          value={editForm.context}
                          onChange={(e) => setEditForm({ ...editForm, context: e.target.value })}
                          rows={2}
                          className="w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm text-ink focus:outline-none resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase tracking-[0.2em] text-ink/35 block mb-1">Decision</label>
                        <textarea
                          value={editForm.decision}
                          onChange={(e) => setEditForm({ ...editForm, decision: e.target.value })}
                          rows={3}
                          className="w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm text-ink focus:outline-none resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase tracking-[0.2em] text-ink/35 block mb-1">Reasoning</label>
                        <textarea
                          value={editForm.reasoning}
                          onChange={(e) => setEditForm({ ...editForm, reasoning: e.target.value })}
                          rows={2}
                          className="w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm text-ink focus:outline-none resize-none"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-[10px] uppercase tracking-[0.15em] px-3 py-1.5 rounded border border-ink/20 text-ink/50 hover:text-ink transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdate(d.id)}
                          disabled={saving}
                          className="text-[10px] uppercase tracking-[0.15em] px-3 py-1.5 rounded bg-ink text-cream hover:bg-ink/90 transition-colors disabled:opacity-50"
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {d.context && (
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.2em] text-ink/35 mb-1">Context</p>
                          <p className="text-sm text-ink/60 leading-relaxed">{d.context}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-ink/35 mb-1">Decision</p>
                        <p className="text-sm text-ink leading-relaxed">{d.decision}</p>
                      </div>
                      {d.reasoning && (
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.2em] text-ink/35 mb-1">Reasoning</p>
                          <p className="text-sm text-ink/60 leading-relaxed">{d.reasoning}</p>
                        </div>
                      )}
                    </>
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

DecisionsPage.getLayout = (page: ReactElement) => (
  <CommandCenterLayout>{page}</CommandCenterLayout>
);

export default DecisionsPage;
