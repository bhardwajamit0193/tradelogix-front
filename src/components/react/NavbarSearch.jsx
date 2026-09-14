import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Loader2, Package, Tag, ArrowRight } from 'lucide-react';
import Image from './common/Image.jsx';

const API_URL = import.meta.env.PUBLIC_API_URL || (typeof window !== 'undefined' && window.__PUBLIC_API_URL__) || 'http://localhost:6543';

let sharedNavbarCategories = null;

export default function NavbarSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState(() => sharedNavbarCategories || []);
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const searchCacheRef = useRef({});

  const isLoading = isDebouncing || isFetching;

  // 1. Preload categories once across all search instances
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const search = params.get('search');
      if (search) setSearchTerm(search);
    }

    if (sharedNavbarCategories && sharedNavbarCategories.length > 0) {
      setCategories(sharedNavbarCategories);
      return;
    }

    async function loadCategories() {
      try {
        const res = await fetch(`${API_URL}/api/all-categories`);
        if (res.ok) {
          const json = await res.json();
          const items = json?.data || json || [];
          if (Array.isArray(items)) {
            sharedNavbarCategories = items;
            setCategories(items);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch navbar search categories:', err);
      }
    }
    loadCategories();
  }, []);

  // 2. Instant Category Matching (synchronous from preloaded categories, never triggers API or aborts)
  const matchedCategories = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [];
    return categories
      .filter((c) => (c.name || '').toLowerCase().includes(q))
      .slice(0, 3);
  }, [searchTerm, categories]);

  // 3. Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 4. True Debounced Product Search (single timer, only fires when user stops typing)
  useEffect(() => {
    const trimmed = searchTerm.trim();

    if (!trimmed) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
      setProductSuggestions([]);
      setIsDebouncing(false);
      setIsFetching(false);
      setIsOpen(false);
      setSelectedIndex(-1);
      return;
    }

    // If query is already in cache, load immediately without network request
    if (searchCacheRef.current[trimmed]) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      setProductSuggestions(searchCacheRef.current[trimmed]);
      setIsDebouncing(false);
      setIsFetching(false);
      setIsOpen(true);
      setSelectedIndex(-1);
      return;
    }

    setIsDebouncing(true);
    setIsOpen(true);
    setSelectedIndex(-1);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsDebouncing(false);
      setIsFetching(true);

      // Only abort previous fetch when this new search is actually executed
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await fetch(
          `${API_URL}/api/shop/products?search=${encodeURIComponent(trimmed)}&limit=6`,
          {
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (res.ok) {
          const json = await res.json();
          const items = json.data || json.items || [];
          if (Array.isArray(items)) {
            const mapped = items.map((p) => ({
              id: p.id,
              name: p.name,
              slug: p.slug || p.id,
              sku: p.sku || '',
              category: p.category || (p.categories && p.categories[0]?.name) || '',
              price: parseFloat(p.price) || 0,
              inStock: p.inStock !== false && (p.stockCount === undefined || p.stockCount > 0),
              image: p.image || p.featuredImage || (p.images && p.images[0]) || '/placeholder-product.svg',
            }));
            searchCacheRef.current[trimmed] = mapped;
            setProductSuggestions(mapped);
          } else {
            setProductSuggestions([]);
          }
        } else {
          setProductSuggestions([]);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('[NavbarSearch] Search request error:', err);
          setProductSuggestions([]);
        }
      } finally {
        setIsFetching(false);
      }
    }, 350); // 350ms debounce delay

    return () => {
      // Clear pending timer when user types next character
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    const trimmed = searchTerm.trim();
    setIsOpen(false);
    if (trimmed) {
      window.location.href = `/shop?search=${encodeURIComponent(trimmed)}`;
    } else {
      window.location.href = '/shop';
    }
  };

  const handleClear = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setSearchTerm('');
    setProductSuggestions([]);
    setIsDebouncing(false);
    setIsFetching(false);
    setIsOpen(false);
    if (inputRef.current) inputRef.current.focus();
  };

  // Build a flat list of items for keyboard navigation
  const flatItems = [
    ...matchedCategories.map((cat) => ({ type: 'category', data: cat })),
    ...productSuggestions.map((prod) => ({ type: 'product', data: prod })),
    ...(searchTerm.trim() ? [{ type: 'view_all', query: searchTerm.trim() }] : []),
  ];

  const handleKeyDown = (e) => {
    if (!isOpen || flatItems.length === 0) {
      if (e.key === 'Enter') {
        handleSubmit(e);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < flatItems.length) {
        const item = flatItems[selectedIndex];
        if (item.type === 'category') {
          window.location.href = `/shop?category=${encodeURIComponent(item.data.name)}`;
        } else if (item.type === 'product') {
          window.location.href = `/shop/${item.data.slug || item.data.id}`;
        } else if (item.type === 'view_all') {
          handleSubmit();
        }
      } else {
        handleSubmit();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const resolveImageUrl = (img) => {
    if (!img) return '/placeholder-product.svg';
    if (img.startsWith('/uploads/')) return `${API_URL}${img}`;
    return img;
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <Search className="absolute left-3.5 text-slate-400 w-4 h-4 pointer-events-none" />

        <input
          ref={inputRef}
          type="text"
          name="search"
          value={searchTerm}
          autoComplete="off"
          onFocus={() => {
            if (searchTerm.trim().length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (e.target.value.trim().length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder="Search bulk hardware, brands, specs..."
          className="w-full h-10 sm:h-11 pl-10 pr-10 rounded-xl border border-slate-200 bg-white/90 focus:bg-white text-slate-900 text-xs font-medium focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 outline-none transition-all shadow-xs placeholder:text-slate-400"
        />

        {/* Debounce / Loading & Clear Action */}
        <div className="absolute right-2.5 flex items-center gap-1">
          {isLoading ? (
            <span className="flex h-2.5 w-2.5 relative items-center justify-center mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-600"></span>
            </span>
          ) : searchTerm ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </form>

      {/* Auto-suggestions Dropdown Panel */}
      {isOpen && searchTerm.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-fadeIn text-left backdrop-blur-md">
          <div className="max-h-[440px] overflow-y-auto divide-y divide-slate-100">
            {/* Active Searching Shimmer Skeletons when loading */}
            {isLoading && productSuggestions.length === 0 && (
              <div className="p-3 space-y-2 animate-pulse">
                <div className="flex items-center justify-between pb-1">
                  <div className="h-3 w-28 bg-slate-200 rounded" />
                  <div className="h-2.5 w-14 bg-slate-100 rounded" />
                </div>
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={`search-skel-${idx}`} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50/60">
                    <div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                      <div className="h-2.5 bg-slate-200/70 rounded w-1/3" />
                    </div>
                    <div className="w-14 h-4 bg-slate-200 rounded shrink-0" />
                  </div>
                ))}
              </div>
            )}

            {/* Matching Categories Pill Row */}
            {matchedCategories.length > 0 && (
              <div className="p-3 bg-slate-50/60">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  <Tag className="w-3 h-3 text-brand-600" />
                  <span>Matching Categories</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {matchedCategories.map((cat, idx) => {
                    const isSelected = selectedIndex === idx;
                    return (
                      <a
                        key={cat.id || cat.name}
                        href={`/shop?category=${encodeURIComponent(cat.name)}`}
                        onClick={() => setIsOpen(false)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-700 hover:border-brand-400 hover:text-brand-600'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <ArrowRight className="w-3 h-3 opacity-60" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Product Suggestions List */}
            {productSuggestions.length > 0 && (
              <div className="p-2">
                <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <Package className="w-3 h-3 text-slate-400" />
                  <span>Products</span>
                </div>
                <div className="space-y-1 mt-1">
                  {productSuggestions.map((prod, idx) => {
                    const flatIdx = matchedCategories.length + idx;
                    const isSelected = selectedIndex === flatIdx;

                    return (
                      <a
                        key={prod.id || prod.slug}
                        href={`/shop/${prod.slug || prod.id}`}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
                          isSelected
                            ? 'bg-brand-50 border border-brand-200/80 shadow-xs'
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <Image
                          src={prod.image}
                          alt={prod.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-100 shrink-0 bg-slate-50"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {prod.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {prod.category && (
                              <span className="text-[10px] text-slate-400 font-medium truncate">
                                {prod.category}
                              </span>
                            )}
                            {prod.sku && (
                              <span className="text-[10px] text-slate-300">
                                • {prod.sku}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-slate-900">
                            ₹{prod.price.toLocaleString('en-IN')}
                          </p>
                          <span
                            className={`inline-block text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                              prod.inStock
                                ? 'text-emerald-700 bg-emerald-50'
                                : 'text-slate-400 bg-slate-100'
                            }`}
                          >
                            {prod.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No Results Found State */}
            {!isLoading && productSuggestions.length === 0 && matchedCategories.length === 0 && (
              <div className="p-6 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
                  <Search className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-800">
                  No matches found for &ldquo;{searchTerm}&rdquo;
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Try checking for spelling errors or searching with different keywords.
                </p>
                <a
                  href={`/shop?search=${encodeURIComponent(searchTerm.trim())}`}
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-brand-600 hover:text-brand-700 underline underline-offset-4"
                >
                  Search all catalog items anyway
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* View All Search Results Action Row */}
            <div className="p-2.5 bg-slate-50/80 flex items-center justify-between text-xs border-t border-slate-100">
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center gap-1.5 font-bold text-brand-600 hover:text-brand-700 group transition-colors"
              >
                <span>View all results for &ldquo;{searchTerm}&rdquo;</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <div className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400">
                <span>Press</span>
                <kbd className="px-1 py-0.5 bg-white rounded border border-slate-200 text-slate-600 font-mono text-[9px] shadow-2xs">
                  Enter ↵
                </kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
