import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { confirmDialog } from '../../utils/dialogs.js';
import {
  fetchAdminPagesApi,
  updateAdminPageApi,
  deleteAdminPageApi,
  DEFAULT_PAGES,
} from '../../services/pagesService.js';

export default function AdminPagesView() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'published' | 'draft'
  const [searchQuery, setSearchQuery] = useState('');

  const showToast = (message, type = 'success') => {
    if (type === 'error') {
      toast.error(message);
    } else {
      toast.success(message);
    }
  };

  const loadPages = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminPagesApi();
      setPages(data);
    } catch (err) {
      console.error('Error loading admin pages:', err);
      showToast('Could not fetch pages from backend. Displaying defaults.', 'error');
      setPages(DEFAULT_PAGES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  // Filtered pages
  const filteredPages = useMemo(() => {
    return pages.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === 'published') return p.isPublished;
      if (activeTab === 'draft') return !p.isPublished;
      return true;
    });
  }, [pages, searchQuery, activeTab]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: pages.length,
      published: pages.filter((p) => p.isPublished).length,
      drafts: pages.filter((p) => !p.isPublished).length,
    };
  }, [pages]);

  // Quick Toggle for isPublished
  const handleToggleStatus = async (page) => {
    const updatedValue = !page.isPublished;
    const updatedList = pages.map((p) => (p.id === page.id ? { ...p, isPublished: updatedValue } : p));
    setPages(updatedList);

    try {
      await updateAdminPageApi(page.id, { isPublished: updatedValue });
      showToast(`Status updated for '${page.title}'.`);
    } catch (err) {
      console.error('Toggle status error:', err);
      showToast(err.message || 'Failed to update status', 'error');
      loadPages();
    }
  };

  // Delete Page with SweetAlert2 confirmation
  const handleDeletePage = async (page) => {
    const ok = await confirmDialog({
      title: `Delete "${page.title}"?`,
      text: `Are you sure you want to permanently delete "${page.title}" (${getStorefrontUrl(page.slug)})? This cannot be undone.`,
      confirmButtonText: 'Yes, Delete Page',
      confirmButtonColor: '#e11d48',
      icon: 'warning',
    });
    if (!ok) return;

    try {
      await deleteAdminPageApi(page.id);
      setPages((prev) => prev.filter((p) => p.id !== page.id));
      toast.success(`Page '${page.title}' deleted.`);
    } catch (err) {
      console.error('Delete page error:', err);
      toast.error(err.message || 'Could not delete page.');
    }
  };

  const getStorefrontUrl = (slug) => {
    if (!slug || slug === 'home') return '/';
    return `/${slug}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[11px] font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            Storefront Page Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white">
            Page Management Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Manage and edit all storefront content pages (Home, About, Contact, Policies, and custom pages). Content and SEO changes are persisted in the database.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-bold transition-all flex items-center gap-2 backdrop-blur-md"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            <span>View Storefront</span>
          </a>

          <a
            href="/admin/pages/new"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Create New Page</span>
          </a>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Storefront Pages</div>
          <div className="text-2xl sm:text-3xl font-black font-display text-slate-900">{stats.total}</div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span>Core and custom editable pages</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Published Pages</div>
          <div className="text-2xl sm:text-3xl font-black font-display text-emerald-600">{stats.published}</div>
          <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Publicly accessible</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Draft Pages</div>
          <div className="text-2xl sm:text-3xl font-black font-display text-amber-600">{stats.drafts}</div>
          <div className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>Hidden from storefront</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {[
            { id: 'all', label: 'All Pages', count: stats.total },
            { id: 'published', label: 'Published', count: stats.published },
            { id: 'draft', label: 'Drafts', count: stats.drafts },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === tab.id ? 'bg-brand-50 text-brand-600 font-bold' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or slug..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
          </div>

          <button
            type="button"
            onClick={loadPages}
            disabled={loading}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-all flex items-center justify-center shrink-0"
            title="Refresh list"
          >
            <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
          </button>
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-semibold text-slate-500">Loading database pages...</p>
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <span className="material-symbols-outlined text-[28px]">description</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800">No pages found</h3>
              <p className="text-xs text-slate-500">
                {searchQuery ? 'Try adjusting your search query.' : 'Create your first page to get started.'}
              </p>
            </div>
            <a
              href="/admin/pages/new"
              className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-500 transition-all inline-flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Create Page</span>
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Page Title & Path</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4">Last Updated</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredPages.map((page) => {
                  const storefrontUrl = getStorefrontUrl(page.slug);
                  const editUrl = `/admin/pages/${page.id || page.slug}`;

                  return (
                    <tr key={page.id || page.slug} className="hover:bg-slate-50/60 transition-colors group">
                      {/* Title & Slug */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shrink-0 font-bold text-xs">
                            {page.slug === 'home' ? (
                              <span className="material-symbols-outlined text-[18px]">home</span>
                            ) : page.isSystemPage ? (
                              <span className="material-symbols-outlined text-[18px]">verified</span>
                            ) : (
                              <span className="material-symbols-outlined text-[18px]">article</span>
                            )}
                          </div>
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              <a href={editUrl} className="hover:text-brand-600 transition-colors">
                                {page.title}
                              </a>
                              {page.isSystemPage && (
                                <span className="px-1.5 py-0.2 rounded-sm bg-slate-100 text-slate-500 text-[10px] font-semibold">
                                  Core
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              <span className="font-mono text-slate-500">{storefrontUrl}</span>
                              <a
                                href={storefrontUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-brand-600 hover:text-brand-800 hover:underline flex items-center gap-0.5"
                                title="Open on storefront"
                              >
                                <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(page)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            page.isPublished
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              page.isPublished ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          ></span>
                          <span>{page.isPublished ? 'Published' : 'Draft'}</span>
                        </button>
                      </td>

                      {/* Last Updated */}
                      <td className="py-4 px-4 text-slate-500 font-medium text-[11px]">
                        {page.updatedAt
                          ? new Date(page.updatedAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Standard default'}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={editUrl}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-slate-700 text-xs font-bold transition-all flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[15px]">edit</span>
                            <span>Edit Page</span>
                          </a>

                          {!page.isSystemPage && (
                            <button
                              type="button"
                              onClick={() => handleDeletePage(page)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Delete Page"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
