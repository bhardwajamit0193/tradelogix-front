import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search, SlidersHorizontal, Grid, List, ArrowUpDown, RotateCcw,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, PackageOpen,
  Building2, Cpu, MemoryStick, HardDrive, X, ChevronDown, Check
} from 'lucide-react';
import AddToCartButton from './AddToCartButton.jsx';
import ProductCard, { ProductCardSkeleton, getBadgeStyle } from './ProductCard.jsx';
import { formatPrice } from '../../utils/formatters.js';
import { useStore } from '@nanostores/react';
import { userStore } from '../../store/authStore.js';

const API_URL = import.meta.env.PUBLIC_API_URL || (typeof window !== 'undefined' && window.__PUBLIC_API_URL__) || 'http://localhost:6543';

export default function ProductFilter({ initialCategory = 'All' }) {
  const user = useStore(userStore);
  const isLoggedIn = user?.isLoggedIn;

  // Filter States - Multi-select Checkbox Arrays
  const [selectedCategories, setSelectedCategories] = useState(() => {
    if (initialCategory && initialCategory !== 'All' && initialCategory !== 'all') {
      return [initialCategory];
    }
    return [];
  });
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedProcessors, setSelectedProcessors] = useState([]);
  const [selectedRams, setSelectedRams] = useState([]);
  const [selectedStorages, setSelectedStorages] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');

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
  const [categoryList, setCategoryList] = useState([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync initial query params from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      const search = params.get('search');
      const brand = params.get('brand');
      const processor = params.get('processor');
      const ram = params.get('ram');
      const storage = params.get('storage');
      const tag = params.get('tag');

      if (cat && cat !== 'All' && cat !== 'all') {
        setSelectedCategories(cat.split(',').map(s => s.trim()).filter(Boolean));
      }
      if (search) {
        setSearchQuery(search);
        setDebouncedSearch(search);
      }
      if (tag && tag !== 'All') {
        setSelectedTag(tag.trim());
      }
      if (brand && brand !== 'All') {
        setSelectedBrands(brand.split(',').map(s => s.trim()).filter(Boolean));
      }
      if (processor && processor !== 'All') {
        setSelectedProcessors(processor.split(',').map(s => s.trim()).filter(Boolean));
      }
      if (ram && ram !== 'All') {
        setSelectedRams(ram.split(',').map(s => s.trim()).filter(Boolean));
      }
      if (storage && storage !== 'All') {
        setSelectedStorages(storage.split(',').map(s => s.trim()).filter(Boolean));
      }
    }
  }, []);

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
            setCategoryList(
              items
                .filter((c) => c && c.name && c.name.toLowerCase() !== 'all')
                .map((c) => ({
                  id: c.id,
                  name: c.name,
                  slug: c.slug || c.name.toLowerCase().replace(/\s+/g, '-'),
                }))
            );
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
      if (selectedCategories.length > 0) {
        params.set('category', selectedCategories.join(','));
      }
      if (selectedBrands.length > 0) {
        params.set('brand', selectedBrands.join(','));
      }
      if (selectedProcessors.length > 0) {
        params.set('processor', selectedProcessors.join(','));
      }
      if (selectedRams.length > 0) {
        params.set('ram', selectedRams.join(','));
      }
      if (selectedStorages.length > 0) {
        params.set('storage', selectedStorages.join(','));
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
      if (selectedTag && selectedTag !== 'All') {
        params.set('tag', selectedTag);
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
  }, [
    page, limit, debouncedSearch, selectedCategories,
    selectedBrands, selectedProcessors, selectedRams, selectedStorages,
    sortBy, maxPrice, inStockOnly, selectedTag, user?.accessToken
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Extract dynamically available options from current catalog products & presets
  const availableBrands = useMemo(() => {
    const brandsSet = new Set(['HP', 'Dell', 'Lenovo', 'Apple', 'Asus', 'Acer', 'Samsung']);
    productsList.forEach((p) => {
      (p.specifications || []).forEach((s) => {
        if (s && s.key && s.key.toLowerCase().trim() === 'brand' && s.value) {
          brandsSet.add(s.value.trim());
        }
      });
      const lowerName = (p.name || '').toLowerCase();
      if (lowerName.includes('hp')) brandsSet.add('HP');
      if (lowerName.includes('dell')) brandsSet.add('Dell');
      if (lowerName.includes('lenovo')) brandsSet.add('Lenovo');
      if (lowerName.includes('apple') || lowerName.includes('macbook')) brandsSet.add('Apple');
      if (lowerName.includes('asus')) brandsSet.add('Asus');
      if (lowerName.includes('acer')) brandsSet.add('Acer');
      if (lowerName.includes('samsung')) brandsSet.add('Samsung');
    });
    return Array.from(brandsSet);
  }, [productsList]);

  const availableProcessors = useMemo(() => {
    const procsSet = new Set([
      'Intel Core i3',
      'Intel Core i5',
      'Intel Core i7',
      'Intel Core i9',
      'AMD Ryzen 5',
      'AMD Ryzen 7',
    ]);
    productsList.forEach((p) => {
      (p.specifications || []).forEach((s) => {
        if (
          s &&
          s.key &&
          (s.key.toLowerCase().includes('processor') || s.key.toLowerCase().includes('cpu')) &&
          s.value
        ) {
          procsSet.add(s.value.trim());
        }
      });
      const lowerName = (p.name || '').toLowerCase();
      if (lowerName.includes('core i3') || lowerName.includes('i3')) procsSet.add('Intel Core i3');
      if (lowerName.includes('core i5') || lowerName.includes('i5')) procsSet.add('Intel Core i5');
      if (lowerName.includes('core i7') || lowerName.includes('i7')) procsSet.add('Intel Core i7');
      if (lowerName.includes('core i9') || lowerName.includes('i9')) procsSet.add('Intel Core i9');
      if (lowerName.includes('ryzen 5')) procsSet.add('AMD Ryzen 5');
      if (lowerName.includes('ryzen 7')) procsSet.add('AMD Ryzen 7');
    });
    return Array.from(procsSet);
  }, [productsList]);

  const availableRams = useMemo(() => {
    const ramSet = new Set(['4 GB', '8 GB', '16 GB', '32 GB', '64 GB']);
    productsList.forEach((p) => {
      (p.specifications || []).forEach((s) => {
        if (
          s &&
          s.key &&
          (s.key.toLowerCase().includes('ram') || s.key.toLowerCase().includes('memory')) &&
          s.value
        ) {
          ramSet.add(s.value.trim());
        }
      });
    });
    return Array.from(ramSet);
  }, [productsList]);

  const availableStorages = useMemo(() => {
    const storageSet = new Set(['128 GB', '256 GB', '512 GB', '1 TB', '2 TB']);
    productsList.forEach((p) => {
      (p.specifications || []).forEach((s) => {
        if (
          s &&
          s.key &&
          (s.key.toLowerCase().includes('ssd') ||
            s.key.toLowerCase().includes('storage') ||
            s.key.toLowerCase().includes('hdd') ||
            s.key.toLowerCase().includes('rom')) &&
          s.value
        ) {
          storageSet.add(s.value.trim());
        }
      });
    });
    return Array.from(storageSet);
  }, [productsList]);

  // Client-side filtering ensures instant feedback even if backend is serving cached page
  const filteredProducts = useMemo(() => {
    return productsList.filter((p) => {
      const specs = Array.isArray(p.specifications) ? p.specifications : [];

      // 1. Categories Multi-Select Filter
      if (selectedCategories.length > 0) {
        const pCats = Array.isArray(p.categories)
          ? p.categories.map((c) => (c.name || c.slug || c || '').toLowerCase())
          : [];
        const pCatStr = (typeof p.category === 'string' ? p.category : '').toLowerCase();
        const matchesCat = selectedCategories.some((sc) => {
          const scLower = sc.toLowerCase();
          return pCats.some((c) => c.includes(scLower)) || pCatStr.includes(scLower);
        });
        if (!matchesCat) return false;
      }

      // 2. Brand Multi-Select Filter
      if (selectedBrands.length > 0) {
        const brandSpec = specs.find(
          (s) => s && s.key && s.key.toLowerCase().trim() === 'brand'
        );
        const specVal = brandSpec && brandSpec.value ? brandSpec.value.toLowerCase() : '';
        const prodName = (p.name || '').toLowerCase();
        const prodTags = (p.tags || []).map((t) => (t.name || t || '').toLowerCase());

        const matchesBrand = selectedBrands.some((b) => {
          const bLower = b.toLowerCase();
          return (
            specVal.includes(bLower) ||
            prodName.includes(bLower) ||
            prodTags.some((t) => t.includes(bLower))
          );
        });
        if (!matchesBrand) return false;
      }

      // 3. Processor Multi-Select Filter
      if (selectedProcessors.length > 0) {
        const procSpec = specs.find(
          (s) =>
            s &&
            s.key &&
            (s.key.toLowerCase().includes('processor') || s.key.toLowerCase().includes('cpu'))
        );
        const specVal = procSpec && procSpec.value ? procSpec.value.toLowerCase() : '';
        const prodName = (p.name || '').toLowerCase();

        const matchesProc = selectedProcessors.some((pr) => {
          const prLower = pr.toLowerCase();
          const procKeywords = prLower.replace(/intel\s+|amd\s+/gi, '').trim();
          return (
            specVal.includes(prLower) ||
            prodName.includes(prLower) ||
            (procKeywords && prodName.includes(procKeywords))
          );
        });
        if (!matchesProc) return false;
      }

      // 4. RAM Multi-Select Filter
      if (selectedRams.length > 0) {
        const ramSpec = specs.find(
          (s) =>
            s &&
            s.key &&
            (s.key.toLowerCase().includes('ram') || s.key.toLowerCase().includes('memory'))
        );
        const specVal = ramSpec && ramSpec.value ? ramSpec.value.toLowerCase().replace(/\s+/g, '') : '';
        const prodName = (p.name || '').toLowerCase().replace(/\s+/g, '');

        const matchesRam = selectedRams.some((r) => {
          const rLower = r.toLowerCase().replace(/\s+/g, '');
          return specVal.includes(rLower) || prodName.includes(rLower);
        });
        if (!matchesRam) return false;
      }

      // 5. Storage Multi-Select Filter
      if (selectedStorages.length > 0) {
        const storageSpec = specs.find(
          (s) =>
            s &&
            s.key &&
            (s.key.toLowerCase().includes('ssd') ||
              s.key.toLowerCase().includes('storage') ||
              s.key.toLowerCase().includes('hdd') ||
              s.key.toLowerCase().includes('rom'))
        );
        const specVal = storageSpec && storageSpec.value ? storageSpec.value.toLowerCase().replace(/\s+/g, '') : '';
        const prodName = (p.name || '').toLowerCase().replace(/\s+/g, '');

        const matchesStorage = selectedStorages.some((st) => {
          const stLower = st.toLowerCase().replace(/\s+/g, '');
          return specVal.includes(stLower) || prodName.includes(stLower);
        });
        if (!matchesStorage) return false;
      }

      return true;
    });
  }, [productsList, selectedCategories, selectedBrands, selectedProcessors, selectedRams, selectedStorages]);

  // Checkbox Toggle Handlers
  const handleToggleCategory = (catName) => {
    setSelectedCategories((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName]
    );
    setPage(1);
  };

  const handleToggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
    setPage(1);
  };

  const handleToggleProcessor = (proc) => {
    setSelectedProcessors((prev) =>
      prev.includes(proc) ? prev.filter((p) => p !== proc) : [...prev, proc]
    );
    setPage(1);
  };

  const handleToggleRam = (ram) => {
    setSelectedRams((prev) =>
      prev.includes(ram) ? prev.filter((r) => r !== ram) : [...prev, ram]
    );
    setPage(1);
  };

  const handleToggleStorage = (storage) => {
    setSelectedStorages((prev) =>
      prev.includes(storage) ? prev.filter((s) => s !== storage) : [...prev, storage]
    );
    setPage(1);
  };

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    brand: true,
    processor: false,
    ram: false,
    storage: false,
    price: true,
  });

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Lock body scroll when mobile filter drawer is open
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isMobileFiltersOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [isMobileFiltersOpen]);

  // Auto-expand sections if they have active selected filters
  useEffect(() => {
    if (selectedProcessors.length > 0) setExpandedSections((prev) => ({ ...prev, processor: true }));
    if (selectedRams.length > 0) setExpandedSections((prev) => ({ ...prev, ram: true }));
    if (selectedStorages.length > 0) setExpandedSections((prev) => ({ ...prev, storage: true }));
  }, [selectedProcessors.length, selectedRams.length, selectedStorages.length]);

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedProcessors([]);
    setSelectedRams([]);
    setSelectedStorages([]);
    setSelectedTag('');
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

  const activeFilterCount =
    selectedCategories.length +
    selectedBrands.length +
    selectedProcessors.length +
    selectedRams.length +
    selectedStorages.length +
    (selectedTag ? 1 : 0) +
    (debouncedSearch.trim() ? 1 : 0) +
    (maxPrice < 250000 ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  const hasActiveFilters = activeFilterCount > 0;

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

  // Reusable Filter Options Content for both Desktop Sidebar and Mobile Drawer
  const renderFilterOptions = () => (
    <div className="space-y-4">
      {/* Search Filter */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Search Keywords</label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Headphones, Monitor, GPU..."
            className="w-full pl-10 pr-3 py-2 glass-input text-xs"
          />
        </div>
      </div>

      {/* ─── Categories Filter (Collapsible Checkboxes) ─────────────────────────── */}
      <div className="space-y-2 pt-2 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => toggleSection('categories')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider hover:text-brand-600 transition-colors cursor-pointer select-none"
          >
            <span>Categories</span>
            {selectedCategories.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold">
                {selectedCategories.length}
              </span>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                expandedSections.categories ? 'rotate-180' : ''
              }`}
            />
          </button>
          {selectedCategories.length > 0 && (
            <button
              onClick={() => setSelectedCategories([])}
              className="text-[10px] text-brand-600 hover:underline font-semibold cursor-pointer"
            >
              Clear ({selectedCategories.length})
            </button>
          )}
        </div>
        {expandedSections.categories && (
          <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
            {isCategoriesLoading ? (
              <div className="space-y-2 animate-pulse py-1">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={`cat-skel-${idx}`} className="h-6 rounded bg-slate-200/70 w-full" />
                ))}
              </div>
            ) : categoryList.length === 0 ? (
              <p className="text-[11px] text-slate-400 py-1">No categories available</p>
            ) : (
              categoryList.map((cat) => {
                const isChecked = selectedCategories.includes(cat.name);
                return (
                  <label
                    key={cat.id || cat.slug}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer hover:bg-slate-100/80 transition-colors select-none group"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleCategory(cat.name)}
                      className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 accent-brand-600 cursor-pointer"
                    />
                    <span
                      className={`transition-colors truncate ${
                        isChecked ? 'text-brand-700 font-bold' : 'text-slate-700 group-hover:text-slate-900'
                      }`}
                    >
                      {cat.name}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ─── 1. Brand Wise Filter (Collapsible Checkboxes) ─────────────────────── */}
      <div className="space-y-2 pt-3 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => toggleSection('brand')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider hover:text-brand-600 transition-colors cursor-pointer select-none"
          >
            <Building2 className="w-3.5 h-3.5 text-brand-600" />
            <span>Brand</span>
            {selectedBrands.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold">
                {selectedBrands.length}
              </span>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                expandedSections.brand ? 'rotate-180' : ''
              }`}
            />
          </button>
          {selectedBrands.length > 0 && (
            <button
              onClick={() => setSelectedBrands([])}
              className="text-[10px] text-brand-600 hover:underline font-semibold cursor-pointer"
            >
              Clear ({selectedBrands.length})
            </button>
          )}
        </div>
        {expandedSections.brand && (
          <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
            {availableBrands.map((b) => {
              const isChecked = selectedBrands.includes(b);
              return (
                <label
                  key={b}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer hover:bg-slate-100/80 transition-colors select-none group"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleBrand(b)}
                    className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 accent-brand-600 cursor-pointer"
                  />
                  <span
                    className={`transition-colors ${
                      isChecked ? 'text-brand-700 font-bold' : 'text-slate-700 group-hover:text-slate-900'
                    }`}
                  >
                    {b}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── 2. Processor Wise Filter (Collapsible Checkboxes) ─────────────────── */}
      <div className="space-y-2 pt-3 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => toggleSection('processor')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider hover:text-brand-600 transition-colors cursor-pointer select-none"
          >
            <Cpu className="w-3.5 h-3.5 text-brand-600" />
            <span>Processor</span>
            {selectedProcessors.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold">
                {selectedProcessors.length}
              </span>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                expandedSections.processor ? 'rotate-180' : ''
              }`}
            />
          </button>
          {selectedProcessors.length > 0 && (
            <button
              onClick={() => setSelectedProcessors([])}
              className="text-[10px] text-brand-600 hover:underline font-semibold cursor-pointer"
            >
              Clear ({selectedProcessors.length})
            </button>
          )}
        </div>
        {expandedSections.processor && (
          <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
            {availableProcessors.map((proc) => {
              const isChecked = selectedProcessors.includes(proc);
              return (
                <label
                  key={proc}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer hover:bg-slate-100/80 transition-colors select-none group"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleProcessor(proc)}
                    className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 accent-brand-600 cursor-pointer"
                  />
                  <span
                    className={`transition-colors ${
                      isChecked ? 'text-brand-700 font-bold' : 'text-slate-700 group-hover:text-slate-900'
                    }`}
                  >
                    {proc}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── 3. RAM Wise Filter (Collapsible Checkboxes) ───────────────────────── */}
      <div className="space-y-2 pt-3 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => toggleSection('ram')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider hover:text-brand-600 transition-colors cursor-pointer select-none"
          >
            <MemoryStick className="w-3.5 h-3.5 text-brand-600" />
            <span>RAM</span>
            {selectedRams.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold">
                {selectedRams.length}
              </span>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                expandedSections.ram ? 'rotate-180' : ''
              }`}
            />
          </button>
          {selectedRams.length > 0 && (
            <button
              onClick={() => setSelectedRams([])}
              className="text-[10px] text-brand-600 hover:underline font-semibold cursor-pointer"
            >
              Clear ({selectedRams.length})
            </button>
          )}
        </div>
        {expandedSections.ram && (
          <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
            {availableRams.map((r) => {
              const isChecked = selectedRams.includes(r);
              return (
                <label
                  key={r}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer hover:bg-slate-100/80 transition-colors select-none group"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleRam(r)}
                    className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 accent-brand-600 cursor-pointer"
                  />
                  <span
                    className={`transition-colors ${
                      isChecked ? 'text-brand-700 font-bold' : 'text-slate-700 group-hover:text-slate-900'
                    }`}
                  >
                    {r}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── 4. Storage Wise Filter (Collapsible Checkboxes) ───────────────────── */}
      <div className="space-y-2 pt-3 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => toggleSection('storage')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider hover:text-brand-600 transition-colors cursor-pointer select-none"
          >
            <HardDrive className="w-3.5 h-3.5 text-brand-600" />
            <span>Storage (SSD/HDD)</span>
            {selectedStorages.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold">
                {selectedStorages.length}
              </span>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                expandedSections.storage ? 'rotate-180' : ''
              }`}
            />
          </button>
          {selectedStorages.length > 0 && (
            <button
              onClick={() => setSelectedStorages([])}
              className="text-[10px] text-brand-600 hover:underline font-semibold cursor-pointer"
            >
              Clear ({selectedStorages.length})
            </button>
          )}
        </div>
        {expandedSections.storage && (
          <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
            {availableStorages.map((st) => {
              const isChecked = selectedStorages.includes(st);
              return (
                <label
                  key={st}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer hover:bg-slate-100/80 transition-colors select-none group"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleStorage(st)}
                    className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 accent-brand-600 cursor-pointer"
                  />
                  <span
                    className={`transition-colors ${
                      isChecked ? 'text-brand-700 font-bold' : 'text-slate-700 group-hover:text-slate-900'
                    }`}
                  >
                    {st}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Price Slider */}
      <div className="space-y-2.5 pt-3 border-t border-slate-200">
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
      <div className="pt-3 border-t border-slate-200">
        <label className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold cursor-pointer select-none">
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
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start min-w-0">
      {/* ─── Desktop Left Sidebar Filter Column (Hidden on Mobile) ────────────────── */}
      <aside className="hidden lg:block w-72 glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200/80 bg-white/95 shadow-sm space-y-4 shrink-0 sticky top-24">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-brand-600" /> Filters
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200">
                {activeFilterCount}
              </span>
            )}
          </h3>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset All
            </button>
          )}
        </div>

        {/* Filter Content */}
        {renderFilterOptions()}
      </aside>

      {/* ─── Mobile Slide-Up Filter Drawer (Bottom Sheet) ────────────────────────── */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end animate-fadeIn">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFiltersOpen(false)}
          />

          {/* Bottom Sheet Modal Container */}
          <div className="relative bg-white w-full max-h-[86vh] rounded-t-3xl shadow-2xl flex flex-col z-10 animate-slideUp">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                <h3 className="font-display font-bold text-base text-slate-900">Filters</h3>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200">
                    {activeFilterCount} active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs text-brand-600 hover:underline font-semibold cursor-pointer"
                  >
                    Reset All
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Filter Body */}
            <div className="overflow-y-auto px-5 py-4 flex-1">
              {renderFilterOptions()}
            </div>

            {/* Sticky Apply Button Footer */}
            <div className="p-4 border-t border-slate-100 bg-white/95 backdrop-blur-xs shrink-0">
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Apply Filters ({filteredProducts.length} Results)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Right Product Grid Stream ────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 space-y-4 w-full">
        {/* Mobile Filter Trigger Bar (Hidden on Desktop) */}
        <div className="lg:hidden flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-xs active:scale-[0.99] transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter & Refine</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-white text-brand-600 text-[10px] font-black shadow-2xs">
                {activeFilterCount}
              </span>
            )}
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Active Filter Chips Bar */}
        {hasActiveFilters && (
          <div className="glass-panel p-3 px-4 rounded-2xl flex flex-wrap items-center gap-2 border border-slate-200/80 bg-white/90 shadow-2xs">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Active:</span>
            {selectedCategories.map((cat) => (
              <span key={`chip-cat-${cat}`} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                Category: {cat}
                <button onClick={() => handleToggleCategory(cat)} className="hover:text-brand-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedBrands.map((b) => (
              <span key={`chip-brand-${b}`} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                Brand: {b}
                <button onClick={() => handleToggleBrand(b)} className="hover:text-brand-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedProcessors.map((p) => (
              <span key={`chip-proc-${p}`} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                CPU: {p}
                <button onClick={() => handleToggleProcessor(p)} className="hover:text-brand-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedRams.map((r) => (
              <span key={`chip-ram-${r}`} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                RAM: {r}
                <button onClick={() => handleToggleRam(r)} className="hover:text-brand-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {selectedStorages.map((s) => (
              <span key={`chip-storage-${s}`} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                Storage: {s}
                <button onClick={() => handleToggleStorage(s)} className="hover:text-brand-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {debouncedSearch.trim() && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                Search: &ldquo;{debouncedSearch}&rdquo;
                <button onClick={() => { setSearchQuery(''); setDebouncedSearch(''); }} className="hover:text-slate-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedTag && (
              <span key="chip-tag" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                Tag: #{selectedTag}
                <button
                  onClick={() => {
                    setSelectedTag('');
                    setPage(1);
                    if (typeof window !== 'undefined') {
                      const url = new URL(window.location.href);
                      url.searchParams.delete('tag');
                      window.history.replaceState({}, '', url.toString());
                    }
                  }}
                  className="hover:text-brand-900 cursor-pointer"
                  title="Remove tag filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-slate-500 hover:text-brand-600 font-bold underline ml-auto cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Sorting & Results Count Header */}
        <div className="glass-panel p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border border-slate-200/80 bg-white/90 shadow-sm">
          <div className="text-xs text-slate-500">
            Showing <span className="font-bold text-slate-900">{startRecord}–{endRecord}</span> of{' '}
            <span className="font-bold text-slate-900">{totalCount}</span> products
            {selectedCategories.length > 0 && (
              <span> in <strong className="text-brand-600">{selectedCategories.join(', ')}</strong></span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
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
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="glass-input py-1.5 px-2.5 text-xs bg-slate-100/80 text-slate-800 border-slate-300 cursor-pointer font-medium max-w-[150px] sm:max-w-none"
              >
                <option value="featured" className="bg-white text-slate-900">Sort: Featured</option>
                <option value="price-low" className="bg-white text-slate-900">Price: Low to High</option>
                <option value="price-high" className="bg-white text-slate-900">Price: High to Low</option>
                <option value="newest" className="bg-white text-slate-900">Newest</option>
              </select>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
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
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-3xl space-y-3 border border-slate-200 bg-white shadow-sm">
            <PackageOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-lg font-semibold text-slate-900">No hardware products found</p>
            <p className="text-xs text-slate-500">Try adjusting your brand, processor, RAM, storage, or category filters.</p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-brand-50 text-brand-600 text-xs font-semibold border border-brand-200 hover:bg-brand-100 transition-all inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear All Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id || product.slug} product={product} />
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredProducts.map((product) => {
              const displayImage = product.featuredImage || product.image || (product.images && product.images[0]) || '/placeholder-product.svg';
              const displayCategory = (Array.isArray(product.categories) && product.categories.length > 0)
                ? (product.categories[0].name || product.categories[0])
                : (typeof product.category === 'string' ? product.category.split(',')[0].trim() : '') || 'Hardware';

              // Extract RAM, Storage, CPU badges if present in specifications
              const specs = Array.isArray(product.specifications) ? product.specifications : [];
              const ramSpec = specs.find(s => s && s.key && (s.key.toLowerCase().includes('ram') || s.key.toLowerCase().includes('memory')));
              const storageSpec = specs.find(s => s && s.key && (s.key.toLowerCase().includes('ssd') || s.key.toLowerCase().includes('storage') || s.key.toLowerCase().includes('hdd')));
              const cpuSpec = specs.find(s => s && s.key && (s.key.toLowerCase().includes('processor') || s.key.toLowerCase().includes('cpu')));

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
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-product.svg';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </a>

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider bg-brand-50 px-2 py-0.5 rounded-md border border-brand-100">
                        {displayCategory}
                      </span>
                      {product.sku && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          SKU: {product.sku}
                        </span>
                      )}
                    </div>

                    <h3 className="font-display font-bold text-base text-slate-900 hover:text-brand-600 transition-colors">
                      <a href={`/shop/${product.slug}`}>{product.name}</a>
                    </h3>

                    {/* Spec Pills in List View */}
                    {(ramSpec || storageSpec || cpuSpec) && (
                      <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start pt-1">
                        {cpuSpec && (
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                            <Cpu className="w-2.5 h-2.5 text-brand-600" /> {cpuSpec.value}
                          </span>
                        )}
                        {ramSpec && (
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                            <MemoryStick className="w-2.5 h-2.5 text-brand-600" /> {ramSpec.value}
                          </span>
                        )}
                        {storageSpec && (
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                            <HardDrive className="w-2.5 h-2.5 text-brand-600" /> {storageSpec.value}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
                      <span className="font-display font-black text-lg text-slate-900">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 w-full sm:w-auto">
                    <AddToCartButton product={product} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-200/80 bg-white/90 shadow-sm mt-8">
            <div className="text-xs text-slate-500 font-medium">
              Page <span className="font-bold text-slate-900">{page}</span> of{' '}
              <span className="font-bold text-slate-900">{totalPages}</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
              <button
                onClick={() => handlePageChange(1)}
                disabled={page === 1}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 px-1">
                {getPaginationNumbers().map((num, idx) => {
                  if (num === '...') {
                    return (
                      <span key={`dots-${idx}`} className="px-2 text-xs text-slate-400 select-none">
                        ...
                      </span>
                    );
                  }
                  const isCur = num === page;
                  return (
                    <button
                      key={`page-${num}`}
                      onClick={() => handlePageChange(num)}
                      className={`min-w-[32px] h-8 px-2 rounded-xl text-xs font-bold transition-all ${
                        isCur
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={page === totalPages}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
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
