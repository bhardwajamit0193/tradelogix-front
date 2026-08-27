import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, SlidersHorizontal, Grid, List, Star, ArrowUpDown, RotateCcw,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, PackageOpen
} from 'lucide-react';
import AddToCartButton from './AddToCartButton.jsx';
import ProductCard, { ProductCardSkeleton, getBadgeStyle } from './ProductCard.jsx';
import { formatPrice } from '../../utils/formatters.js';
import { useStore } from '@nanostores/react';
import { userStore } from '../../store/authStore.js';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:4000';

export default function ProductFilter({ initialCategory = 'All' }) {
  const user = useStore(userStore);
  const isLoggedIn = user?.isLoggedIn;

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState(250000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');

  // Pagination States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Dynamic Data & Loading States
  const [productsList, setProductsList] = useState([]);
  const [categoryList, setCategoryList] = useState([{ id: 'all', name: 'All', slug: 'all' }]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load Categories Dynamically from API
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      setIsCategoriesLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/all-categories`);
        if (res.ok) {
          const json = await res.json();
          const items = json?.data || json || [];
          if (Array.isArray(items) && isMounted) {
            setCategoryList([
              { id: 'all', name: 'All', slug: 'all' },
              ...items.map((c) => ({
                id: c.id,
                name: c.name,
                slug: c.slug || c.name.toLowerCase().replace(/\s+/g, '-'),
              })),
            ]);
          }
        }
      } catch (err) {
        console.warn('Failed to load categories from API:', err);
      } finally {
        if (isMounted) setIsCategoriesLoading(false);
      }
    }
    loadCategories();
    return () => { isMounted = false; };
  }, []);

  // Fetch Products Dynamically with Server-Side Pagination & Filters
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (debouncedSearch.trim()) {
        params.set('search', debouncedSearch.trim());
      }
      if (selectedCategory && selectedCategory !== 'All' && selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      }
      if (sortBy) {
        params.set('sortBy', sortBy);
      }
      if (maxPrice < 250000) {
        params.set('maxPrice', String(maxPrice));
      }
      if (inStockOnly) {
        params.set('inStockOnly', 'true');
      }

      const token = user?.accessToken;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`${API_URL}/api/shop/products?${params.toString()}`, {
        headers,
      });

      if (!res.ok) {
        throw new Error(`Failed to load products (HTTP ${res.status})`);
      }

      const json = await res.json();
      const items = json?.data || json?.items || [];
      const total = json?.pagination?.total ?? json?.total ?? items.length;
      const totalP = json?.pagination?.totalPages ?? json?.totalPages ?? (Math.ceil(total / limit) || 1);

      setProductsList(items);
      setTotalCount(total);
      setTotalPages(totalP);
    } catch (err) {
      console.error('Error fetching shop products:', err);
      setError(err.message);
      setProductsList([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, selectedCategory, sortBy, maxPrice, inStockOnly, user?.accessToken]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat.name);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setDebouncedSearch('');
    setMaxPrice(250000);
    setInStockOnly(false);
    setSortBy('featured');
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }
  };

  const startRecord = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, totalCount);

  // Pagination page pills generator
  const getPaginationNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      }
    }

    let prev = 0;
    for (const i of range) {
      if (prev) {
        if (i - prev === 2) {
          rangeWithDots.push(prev + 1);
        } else if (i - prev !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      prev = i;
    }

    return rangeWithDots;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Left Sidebar Filter Column */}
      <aside className="w-full lg:w-72 glass-panel p-6 rounded-3xl border border-slate-200/80 bg-white/90 shadow-sm space-y-6 shrink-0 lg:sticky lg:top-24">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-brand-600" /> Filters
          </h3>
          <button
            onClick={handleResetFilters}
            className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>

        {/* Search Filter */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Search Keywords</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Headphones, Monitor, GPU..."
              className="w-full pl-10 pr-3 py-2.5 glass-input text-xs"
            />
          </div>
        </div>

        {/* Categories Dynamic Vertical Filter List */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Categories</label>
          <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
            {isCategoriesLoading ? (
              <div className="space-y-2 animate-pulse py-1">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={`cat-skel-${idx}`} className="h-8 rounded-xl bg-slate-200/70 w-full" />
                ))}
              </div>
            ) : (
              categoryList.map((cat) => {
                const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
                return (
                  <button
                    key={cat.id || cat.slug}
                    onClick={() => handleCategorySelect(cat)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${isSelected
                      ? 'bg-brand-50 text-brand-600 font-semibold border border-brand-200 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                  >
                    <span>{cat.name}</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-brand-600"></span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Price Slider */}
        <div className="space-y-3 pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Max Price</span>
            <span className="text-brand-600 font-display">₹{maxPrice.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="500"
            max="250000"
            step="1000"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(Number(e.target.value));
              setPage(1);
            }}
            className="w-full accent-brand-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-medium">
            <span>₹500</span>
            <span>₹2,50,000</span>
          </div>
        </div>

        {/* Stock Filter Checkbox */}
        <div className="pt-2 border-t border-slate-200">
          <label className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => {
                setInStockOnly(e.target.checked);
                setPage(1);
              }}
              className="rounded accent-brand-600 w-4 h-4 bg-slate-100 border-slate-300 cursor-pointer"
            />
            <span>In Stock Items Only</span>
          </label>
        </div>
      </aside>

      {/* Right Product Grid Stream */}
      <div className="flex-1 min-w-0 space-y-6 w-full">
        {/* Sorting & Results Count Header */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-200/80 bg-white/90 shadow-sm">
          <div className="text-xs text-slate-500">
            Showing <span className="font-bold text-slate-900">{startRecord}–{endRecord}</span> of{' '}
            <span className="font-bold text-slate-900">{totalCount}</span> products
            {selectedCategory !== 'All' && selectedCategory !== 'all' && (
              <span> in <strong className="text-brand-600">{selectedCategory}</strong></span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Items Per Page Selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="hidden sm:inline">Per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="glass-input py-1 px-2 text-xs bg-slate-100/80 text-slate-800 border-slate-300 cursor-pointer font-medium rounded-lg"
              >
                <option value={9}>9</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="glass-input py-1.5 px-3 text-xs bg-slate-100/80 text-slate-800 border-slate-300 cursor-pointer font-medium"
              >
                <option value="featured" className="bg-white text-slate-900">Sort by: Featured</option>
                <option value="price-low" className="bg-white text-slate-900">Price: Low to High</option>
                <option value="price-high" className="bg-white text-slate-900">Price: High to Low</option>
                <option value="newest" className="bg-white text-slate-900">Newest Arrivals</option>
              </select>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Items Display: Skeletons vs Data */}
        {isLoading ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: limit }).map((_, index) => (
                <ProductCardSkeleton key={`skeleton-${index}`} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {Array.from({ length: Math.min(limit, 6) }).map((_, index) => (
                <div key={`skeleton-list-${index}`} className="glass-panel rounded-3xl p-4 flex flex-col sm:flex-row items-center gap-6 border border-slate-200/80 bg-white/90 shadow-sm animate-pulse">
                  <div className="shrink-0 w-full sm:w-48 h-40 rounded-2xl bg-slate-200" />
                  <div className="flex-1 space-y-3 w-full">
                    <div className="h-3 w-24 bg-slate-200 rounded" />
                    <div className="h-5 w-3/4 bg-slate-200 rounded" />
                    <div className="h-3 w-full bg-slate-200 rounded" />
                  </div>
                  <div className="h-10 w-28 bg-slate-200 rounded-xl" />
                </div>
              ))}
            </div>
          )
        ) : error ? (
          <div className="text-center py-20 glass-panel rounded-3xl space-y-3 border border-rose-200 bg-white shadow-sm">
            <p className="text-base font-semibold text-rose-600">Failed to load products</p>
            <p className="text-xs text-slate-500">{error}</p>
            <button
              onClick={fetchProducts}
              className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-500 transition-all inline-flex items-center gap-1.5 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Try Again
            </button>
          </div>
        ) : productsList.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-3xl space-y-3 border border-slate-200 bg-white shadow-sm">
            <PackageOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-lg font-semibold text-slate-900">No hardware products found</p>
            <p className="text-xs text-slate-500">Try adjusting your filters or search keywords.</p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-brand-50 text-brand-600 text-xs font-semibold border border-brand-200 hover:bg-brand-100 transition-all inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear All Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productsList.map((product) => (
              <ProductCard key={product.id || product.slug} product={product} />
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {productsList.map((product) => {
              const displayImage = product.featuredImage || product.image || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';
              const displayCategory = (Array.isArray(product.categories) && product.categories.length > 0)
                ? (product.categories[0].name || product.categories[0])
                : (typeof product.category === 'string' ? product.category.split(',')[0].trim() : '') || 'Hardware';

              return (
                <div
                  key={product.id || product.slug}
                  className="glass-panel glass-panel-hover rounded-3xl p-4 flex flex-col sm:flex-row items-center gap-6 border border-slate-200 bg-white shadow-sm"
                >
                  <a href={`/shop/${product.slug}`} className="shrink-0 w-full sm:w-48 h-40 rounded-2xl overflow-hidden bg-slate-100 relative block">
                    {product.badge && (
                      <span className={`absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[10px] tracking-wider border ${getBadgeStyle(product.badge)}`}>
                        {product.badge}
                      </span>
                    )}
                    <img
                      src={displayImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </a>

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">{displayCategory}</span>
                      {product.rating && (
                        <>
                          <span className="text-slate-300">•</span>
                          <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                            <span>{product.rating}</span>
                          </div>
                        </>
                      )}
                    </div>

                    <a href={`/shop/${product.slug}`}>
                      <h3 className="font-display font-bold text-lg text-slate-900 hover:text-brand-600 transition-colors">
                        {product.name}
                      </h3>
                    </a>
                    {product.description && (
                      <p className="text-xs text-slate-500 line-clamp-2">{product.description}</p>
                    )}
                  </div>

                  <div className="flex flex-col items-center sm:items-end gap-3 shrink-0">
                    <div className="text-right">
                      {isLoggedIn ? (
                        <span className="text-2xl font-extrabold font-display text-slate-900">{formatPrice(product.price)}</span>
                      ) : (
                        <a
                          href="/login"
                          className="py-1.5 px-3 rounded-lg border border-brand-200 text-brand-600 bg-brand-50 hover:bg-brand-100 font-semibold text-xs transition-colors"
                        >
                          Sign In to View Price
                        </a>
                      )}
                    </div>
                    {isLoggedIn && <AddToCartButton product={{ ...product, image: displayImage, category: displayCategory }} compact={false} />}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── Modern Pagination Bar ─────────────────────────────────────────── */}
        {!isLoading && totalPages > 1 && (
          <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-200/80 bg-white/90 shadow-sm mt-8">
            <div className="text-xs text-slate-500">
              Page <span className="font-bold text-slate-900">{page}</span> of{' '}
              <span className="font-bold text-slate-900">{totalPages}</span> ({totalCount} total items)
            </div>

            <div className="flex items-center gap-1.5">
              {/* First Page */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={page === 1}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Prev Page */}
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>

              {/* Numbered Page Buttons */}
              <div className="flex items-center gap-1">
                {getPaginationNumbers().map((pNum, idx) => {
                  if (pNum === '...') {
                    return (
                      <span key={`dots-${idx}`} className="px-2 text-slate-400 text-xs font-bold">
                        …
                      </span>
                    );
                  }
                  const isCurrent = pNum === page;
                  return (
                    <button
                      key={pNum}
                      onClick={() => handlePageChange(pNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${isCurrent
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                        : 'text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                        }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Page */}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>

              {/* Last Page */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={page === totalPages}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
