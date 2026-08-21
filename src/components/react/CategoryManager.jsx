import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Search, RefreshCw, FolderTree, ChevronRight, X, Pencil } from 'lucide-react';
import { getCategories, saveCategory, deleteCategory, getMockProducts } from '../../utils/mockDb.js';

const slugify = (text) =>
  text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '').replace(/-+$/, '');

const EMPTY_FORM = { id: null, name: '', slug: '', parentId: '', description: '' };

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts]     = useState([]);
  // Add-new form
  const [form, setForm]             = useState(EMPTY_FORM);
  const [isSlugManual, setIsSlugManual] = useState(false);
  // Edit modal
  const [editModal, setEditModal]   = useState(null);   // null | { id, name, slug, parentId, description }
  const [editSlugManual, setEditSlugManual] = useState(false);
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState([]);
  const [saveMsg, setSaveMsg]       = useState(null);

  const load = useCallback(() => {
    setCategories(getCategories());
    setProducts(getMockProducts());
  }, []);

  useEffect(() => { load(); }, [load]);

  const countForCat = (cat) =>
    products.filter(p => {
      const cats = (p.category || '').split(',').map(c => c.trim().toLowerCase());
      return cats.includes(cat.name.toLowerCase()) || cats.includes(cat.slug.toLowerCase());
    }).length;

  const getParentName = (parentId) => {
    if (!parentId) return null;
    return categories.find(c => c.id === parentId)?.name || null;
  };

  // ── Form handlers ──────────────────────────────────────────────────────────
  const handleNameChange = (val) => {
    setForm(f => ({ ...f, name: val, slug: isSlugManual ? f.slug : slugify(val) }));
  };

  const handleSlugChange = (val) => {
    setIsSlugManual(true);
    setForm(f => ({ ...f, slug: val }));
  };

  // Add-new submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    saveCategory({
      name: form.name.trim(),
      slug: form.slug || slugify(form.name),
      parentId: form.parentId || null,
      description: form.description.trim(),
    });
    load();
    setForm(EMPTY_FORM);
    setIsSlugManual(false);
    setSaveMsg('Category added.');
    setTimeout(() => setSaveMsg(null), 3000);
  };

  // Edit modal open
  const handleEdit = (cat) => {
    setEditModal({ id: cat.id, name: cat.name, slug: cat.slug, parentId: cat.parentId || '', description: cat.description || '' });
    setEditSlugManual(true);
  };

  // Edit modal field handlers
  const handleEditNameChange = (val) => {
    setEditModal(m => ({ ...m, name: val, slug: editSlugManual ? m.slug : slugify(val) }));
  };
  const handleEditSlugChange = (val) => {
    setEditSlugManual(true);
    setEditModal(m => ({ ...m, slug: val }));
  };
  const closeEditModal = () => { setEditModal(null); setEditSlugManual(false); };

  // Edit modal submit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editModal.name.trim()) return;
    saveCategory({
      id: editModal.id,
      name: editModal.name.trim(),
      slug: editModal.slug || slugify(editModal.name),
      parentId: editModal.parentId || null,
      description: editModal.description.trim(),
    });
    load();
    closeEditModal();
    setSaveMsg('Category updated.');
    setTimeout(() => setSaveMsg(null), 3000);
  };

  const handleDelete = (catId, catName) => {
    if (!window.confirm(`Delete category "${catName}"? This cannot be undone.`)) return;
    deleteCategory(catId);
    setSelected(prev => prev.filter(id => id !== catId));
    load();
  };

  const handleBulkDelete = () => {
    if (!selected.length) return;
    if (!window.confirm(`Delete ${selected.length} selected categories?`)) return;
    selected.forEach(id => deleteCategory(id));
    setSelected([]);
    load();
  };

  // ── Table helpers ──────────────────────────────────────────────────────────
  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.slug || '').toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map(c => c.id));

  return (
    <div className="space-y-6 pb-12">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-brand-600" /> Product Categories
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Manage categories for your product catalog. Drag-and-drop ordering coming soon.
          </p>
        </div>
        <button onClick={load} className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {saveMsg && (
        <div className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl">
          ✓ {saveMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* ── LEFT: Add / Edit Form ─────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
            Add New Category
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Name <span className="text-rose-500">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Electronics"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-200 transition-all"
              />
              <p className="text-[10px] text-slate-400">The name is how it appears on your site.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="auto-generated"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-200 transition-all"
              />
              <p className="text-[10px] text-slate-400">URL-friendly name — lowercase, numbers, hyphens only.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Parent Category</label>
              <select
                value={form.parentId}
                onChange={(e) => setForm(f => ({ ...f, parentId: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-200 transition-all"
              >
                <option value="">None</option>
                {categories.filter(c => c.id !== form.id).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400">Assign a parent to create a hierarchy (e.g. Electronics › Audio).</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of this category…"
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs resize-none focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-200 transition-all"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-sm">
                Add Category
              </button>
            </div>
          </form>
        </div>

        {/* ── RIGHT: Category Table ─────────────────────────────────────── */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories…"
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-brand-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">{filtered.length}</span> items
              {selected.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="ml-2 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 font-bold hover:bg-rose-100 transition-all flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Delete ({selected.length})
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-4 py-3 w-8">
                    <input type="checkbox"
                      checked={filtered.length > 0 && selected.length === filtered.length}
                      onChange={toggleAll}
                      className="rounded border-slate-300 accent-brand-600"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase tracking-wider text-[10px]">Name</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase tracking-wider text-[10px]">Description</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase tracking-wider text-[10px]">Slug</th>
                  <th className="px-4 py-3 text-center font-bold text-slate-600 uppercase tracking-wider text-[10px]">Count</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-600 uppercase tracking-wider text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400 text-xs">No categories found.</td>
                  </tr>
                ) : (
                  filtered.map((cat) => {
                    const parentName = getParentName(cat.parentId);
                    const count = countForCat(cat);
                    const isChecked = selected.includes(cat.id);
                    return (
                      <tr key={cat.id} className={`group transition-colors ${isChecked ? 'bg-brand-50/40' : 'hover:bg-slate-50/60'}`}>
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={isChecked} onChange={() => toggleSelect(cat.id)}
                            className="rounded border-slate-300 accent-brand-600" />
                        </td>

                        <td className="px-4 py-3 min-w-[140px]">
                          <button onClick={() => handleEdit(cat)}
                            className="font-semibold text-brand-600 hover:text-brand-800 hover:underline text-left transition-colors">
                            {cat.name}
                          </button>
                          {parentName && (
                            <div className="flex items-center gap-0.5 text-[10px] text-slate-400 mt-0.5">
                              <ChevronRight className="w-3 h-3" />{parentName}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(cat)} className="text-[10px] text-brand-600 font-semibold hover:underline">Edit</button>
                            <span className="text-slate-300">|</span>
                            <button onClick={() => handleDelete(cat.id, cat.name)} className="text-[10px] text-rose-500 font-semibold hover:underline">Delete</button>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-slate-500 max-w-[180px] truncate" title={cat.description}>
                          {cat.description || <span className="text-slate-300">—</span>}
                        </td>

                        <td className="px-4 py-3 font-mono text-slate-500 text-[10px]">{cat.slug}</td>

                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${count > 0 ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-400'}`}>
                            {count}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(cat)}
                              className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 border border-transparent hover:border-brand-200 transition-all"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id, cat.name)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Edit Modal ──────────────────────────────────────────────────── */}
      {editModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeEditModal(); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden"
            style={{ animation: 'modalIn 0.18s ease' }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Pencil className="w-4 h-4 text-brand-600" /> Edit Category
              </h3>
              <button onClick={closeEditModal} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleEditSubmit} className="px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={editModal.name}
                  onChange={(e) => handleEditNameChange(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-200 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Slug</label>
                <input
                  type="text"
                  value={editModal.slug}
                  onChange={(e) => handleEditSlugChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-200 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Parent Category</label>
                <select
                  value={editModal.parentId}
                  onChange={(e) => setEditModal(m => ({ ...m, parentId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-200 transition-all"
                >
                  <option value="">None</option>
                  {categories.filter(c => c.id !== editModal.id).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  value={editModal.description}
                  onChange={(e) => setEditModal(m => ({ ...m, description: e.target.value }))}
                  rows={3}
                  placeholder="Brief description…"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs resize-none focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-200 transition-all"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-sm">
                  Save Changes
                </button>
                <button type="button" onClick={closeEditModal}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <style>{`
            @keyframes modalIn {
              from { opacity: 0; transform: scale(0.96) translateY(8px); }
              to   { opacity: 1; transform: scale(1)   translateY(0);    }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
