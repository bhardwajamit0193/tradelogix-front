import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { resolveCategoryIcon } from '../../utils/categoryIcons.js';

const API_URL = import.meta.env.PUBLIC_API_URL || (typeof window !== 'undefined' && window.__PUBLIC_API_URL__) || 'http://localhost:6543';

export default function CategoriesBar({ mode = 'all', selectedCategoryIds = [], initialCategories = [] } = {}) {
  // Filter initial categories if provided
  const getFilteredCategories = (items) => {
    if (!Array.isArray(items) || items.length === 0) return [];
    if (mode === 'custom' && Array.isArray(selectedCategoryIds) && selectedCategoryIds.length > 0) {
      const filtered = items.filter((cat) => {
        const catId = String(cat.id || '');
        const catName = String(cat.name || '').toLowerCase();
        const catSlug = String(cat.slug || '').toLowerCase();
        return selectedCategoryIds.some((selectedId) => {
          const sel = String(selectedId).toLowerCase();
          return catId === selectedId || catName === sel || catSlug === sel;
        });
      });
      return filtered.length > 0 ? filtered : items;
    }
    return items;
  };

  const [categories, setCategories] = useState(() => getFilteredCategories(initialCategories));
  const [loading, setLoading] = useState(() => !Array.isArray(initialCategories) || initialCategories.length === 0);

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        const res = await fetch(`${API_URL}/api/all-categories`);
        if (res.ok) {
          const json = await res.json();
          const fetched = json?.data || json || [];
          if (Array.isArray(fetched) && fetched.length > 0 && isMounted) {
            setCategories(getFilteredCategories(fetched));
          }
        }
      } catch (err) {
        console.warn('CategoriesBar live fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    // If we didn't have initial categories or mode/selection changed, fetch
    if (!categories.length || mode === 'custom') {
      loadCategories();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [mode, JSON.stringify(selectedCategoryIds)]);

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Browse All Hardware Categories
          </h2>
        </div>
        <a
          href="/shop"
          className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 hover:underline transition-all"
        >
          <span>View All in Catalog</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Categories Bar / Shimmer Loading Placeholder */}
      {loading && categories.length === 0 ? (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          <div className="h-9 w-28 rounded-2xl bg-brand-200/50 animate-pulse shrink-0" />
          <div className="h-9 w-32 rounded-2xl bg-slate-100 border border-slate-200/60 animate-pulse shrink-0" />
          <div className="h-9 w-36 rounded-2xl bg-slate-100 border border-slate-200/60 animate-pulse shrink-0" />
          <div className="h-9 w-28 rounded-2xl bg-slate-100 border border-slate-200/60 animate-pulse shrink-0" />
          <div className="h-9 w-32 rounded-2xl bg-slate-100 border border-slate-200/60 animate-pulse shrink-0" />
          <div className="h-9 w-24 rounded-2xl bg-slate-100 border border-slate-200/60 animate-pulse shrink-0" />
          <div className="h-9 w-30 rounded-2xl bg-slate-100 border border-slate-200/60 animate-pulse shrink-0" />
        </div>
      ) : (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
          <a
            href="/shop"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-600 text-white font-bold text-xs shadow-sm hover:bg-brand-700 hover:scale-105 active:scale-95 transition-all shrink-0 snap-start"
          >
            <Sparkles className="w-4 h-4 text-brand-200" />
            <span>All Hardware</span>
          </a>

          {categories.map((cat) => {
            const IconComp = resolveCategoryIcon(cat.icon, cat.name);
            const href = `/shop?category=${encodeURIComponent(cat.name)}`;
            return (
              <a
                key={cat.id || cat.name}
                href={href}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/90 hover:border-brand-400 text-slate-700 hover:text-brand-600 font-semibold text-xs shadow-2xs hover:shadow-sm hover:scale-105 active:scale-95 transition-all shrink-0 snap-start group"
              >
                <div className="w-6 h-6 rounded-lg bg-slate-100 group-hover:bg-brand-50 flex items-center justify-center text-slate-500 group-hover:text-brand-600 transition-colors">
                  <IconComp className="w-3.5 h-3.5" />
                </div>
                <span className="whitespace-nowrap">{cat.name}</span>
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
}
