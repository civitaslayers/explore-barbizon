import type { NextPage } from "next";
import type { ReactElement, ReactNode } from "react";
import { useEffect, useState } from "react";
import { CommandCenterLayout } from "@/components/CommandCenterLayout";
import { getMemory, upsertMemory, deleteMemory } from "@/lib/commandCenter";
import type { Memory } from "@/lib/commandCenter";

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

const CATEGORIES = ["stack", "product", "design", "context", "schema", "ops", "other"];

const emptyForm = {
  key: "",
  content: "",
  category: "",
};

const MemoryPage: NextPageWithLayout = () => {
  const [entries, setEntries] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      setEntries(await getMemory());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load memory");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.key.trim() || !form.content.trim()) return;
    setSaving(true);
    setFormError(null);
    try {
      await upsertMemory({
        key: form.key.trim().toLowerCase().replace(/\s+/g, "_"),
        content: form.content.trim(),
        category: form.category || null,
      });
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(_entry: Memory) {
    setSaving(true);
    try {
      await upsertMemory({
        key: editForm.key.trim(),
        content: editForm.content.trim(),
        category: editForm.category || null,
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
    if (!confirm("Delete this memory entry?")) return;
    try {
      await deleteMemory(id);
      setEntries((prev) => prev.filter((m) => m.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  function startEdit(m: Memory) {
    setEditingId(m.id);
    setEditForm({
      key: m.key,
      content: m.content,
      category: m.category ?? "",
    });
  }

  const filtered = entries.filter((m) => {
    if (filterCategory && m.category !== filterCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        m.key.toLowerCase().includes(q) ||
        m.content.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const categories = Array.from(
    new Set(entries.map((m) => m.category).filter(Boolean))
  ) as string[];

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="eyebrow mb-1">Command Center</p>
          <h1 className="font-serif text-2xl tracking-tight">Memory</h1>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="btn btn-primary text-[11px] py-2.5 px-5"
        >
          {showForm ? "Cancel" : "+ New Entry"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 p-5 border border-ink/15 rounded-xl bg-white/60 space-y-3"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-ink/40 mb-1">New Memory Entry</p>
          {formError && <p className="text-xs text-red-600">{formError}</p>}
          <div className="flex gap-3">
            <input
              required
              placeholder="key (e.g. supabase_project_id)"
              value={form.key}
              onChange={(e) => setForm({ ...form, key: e.target.value })}
              className="flex-1 rounded border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder-ink/30 focus:outline-none focus:border-ink/50 font-mono"
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="rounded border border-ink/20 bg-white px-2 py-2 text-sm text-ink focus:outline-none"
            >
              <option value="">Category —</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <textarea
            required
            placeholder="Content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={4}
            className="w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder-ink/30 focus:outline-none resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary text-[11px] py-2 px-5 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Entry"}
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded border border-ink/20 bg-white px-3 py-1.5 text-sm text-ink placeholder-ink/30 focus:outline-none"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded border border-ink/20 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] text-ink focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <span className="text-[11px] text-ink/35 self-center shrink-0">
          {filtered.length} entr{filtered.length !== 1 ? "ies" : "y"}
        </span>
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-4 p-3 bg-red-50 rounded border border-red-200">
          {error}
        </p>
      )}

      {loading && (
        <p className="text-sm text-ink/40 py-8 text-center">Loading...</p>
      )}

      {!loading && filtered.length === 0 && (
        <p className="text-sm text-ink/35 py-10 text-center border border-ink/8 rounded-xl">
          {entries.length === 0 ? "No memory entries yet." : "No entries match your search."}
        </p>
      )}

      <div className="space-y-2">
        {filtered.map((m) => {
          const isEditing = editingId === m.id;
          return (
            <div
              key={m.id}
              className="border border-ink/10 rounded-xl p-4 group"
            >
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex gap-3">
                    <input
                      value={editForm.key}
                      onChange={(e) => setEditForm({ ...editForm, key: e.target.value })}
                      className="flex-1 rounded border border-ink/20 bg-white px-3 py-1.5 text-sm font-mono text-ink focus:outline-none"
                    />
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="rounded border border-ink/20 bg-white px-2 py-1.5 text-sm text-ink focus:outline-none"
                    >
                      <option value="">—</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    value={editForm.content}
                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                    rows={4}
                    className="w-full rounded border border-ink/20 bg-white px-3 py-2 text-sm text-ink focus:outline-none resize-none"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-[10px] uppercase tracking-[0.15em] px-3 py-1.5 rounded border border-ink/20 text-ink/50 hover:text-ink transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdate(m)}
                      disabled={saving}
                      className="text-[10px] uppercase tracking-[0.15em] px-3 py-1.5 rounded bg-ink text-cream hover:bg-ink/90 transition-colors disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono text-umber">{m.key}</span>
                      {m.category && (
                        <span className="text-[9px] uppercase tracking-[0.2em] px-1.5 py-0.5 rounded bg-ink/6 text-ink/40">
                          {m.category}
                        </span>
                      )}
                      <span className="text-[9px] text-ink/25 ml-auto">
                        {new Date(m.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-ink/75 leading-relaxed">{m.content}</p>
                  </div>
                  <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(m)}
                      className="text-[10px] uppercase tracking-[0.15em] text-ink/30 hover:text-ink transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="text-[10px] uppercase tracking-[0.15em] text-ink/30 hover:text-red-500 transition-colors"
                    >
                      Del
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

MemoryPage.getLayout = (page: ReactElement) => (
  <CommandCenterLayout>{page}</CommandCenterLayout>
);

export default MemoryPage;
