import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  fetchAdminPageByIdApi,
  createAdminPageApi,
  updateAdminPageApi,
  DEFAULT_PAGES,
  DEFAULT_HOME_SECTIONS,
  parseHomeSections,
  DEFAULT_ABOUT_SECTIONS,
  parseAboutSections,
  DEFAULT_CONTACT_SECTIONS,
  parseContactSections,
} from '../../services/pagesService.js';
import { PRODUCTS } from '../../services/productService.js';
import MediaLibraryModal from './MediaLibraryModal.jsx';
import { Editor } from '@tinymce/tinymce-react';

const API_URL = import.meta.env.PUBLIC_API_URL || (typeof window !== 'undefined' && window.__PUBLIC_API_URL__) || 'http://localhost:6543';

// ─── Sub-Component: Category Checklist Selector ──────────────────────────────
function CategoryChecklist({ categories = [], selected = [], onChange }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter(
      (c) => (c.name || '').toLowerCase().includes(q) || (c.slug || '').toLowerCase().includes(q)
    );
  }, [categories, search]);

  const toggleCategory = (catId) => {
    if (selected.includes(catId)) {
      onChange(selected.filter((id) => id !== catId));
    } else {
      onChange([...selected, catId]);
    }
  };

  const handleSelectAll = () => {
    onChange(categories.map((c) => c.name || c.id));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">Select Specific Categories</span>
          <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold">
            {selected.length} of {categories.length} Selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-[11px] font-bold text-brand-600 hover:text-brand-800 hover:underline"
          >
            Select All
          </button>
          <span className="text-slate-300">•</span>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-700 hover:underline"
          >
            Clear
          </button>
        </div>
      </div>

      {categories.length > 6 && (
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter categories..."
          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
        {filtered.map((cat) => {
          const catKey = cat.name || cat.id;
          const isChecked = selected.includes(catKey) || selected.includes(cat.id) || selected.includes(cat.name);
          return (
            <label
              key={cat.id || cat.name}
              className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-all text-xs select-none ${
                isChecked
                  ? 'bg-brand-50/80 border-brand-300 text-brand-900 font-bold'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleCategory(catKey)}
                className="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500 cursor-pointer"
              />
              <span className="truncate">{cat.name}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sub-Component: Product Picker Checklist ─────────────────────────────────
function ProductPicker({ products = [], selected = [], onChange, limit = 4, onLimitChange }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q)
    );
  }, [products, search]);

  const toggleProduct = (prodId) => {
    if (selected.includes(prodId)) {
      onChange(selected.filter((id) => id !== prodId));
    } else {
      onChange([...selected, prodId]);
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">Curate Specific Products</span>
          <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold">
            {selected.length} Selected
          </span>
        </div>

        <div className="flex items-center gap-3">
          {onLimitChange && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Max to Display:</span>
              <select
                value={limit}
                onChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value={4}>4 items</option>
                <option value={8}>8 items</option>
                <option value={12}>12 items</option>
                <option value={16}>16 items</option>
              </select>
            </div>
          )}

          {selected.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-800 hover:underline"
            >
              Clear Selected
            </button>
          )}
        </div>
      </div>

      {/* Search Filter Input */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-[16px]">
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by title, SKU, or category..."
          className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {/* Product List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
        {filtered.map((prod) => {
          const isSelected = selected.includes(prod.id) || selected.includes(prod.slug);
          const imgSrc = prod.image || (prod.images && prod.images[0]) || '';
          return (
            <div
              key={prod.id || prod.slug}
              onClick={() => toggleProduct(prod.id || prod.slug)}
              className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all select-none ${
                isSelected
                  ? 'bg-brand-50/90 border-brand-400 shadow-2xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {}} // Handled by container click
                className="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500 shrink-0 cursor-pointer"
              />

              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={prod.name}
                  className="w-9 h-9 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                  <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 truncate leading-tight">{prod.name}</div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                  <span className="font-semibold text-brand-600">₹{prod.price || prod.minPrice || '0'}</span>
                  <span>•</span>
                  <span className="truncate">{prod.category || 'Hardware'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminPageEditor({ pageId = null, isNew = false }) {
  const [loading, setLoading] = useState(!isNew && !!pageId);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'homeSections' | 'seo' | 'preview'
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'

  // Available catalog data for multi-selectors
  const [availableCategories, setAvailableCategories] = useState([
    { id: '1', name: 'Audio & Sound', slug: 'audio' },
    { id: '2', name: 'Displays & Monitors', slug: 'displays' },
    { id: '3', name: 'Keyboards & Peripherals', slug: 'peripherals' },
    { id: '4', name: 'Smart Wearables', slug: 'wearables' },
    { id: '5', name: 'NVMe Storage', slug: 'storage' },
    { id: '6', name: 'Office Supplies', slug: 'office-supplies' },
    { id: '7', name: 'Electronics', slug: 'electronics' },
  ]);
  const [availableProducts, setAvailableProducts] = useState(PRODUCTS);

  const [formData, setFormData] = useState({
    id: pageId || '',
    title: '',
    slug: '',
    subtitle: '',
    layout: 'standard', // 'standard' | 'hero' | 'policy'
    content: '',
    metaTitle: '',
    metaDescription: '',
    metaImage: '',
    isPublished: true,
    isSystemPage: false,
  });

  // Dedicated Home Sections State
  const [homeSections, setHomeSections] = useState(DEFAULT_HOME_SECTIONS);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Dedicated About Sections State
  const [aboutSections, setAboutSections] = useState(DEFAULT_ABOUT_SECTIONS);

  // Dedicated Contact Sections State
  const [contactSections, setContactSections] = useState(DEFAULT_CONTACT_SECTIONS);

  // Media Library Selection State
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaTargetCallback, setMediaTargetCallback] = useState(null);

  const cleanMediaUrl = (media) => {
    if (!media) return '';
    let url = typeof media === 'string' ? media : media.url || media.filePath || '';
    if (!url) return '';
    // Strip localhost API prefix if present to keep clean relative path /uploads/...
    url = url.replace(/^http:\/\/localhost:\d+\/uploads\//, '/uploads/');
    if (API_URL && url.startsWith(`${API_URL}/uploads/`)) {
      url = url.replace(`${API_URL}/uploads/`, '/uploads/');
    }
    return url;
  };

  const resolveMediaDisplayUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('/uploads/')) {
      return `${API_URL}${url}`;
    }
    return url;
  };

  const openMediaLibrary = (onSelectFn) => {
    setMediaTargetCallback(() => onSelectFn);
    setShowMediaModal(true);
  };

  const isHomePage = formData.slug === 'home' || pageId === 'page-home-01' || pageId === 'home';
  const isAboutPage = formData.slug === 'about' || pageId === 'page-about-02' || pageId === 'about';
  const isContactPage = formData.slug === 'contact' || pageId === 'page-contact-03' || pageId === 'contact';
  const isStructuredPage = isHomePage || isAboutPage || isContactPage;

  const showToast = (message, type = 'success') => {
    if (type === 'error') {
      toast.error(message);
    } else if (type === 'warning') {
      toast.warning(message);
    } else {
      toast.success(message);
    }
  };

  // Load Categories & Products on mount directly from database API
  useEffect(() => {
    async function loadCatalogData() {
      try {
        const catRes = await fetch(`${API_URL}/api/all-categories`);
        if (catRes.ok) {
          const catJson = await catRes.json();
          const items = catJson.data || catJson || [];
          if (Array.isArray(items) && items.length > 0) {
            setAvailableCategories(items);
          }
        }
      } catch (e) {
        // use fallback
      }

      try {
        const prodRes = await fetch(`${API_URL}/api/shop/products?limit=100`);
        if (prodRes.ok) {
          const prodJson = await prodRes.json();
          const items = prodJson.data || prodJson.items || [];
          if (Array.isArray(items) && items.length > 0) {
            setAvailableProducts(items);
          }
        }
      } catch (e) {
        // use PRODUCTS fallback
      }
    }
    loadCatalogData();
  }, []);

  useEffect(() => {
    if (pageId && !isNew) {
      const loadPageData = async () => {
        setLoading(true);
        try {
          const page = await fetchAdminPageByIdApi(pageId);
          if (page) {
            setFormData({
              id: page.id,
              title: page.title || '',
              slug: page.slug || '',
              subtitle: page.subtitle || '',
              layout: page.layout || 'standard',
              content: page.content || '',
              metaTitle: page.metaTitle || page.title || '',
              metaDescription: page.metaDescription || '',
              metaImage: page.metaImage || '',
              isPublished: page.isPublished !== undefined ? page.isPublished : true,
              isSystemPage: !!page.isSystemPage,
            });

            if (page.slug === 'home' || page.id === 'page-home-01') {
              setHomeSections(parseHomeSections(page.content));
              setActiveTab('homeSections');
            } else if (page.slug === 'about' || page.id === 'page-about-02') {
              setAboutSections(parseAboutSections(page.content));
              setActiveTab('aboutSections');
            } else if (page.slug === 'contact' || page.id === 'page-contact-03') {
              setContactSections(parseContactSections(page.content));
              setActiveTab('contactSections');
            }
          }
        } catch (err) {
          console.error('Failed to load page by ID:', err);
          const fallback = DEFAULT_PAGES.find((p) => p.id === pageId || p.slug === pageId);
          if (fallback) {
            setFormData({
              id: fallback.id,
              title: fallback.title,
              slug: fallback.slug,
              subtitle: '',
              layout: 'standard',
              content: fallback.content,
              metaTitle: fallback.metaTitle,
              metaDescription: fallback.metaDescription,
              metaImage: fallback.metaImage || '',
              isPublished: fallback.isPublished,
              isSystemPage: fallback.isSystemPage,
            });
            if (fallback.slug === 'home') {
              setHomeSections(parseHomeSections(fallback.content));
              setActiveTab('homeSections');
            } else if (fallback.slug === 'about') {
              setAboutSections(parseAboutSections(fallback.content));
              setActiveTab('aboutSections');
            } else if (fallback.slug === 'contact') {
              setContactSections(parseContactSections(fallback.content));
              setActiveTab('contactSections');
            }
          } else {
            showToast('Could not load page from database.', 'error');
          }
        } finally {
          setLoading(false);
        }
      };

      loadPageData();
    }
  }, [pageId, isNew]);

  const generateSlugFromTitle = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleTitleChange = (val) => {
    setFormData((prev) => {
      const update = { ...prev, title: val };
      if (isNew && (!prev.slug || prev.slug === generateSlugFromTitle(prev.title))) {
        update.slug = generateSlugFromTitle(val);
      }
      if (!prev.metaTitle || prev.metaTitle === prev.title) {
        update.metaTitle = val;
      }
      return update;
    });
  };

  const insertFormatting = (tagStart, tagEnd = '') => {
    const textarea = document.getElementById('page-editor-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = formData.content || '';
    const selectedText = currentVal.substring(start, end);

    const replacement = `${tagStart}${selectedText || 'Text'}${tagEnd}`;
    const newVal = currentVal.substring(0, start) + replacement + currentVal.substring(end);

    setFormData((prev) => ({ ...prev, content: newVal }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagStart.length, start + tagStart.length + (selectedText.length || 4));
    }, 50);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Page title is required.', 'error');
      return;
    }
    if (!formData.slug.trim()) {
      showToast('Page slug is required.', 'error');
      return;
    }

    setSaving(true);
    try {
      // Serialize structured sections if applicable
      let contentToSave = formData.content || '';
      if (isHomePage) {
        contentToSave = JSON.stringify(homeSections);
      } else if (isAboutPage) {
        contentToSave = JSON.stringify(aboutSections);
      } else if (isContactPage) {
        contentToSave = JSON.stringify(contactSections);
      }

      if (isNew || !formData.id) {
        const payload = {
          title: formData.title.trim(),
          slug: formData.slug.trim(),
          content: contentToSave,
          metaTitle: formData.metaTitle || formData.title.trim(),
          metaDescription: formData.metaDescription || '',
          metaImage: formData.metaImage || '',
          isPublished: formData.isPublished,
          navLabel: formData.title.trim(),
        };
        const created = await createAdminPageApi(payload);
        showToast('Page created successfully!');
        setTimeout(() => {
          window.location.href = `/admin/pages/${created.id || created.slug}`;
        }, 800);
      } else {
        const payload = {
          title: formData.title.trim(),
          slug: formData.slug.trim(),
          content: contentToSave,
          metaTitle: formData.metaTitle || formData.title.trim(),
          metaDescription: formData.metaDescription || '',
          metaImage: formData.metaImage || '',
          isPublished: formData.isPublished,
          navLabel: formData.title.trim(),
        };
        await updateAdminPageApi(formData.id, payload);
        showToast('Page updated and synced to database.');
      }
    } catch (err) {
      console.error('Error saving page:', err);
      showToast(err.message || 'Failed to save page.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getStorefrontUrl = () => {
    if (!formData.slug || formData.slug === 'home') return '/';
    return `/${formData.slug}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center space-y-4 max-w-5xl mx-auto shadow-xs">
        <div className="w-10 h-10 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-800">Loading Page Details...</h3>
          <p className="text-xs text-slate-500">Retrieving content and metadata from the database</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">

      {/* Action Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <a
            href="/admin/pages"
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center shrink-0"
            title="Back to Pages List"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </a>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-display font-black text-slate-900 tracking-tight">
                {isNew ? 'Create New Page' : `Edit: ${formData.title || 'Untitled'}`}
              </h1>
              {formData.isSystemPage && (
                <span className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-[10px] font-bold border border-brand-200">
                  Core Page
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span>Front URL:</span>
              <span className="font-mono text-brand-600 font-semibold">{getStorefrontUrl()}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {!isNew && (
            <a
              href={getStorefrontUrl()}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              <span>View Live Front Page</span>
            </a>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            {saving && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
            <span>{isNew ? 'Publish Page' : 'Save & Sync Database'}</span>
          </button>
        </div>
      </div>

      {/* Editor & Setting Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        {isHomePage ? (
          <button
            type="button"
            onClick={() => setActiveTab('homeSections')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'homeSections'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">dashboard_customize</span>
            <span>Home Sections & Layout</span>
          </button>
        ) : isAboutPage ? (
          <button
            type="button"
            onClick={() => setActiveTab('aboutSections')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'aboutSections'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">info</span>
            <span>About Us Sections & Structure</span>
          </button>
        ) : isContactPage ? (
          <button
            type="button"
            onClick={() => setActiveTab('contactSections')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'contactSections'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">contact_support</span>
            <span>Contact Hub & FAQ Structure</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'editor'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">edit_note</span>
            <span>Content & Layout</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('seo')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'seo'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">travel_explore</span>
          <span>SEO & Metadata</span>
        </button>

        {!isStructuredPage && (
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'preview'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">preview</span>
            <span>Visual Preview</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB: HOMEPAGE SECTIONS CONFIGURATOR                                       */}
      {/* ========================================================================= */}
      {isHomePage && activeTab === 'homeSections' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-display font-black text-slate-900">
                  Home Page Title & Primary Info
                </h2>
                <p className="text-xs text-slate-500">
                  Front page rendered at <span className="font-mono font-bold text-brand-600">/</span> (http://localhost:4321)
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">Status:</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    formData.isPublished
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {formData.isPublished ? 'Published' : 'Draft'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Page Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">URL Slug (Fixed for Homepage)</label>
                <input
                  type="text"
                  value="home (Front Page: /)"
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Section 1: Categories Bar Below Search */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Categories Bar Below Search</h3>
                  <p className="text-[11px] text-slate-500">Horizontal scrollable chips below search bar</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={homeSections.categoriesBar?.enabled}
                  onChange={(e) =>
                    setHomeSections({
                      ...homeSections,
                      categoriesBar: { ...homeSections.categoriesBar, enabled: e.target.checked },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
              </label>
            </div>

            {homeSections.categoriesBar?.enabled && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-700">Display Mode:</span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
                    <input
                      type="radio"
                      name="categoriesBarMode"
                      value="all"
                      checked={homeSections.categoriesBar?.mode !== 'custom'}
                      onChange={() =>
                        setHomeSections({
                          ...homeSections,
                          categoriesBar: { ...homeSections.categoriesBar, mode: 'all' },
                        })
                      }
                      className="text-brand-600 focus:ring-brand-500"
                    />
                    <span>Show All Categories (Auto-synced)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
                    <input
                      type="radio"
                      name="categoriesBarMode"
                      value="custom"
                      checked={homeSections.categoriesBar?.mode === 'custom'}
                      onChange={() =>
                        setHomeSections({
                          ...homeSections,
                          categoriesBar: { ...homeSections.categoriesBar, mode: 'custom' },
                        })
                      }
                      className="text-brand-600 focus:ring-brand-500"
                    />
                    <span>Select Specific Categories to Show</span>
                  </label>
                </div>

                {homeSections.categoriesBar?.mode === 'custom' && (
                  <CategoryChecklist
                    categories={availableCategories}
                    selected={homeSections.categoriesBar?.selectedCategoryIds || []}
                    onChange={(newSelected) =>
                      setHomeSections({
                        ...homeSections,
                        categoriesBar: {
                          ...homeSections.categoriesBar,
                          selectedCategoryIds: newSelected,
                        },
                      })
                    }
                  />
                )}
              </div>
            )}
          </div>

          {/* Section 2: Clickable Hero Banner Slider */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Clickable Hero Banner Slider</h3>
                  <p className="text-[11px] text-slate-500">
                    Interactive promotional slides with volume slabs, custom links, and gradient themes
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={homeSections.heroSlider?.enabled}
                  onChange={(e) =>
                    setHomeSections({
                      ...homeSections,
                      heroSlider: { ...homeSections.heroSlider, enabled: e.target.checked },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {homeSections.heroSlider?.enabled && (() => {
              const slides = homeSections.heroSlider?.slides || DEFAULT_HOME_SECTIONS.heroSlider.slides;
              const currentSlide = slides[activeSlideIndex] || slides[0] || {};

              const updateSlideField = (field, val) => {
                const updatedSlides = slides.map((s, idx) => {
                  if (idx === activeSlideIndex) {
                    return { ...s, [field]: val };
                  }
                  return s;
                });
                setHomeSections({
                  ...homeSections,
                  heroSlider: { ...homeSections.heroSlider, slides: updatedSlides },
                });
              };

              const handleAddSlide = () => {
                const newSlide = {
                  id: `slide-${Date.now()}`,
                  badge: 'Special Wholesale Tier',
                  title: 'New Hardware Series Release',
                  subtitle: 'Direct OEM supply with GST Tax Invoice and volume discount tiering.',
                  priceText: 'From ₹499.00',
                  ctaText: 'Explore Hardware',
                  ctaLink: '/shop',
                  image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
                  tagPill: 'Verified OEM • Bulk Ready',
                  theme: 'indigo',
                };
                const updatedSlides = [...slides, newSlide];
                setHomeSections({
                  ...homeSections,
                  heroSlider: { ...homeSections.heroSlider, slides: updatedSlides },
                });
                setActiveSlideIndex(updatedSlides.length - 1);
              };

              const handleRemoveSlide = (idxToRemove) => {
                if (slides.length <= 1) {
                  showToast('You must keep at least 1 slide.', 'error');
                  return;
                }
                const updatedSlides = slides.filter((_, idx) => idx !== idxToRemove);
                setHomeSections({
                  ...homeSections,
                  heroSlider: { ...homeSections.heroSlider, slides: updatedSlides },
                });
                setActiveSlideIndex(Math.max(0, idxToRemove - 1));
              };

              return (
                <div className="space-y-4 pt-1">
                  {/* Slide Tabs Navigation */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {slides.map((slide, idx) => (
                        <button
                          key={slide.id || idx}
                          type="button"
                          onClick={() => setActiveSlideIndex(idx)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            activeSlideIndex === idx
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <span>Slide {idx + 1}</span>
                          {slides.length > 1 && (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveSlide(idx);
                              }}
                              className="w-4 h-4 rounded-full hover:bg-black/20 flex items-center justify-center text-[10px] leading-none"
                              title="Delete Slide"
                            >
                              ✕
                            </span>
                          )}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddSlide}
                        className="px-3 py-1.5 rounded-xl border border-dashed border-indigo-400 text-indigo-700 hover:bg-indigo-50 text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">add</span>
                        <span>Add Slide</span>
                      </button>
                    </div>

                    <span className="text-[11px] font-bold text-slate-400">
                      Editing Slide {activeSlideIndex + 1} of {slides.length}
                    </span>
                  </div>

                  {/* Slide Fields Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Badge Label</label>
                      <input
                        type="text"
                        value={currentSlide.badge || ''}
                        onChange={(e) => updateSlideField('badge', e.target.value)}
                        placeholder="e.g. Enterprise Wholesale Exclusive"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-700">Slide Main Title</label>
                      <input
                        type="text"
                        value={currentSlide.title || ''}
                        onChange={(e) => updateSlideField('title', e.target.value)}
                        placeholder="e.g. Flagship 240Hz Curved OLED Displays"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-3">
                      <label className="text-[11px] font-bold text-slate-700">Subtitle / Description</label>
                      <textarea
                        rows={2}
                        value={currentSlide.subtitle || ''}
                        onChange={(e) => updateSlideField('subtitle', e.target.value)}
                        placeholder="Enter description text..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Tag Pill</label>
                      <input
                        type="text"
                        value={currentSlide.tagPill || ''}
                        onChange={(e) => updateSlideField('tagPill', e.target.value)}
                        placeholder="e.g. 240Hz OLED • 0.03ms GTG"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Price Text / Tier Note</label>
                      <input
                        type="text"
                        value={currentSlide.priceText || ''}
                        onChange={(e) => updateSlideField('priceText', e.target.value)}
                        placeholder="e.g. From ₹1,199.00"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-brand-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Color Theme Gradient</label>
                      <select
                        value={currentSlide.theme || 'indigo'}
                        onChange={(e) => updateSlideField('theme', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      >
                        <option value="indigo">Indigo / Dark Slate</option>
                        <option value="brand">Brand Blue / Deep Navy</option>
                        <option value="cyan">Cyan / Tech Glow</option>
                        <option value="purple">Purple / Royal</option>
                        <option value="emerald">Emerald / Green</option>
                        <option value="rose">Rose / Coral</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Button Text</label>
                      <input
                        type="text"
                        value={currentSlide.ctaText || ''}
                        onChange={(e) => updateSlideField('ctaText', e.target.value)}
                        placeholder="e.g. Explore Displays"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-700">Button Link</label>
                      <input
                        type="text"
                        value={currentSlide.ctaLink || ''}
                        onChange={(e) => updateSlideField('ctaLink', e.target.value)}
                        placeholder="/shop?category=Displays"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800">Background / Product Image</label>
                        {currentSlide.image && (
                          <button
                            type="button"
                            onClick={() =>
                              openMediaLibrary((media) => {
                                const cleanUrl = cleanMediaUrl(media);
                                updateSlideField('image', cleanUrl);
                              })
                            }
                            className="text-xs text-brand-600 hover:text-brand-700 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[15px]">upload</span>
                            <span>Change Image</span>
                          </button>
                        )}
                      </div>

                      {currentSlide.image ? (
                        <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50/70">
                          <div className="relative group w-24 h-16 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xs shrink-0">
                            <img
                              src={resolveMediaDisplayUrl(currentSlide.image)}
                              alt="Slide Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="text-xs font-bold text-slate-800 truncate">{currentSlide.image}</div>
                            <div className="flex items-center gap-3 text-[11px]">
                              <button
                                type="button"
                                onClick={() =>
                                  openMediaLibrary((media) => {
                                    const cleanUrl = cleanMediaUrl(media);
                                    updateSlideField('image', cleanUrl);
                                  })
                                }
                                className="text-brand-600 hover:text-brand-700 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                              >
                                <span className="material-symbols-outlined text-[13px]">swap_horiz</span>
                                <span>Replace</span>
                              </button>
                              <span className="text-slate-300">•</span>
                              <button
                                type="button"
                                onClick={() => updateSlideField('image', '')}
                                className="text-rose-500 hover:text-rose-700 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                              >
                                <span className="material-symbols-outlined text-[13px]">delete</span>
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() =>
                            openMediaLibrary((media) => {
                              const cleanUrl = cleanMediaUrl(media);
                              updateSlideField('image', cleanUrl);
                            })
                          }
                          className="border-2 border-dashed border-slate-200 hover:border-brand-400 hover:bg-brand-50/30 rounded-2xl p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3 bg-slate-50/50 cursor-pointer transition-all group select-none"
                        >
                          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs group-hover:scale-105 group-hover:border-brand-200 transition-all">
                            <span className="material-symbols-outlined text-brand-600 text-2xl">upload</span>
                          </div>
                          <div>
                            <div className="font-bold text-slate-700 text-xs group-hover:text-brand-600 transition-colors">
                              Open Media Library
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Click to upload photos or select from existing media files
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Section 3: Latest Products Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Latest Products Catalog Section</h3>
                  <p className="text-[11px] text-slate-500">Display freshly released hardware models</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={homeSections.latestProducts?.enabled}
                  onChange={(e) =>
                    setHomeSections({
                      ...homeSections,
                      latestProducts: { ...homeSections.latestProducts, enabled: e.target.checked },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {homeSections.latestProducts?.enabled && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Badge Label</label>
                    <input
                      type="text"
                      value={homeSections.latestProducts?.badge || ''}
                      onChange={(e) =>
                        setHomeSections({
                          ...homeSections,
                          latestProducts: { ...homeSections.latestProducts, badge: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Section Title</label>
                    <input
                      type="text"
                      value={homeSections.latestProducts?.title || ''}
                      onChange={(e) =>
                        setHomeSections({
                          ...homeSections,
                          latestProducts: { ...homeSections.latestProducts, title: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-700">Subheading / Description</label>
                    <input
                      type="text"
                      value={homeSections.latestProducts?.subtitle || ''}
                      onChange={(e) =>
                        setHomeSections({
                          ...homeSections,
                          latestProducts: { ...homeSections.latestProducts, subtitle: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Selection Mode Controls */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-700">Selection Source:</span>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
                      <input
                        type="radio"
                        name="latestProductsMode"
                        value="automatic"
                        checked={homeSections.latestProducts?.mode === 'automatic' || !homeSections.latestProducts?.mode}
                        onChange={() =>
                          setHomeSections({
                            ...homeSections,
                            latestProducts: { ...homeSections.latestProducts, mode: 'automatic' },
                          })
                        }
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>All Latest (Auto-Newest)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
                      <input
                        type="radio"
                        name="latestProductsMode"
                        value="category"
                        checked={homeSections.latestProducts?.mode === 'category'}
                        onChange={() =>
                          setHomeSections({
                            ...homeSections,
                            latestProducts: { ...homeSections.latestProducts, mode: 'category' },
                          })
                        }
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Filter by Specific Category</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
                      <input
                        type="radio"
                        name="latestProductsMode"
                        value="manual"
                        checked={homeSections.latestProducts?.mode === 'manual'}
                        onChange={() =>
                          setHomeSections({
                            ...homeSections,
                            latestProducts: { ...homeSections.latestProducts, mode: 'manual' },
                          })
                        }
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Select Specific Products</span>
                    </label>
                  </div>

                  {homeSections.latestProducts?.mode === 'category' && (
                    <CategoryChecklist
                      categories={availableCategories}
                      selected={homeSections.latestProducts?.selectedCategoryIds || []}
                      onChange={(newSelected) =>
                        setHomeSections({
                          ...homeSections,
                          latestProducts: {
                            ...homeSections.latestProducts,
                            selectedCategoryIds: newSelected,
                          },
                        })
                      }
                    />
                  )}

                  {homeSections.latestProducts?.mode === 'manual' && (
                    <ProductPicker
                      products={availableProducts}
                      selected={homeSections.latestProducts?.selectedProductIds || []}
                      onChange={(newSelected) =>
                        setHomeSections({
                          ...homeSections,
                          latestProducts: {
                            ...homeSections.latestProducts,
                            selectedProductIds: newSelected,
                          },
                        })
                      }
                      limit={homeSections.latestProducts?.limit || 4}
                      onLimitChange={(lim) =>
                        setHomeSections({
                          ...homeSections,
                          latestProducts: { ...homeSections.latestProducts, limit: lim },
                        })
                      }
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Featured Products Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Featured Products Section</h3>
                  <p className="text-[11px] text-slate-500">Staff curated high-demand B2B catalog hardware</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={homeSections.featuredProducts?.enabled}
                  onChange={(e) =>
                    setHomeSections({
                      ...homeSections,
                      featuredProducts: { ...homeSections.featuredProducts, enabled: e.target.checked },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
              </label>
            </div>

            {homeSections.featuredProducts?.enabled && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Badge Label</label>
                    <input
                      type="text"
                      value={homeSections.featuredProducts?.badge || ''}
                      onChange={(e) =>
                        setHomeSections({
                          ...homeSections,
                          featuredProducts: { ...homeSections.featuredProducts, badge: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Section Title</label>
                    <input
                      type="text"
                      value={homeSections.featuredProducts?.title || ''}
                      onChange={(e) =>
                        setHomeSections({
                          ...homeSections,
                          featuredProducts: { ...homeSections.featuredProducts, title: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-700">Subheading / Description</label>
                    <input
                      type="text"
                      value={homeSections.featuredProducts?.subtitle || ''}
                      onChange={(e) =>
                        setHomeSections({
                          ...homeSections,
                          featuredProducts: { ...homeSections.featuredProducts, subtitle: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Selection Mode Controls */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-700">Selection Source:</span>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
                      <input
                        type="radio"
                        name="featuredProductsMode"
                        value="automatic"
                        checked={homeSections.featuredProducts?.mode === 'automatic' || !homeSections.featuredProducts?.mode}
                        onChange={() =>
                          setHomeSections({
                            ...homeSections,
                            featuredProducts: { ...homeSections.featuredProducts, mode: 'automatic' },
                          })
                        }
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      <span>All Featured (Curated Flag)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
                      <input
                        type="radio"
                        name="featuredProductsMode"
                        value="category"
                        checked={homeSections.featuredProducts?.mode === 'category'}
                        onChange={() =>
                          setHomeSections({
                            ...homeSections,
                            featuredProducts: { ...homeSections.featuredProducts, mode: 'category' },
                          })
                        }
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      <span>Filter by Specific Category</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800">
                      <input
                        type="radio"
                        name="featuredProductsMode"
                        value="manual"
                        checked={homeSections.featuredProducts?.mode === 'manual'}
                        onChange={() =>
                          setHomeSections({
                            ...homeSections,
                            featuredProducts: { ...homeSections.featuredProducts, mode: 'manual' },
                          })
                        }
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      <span>Select Specific Products</span>
                    </label>
                  </div>

                  {homeSections.featuredProducts?.mode === 'category' && (
                    <CategoryChecklist
                      categories={availableCategories}
                      selected={homeSections.featuredProducts?.selectedCategoryIds || []}
                      onChange={(newSelected) =>
                        setHomeSections({
                          ...homeSections,
                          featuredProducts: {
                            ...homeSections.featuredProducts,
                            selectedCategoryIds: newSelected,
                          },
                        })
                      }
                    />
                  )}

                  {homeSections.featuredProducts?.mode === 'manual' && (
                    <ProductPicker
                      products={availableProducts}
                      selected={homeSections.featuredProducts?.selectedProductIds || []}
                      onChange={(newSelected) =>
                        setHomeSections({
                          ...homeSections,
                          featuredProducts: {
                            ...homeSections.featuredProducts,
                            selectedProductIds: newSelected,
                          },
                        })
                      }
                      limit={homeSections.featuredProducts?.limit || 4}
                      onLimitChange={(lim) =>
                        setHomeSections({
                          ...homeSections,
                          featuredProducts: { ...homeSections.featuredProducts, limit: lim },
                        })
                      }
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 5: 2 Small Clickable Banners */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                  5
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">2 Small Clickable Promotional Banners</h3>
                  <p className="text-[11px] text-slate-500">Volume slab programs and logistics SLA banners</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={homeSections.smallBanners?.enabled}
                  onChange={(e) =>
                    setHomeSections({
                      ...homeSections,
                      smallBanners: { ...homeSections.smallBanners, enabled: e.target.checked },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              {/* Banner 1 Config */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Small Banner 1</div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={homeSections.smallBanners?.banner1?.tag || ''}
                    onChange={(e) =>
                      setHomeSections({
                        ...homeSections,
                        smallBanners: {
                          ...homeSections.smallBanners,
                          banner1: { ...homeSections.smallBanners.banner1, tag: e.target.value },
                        },
                      })
                    }
                    placeholder="Badge Tag"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={homeSections.smallBanners?.banner1?.title || ''}
                    onChange={(e) =>
                      setHomeSections({
                        ...homeSections,
                        smallBanners: {
                          ...homeSections.smallBanners,
                          banner1: { ...homeSections.smallBanners.banner1, title: e.target.value },
                        },
                      })
                    }
                    placeholder="Banner Title"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                  />
                  <textarea
                    rows={2}
                    value={homeSections.smallBanners?.banner1?.description || ''}
                    onChange={(e) =>
                      setHomeSections({
                        ...homeSections,
                        smallBanners: {
                          ...homeSections.smallBanners,
                          banner1: { ...homeSections.smallBanners.banner1, description: e.target.value },
                        },
                      })
                    }
                    placeholder="Description text"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={homeSections.smallBanners?.banner1?.buttonText || ''}
                      onChange={(e) =>
                        setHomeSections({
                          ...homeSections,
                          smallBanners: {
                            ...homeSections.smallBanners,
                            banner1: { ...homeSections.smallBanners.banner1, buttonText: e.target.value },
                          },
                        })
                      }
                      placeholder="Button Text"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      value={homeSections.smallBanners?.banner1?.link || ''}
                      onChange={(e) =>
                        setHomeSections({
                          ...homeSections,
                          smallBanners: {
                            ...homeSections.smallBanners,
                            banner1: { ...homeSections.smallBanners.banner1, link: e.target.value },
                          },
                        })
                      }
                      placeholder="Destination Link"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold text-slate-700">Banner Background / Image</span>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={homeSections.smallBanners?.banner1?.image || ''}
                          onChange={(e) =>
                            setHomeSections({
                              ...homeSections,
                              smallBanners: {
                                ...homeSections.smallBanners,
                                banner1: { ...homeSections.smallBanners.banner1, image: e.target.value },
                              },
                            })
                          }
                          placeholder="/uploads/... or image URL"
                          className="w-full pl-2.5 pr-20 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-indigo-500/20"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            openMediaLibrary((media) => {
                              const cleanUrl = cleanMediaUrl(media);
                              setHomeSections({
                                ...homeSections,
                                smallBanners: {
                                  ...homeSections.smallBanners,
                                  banner1: { ...homeSections.smallBanners.banner1, image: cleanUrl },
                                },
                              });
                            })
                          }
                          className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold transition-all flex items-center gap-0.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[12px]">photo_library</span>
                          <span>Insert</span>
                        </button>
                      </div>
                      {homeSections.smallBanners?.banner1?.image && (
                        <img
                          src={resolveMediaDisplayUrl(homeSections.smallBanners?.banner1?.image)}
                          alt="Banner 1 preview"
                          className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Banner 2 Config */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-brand-700 uppercase tracking-wider">Small Banner 2</div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={homeSections.smallBanners?.banner2?.tag || ''}
                    onChange={(e) =>
                      setHomeSections({
                        ...homeSections,
                        smallBanners: {
                          ...homeSections.smallBanners,
                          banner2: { ...homeSections.smallBanners.banner2, tag: e.target.value },
                        },
                      })
                    }
                    placeholder="Badge Tag"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={homeSections.smallBanners?.banner2?.title || ''}
                    onChange={(e) =>
                      setHomeSections({
                        ...homeSections,
                        smallBanners: {
                          ...homeSections.smallBanners,
                          banner2: { ...homeSections.smallBanners.banner2, title: e.target.value },
                        },
                      })
                    }
                    placeholder="Banner Title"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                  />
                  <textarea
                    rows={2}
                    value={homeSections.smallBanners?.banner2?.description || ''}
                    onChange={(e) =>
                      setHomeSections({
                        ...homeSections,
                        smallBanners: {
                          ...homeSections.smallBanners,
                          banner2: { ...homeSections.smallBanners.banner2, description: e.target.value },
                        },
                      })
                    }
                    placeholder="Description text"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={homeSections.smallBanners?.banner2?.buttonText || ''}
                      onChange={(e) =>
                        setHomeSections({
                          ...homeSections,
                          smallBanners: {
                            ...homeSections.smallBanners,
                            banner2: { ...homeSections.smallBanners.banner2, buttonText: e.target.value },
                          },
                        })
                      }
                      placeholder="Button Text"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      value={homeSections.smallBanners?.banner2?.link || ''}
                      onChange={(e) =>
                        setHomeSections({
                          ...homeSections,
                          smallBanners: {
                            ...homeSections.smallBanners,
                            banner2: { ...homeSections.smallBanners.banner2, link: e.target.value },
                          },
                        })
                      }
                      placeholder="Destination Link"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold text-slate-700">Banner Background / Image</span>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={homeSections.smallBanners?.banner2?.image || ''}
                          onChange={(e) =>
                            setHomeSections({
                              ...homeSections,
                              smallBanners: {
                                ...homeSections.smallBanners,
                                banner2: { ...homeSections.smallBanners.banner2, image: e.target.value },
                              },
                            })
                          }
                          placeholder="/uploads/... or image URL"
                          className="w-full pl-2.5 pr-20 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-indigo-500/20"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            openMediaLibrary((media) => {
                              const cleanUrl = cleanMediaUrl(media);
                              setHomeSections({
                                ...homeSections,
                                smallBanners: {
                                  ...homeSections.smallBanners,
                                  banner2: { ...homeSections.smallBanners.banner2, image: cleanUrl },
                                },
                              });
                            })
                          }
                          className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold transition-all flex items-center gap-0.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[12px]">photo_library</span>
                          <span>Insert</span>
                        </button>
                      </div>
                      {homeSections.smallBanners?.banner2?.image && (
                        <img
                          src={resolveMediaDisplayUrl(homeSections.smallBanners?.banner2?.image)}
                          alt="Banner 2 preview"
                          className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Top Selling Wholesale Hardware */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                  6
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Top Selling Wholesale Hardware</h3>
                  <p className="text-[11px] text-slate-500">
                    Highest sales volume hardware chosen by certified enterprise buyers
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={homeSections.topSellingProducts?.enabled}
                  onChange={(e) =>
                    setHomeSections({
                      ...homeSections,
                      topSellingProducts: { ...homeSections.topSellingProducts, enabled: e.target.checked },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            {homeSections.topSellingProducts?.enabled && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Badge Label</label>
                    <input
                      type="text"
                      value={homeSections.topSellingProducts?.badge || ''}
                      onChange={(e) =>
                        setHomeSections({
                          ...homeSections,
                          topSellingProducts: { ...homeSections.topSellingProducts, badge: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Section Title</label>
                    <input
                      type="text"
                      value={homeSections.topSellingProducts?.title || ''}
                      onChange={(e) =>
                        setHomeSections({
                          ...homeSections,
                          topSellingProducts: { ...homeSections.topSellingProducts, title: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-700">Subheading / Description</label>
                    <input
                      type="text"
                      value={homeSections.topSellingProducts?.subtitle || ''}
                      onChange={(e) =>
                        setHomeSections({
                          ...homeSections,
                          topSellingProducts: { ...homeSections.topSellingProducts, subtitle: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Automation vs Manual Selection Mode */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/60 p-3 rounded-2xl border border-amber-200">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-amber-900">Selection Mode:</span>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-950">
                        <input
                          type="radio"
                          name="topSellingMode"
                          value="automatic"
                          checked={homeSections.topSellingProducts?.mode !== 'manual'}
                          onChange={() =>
                            setHomeSections({
                              ...homeSections,
                              topSellingProducts: { ...homeSections.topSellingProducts, mode: 'automatic' },
                            })
                          }
                          className="text-amber-600 focus:ring-amber-500"
                        />
                        <span>⚡ Automatic (According to Sales & Order Volumes)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-950">
                        <input
                          type="radio"
                          name="topSellingMode"
                          value="manual"
                          checked={homeSections.topSellingProducts?.mode === 'manual'}
                          onChange={() =>
                            setHomeSections({
                              ...homeSections,
                              topSellingProducts: { ...homeSections.topSellingProducts, mode: 'manual' },
                            })
                          }
                          className="text-amber-600 focus:ring-amber-500"
                        />
                        <span>🎯 Manual (Admin Selected Products)</span>
                      </label>
                    </div>

                    <span className="text-[11px] text-amber-800 italic">
                      {homeSections.topSellingProducts?.mode === 'manual'
                        ? 'Curate exact products below'
                        : 'Auto-ranked by actual orders & highest buyer rating (>=4.8)'}
                    </span>
                  </div>

                  {homeSections.topSellingProducts?.mode === 'manual' && (
                    <ProductPicker
                      products={availableProducts}
                      selected={homeSections.topSellingProducts?.selectedProductIds || []}
                      onChange={(newSelected) =>
                        setHomeSections({
                          ...homeSections,
                          topSellingProducts: {
                            ...homeSections.topSellingProducts,
                            selectedProductIds: newSelected,
                          },
                        })
                      }
                      limit={homeSections.topSellingProducts?.limit || 4}
                      onLimitChange={(lim) =>
                        setHomeSections({
                          ...homeSections,
                          topSellingProducts: { ...homeSections.topSellingProducts, limit: lim },
                        })
                      }
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 7: Trending Gear & Pro Equipment */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
                  7
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Trending Gear & Pro Equipment</h3>
                  <p className="text-[11px] text-slate-500">
                    High velocity trending peripherals, spatial audio, and esports gear
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={homeSections.trendingProducts?.enabled}
                  onChange={(e) =>
                    setHomeSections({
                      ...homeSections,
                      trendingProducts: { ...homeSections.trendingProducts, enabled: e.target.checked },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            {homeSections.trendingProducts?.enabled && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Badge Label</label>
                    <input
                      type="text"
                      value={homeSections.trendingProducts?.badge || ''}
                      onChange={(e) =>
                        setHomeSections({
                          ...homeSections,
                          trendingProducts: { ...homeSections.trendingProducts, badge: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Section Title</label>
                    <input
                      type="text"
                      value={homeSections.trendingProducts?.title || ''}
                      onChange={(e) =>
                        setHomeSections({
                          ...homeSections,
                          trendingProducts: { ...homeSections.trendingProducts, title: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-700">Subheading / Description</label>
                    <input
                      type="text"
                      value={homeSections.trendingProducts?.subtitle || ''}
                      onChange={(e) =>
                        setHomeSections({
                          ...homeSections,
                          trendingProducts: { ...homeSections.trendingProducts, subtitle: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Automation vs Manual Selection Mode */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-rose-50/60 p-3 rounded-2xl border border-rose-200">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-rose-900">Selection Mode:</span>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-rose-950">
                        <input
                          type="radio"
                          name="trendingProductsMode"
                          value="automatic"
                          checked={homeSections.trendingProducts?.mode !== 'manual'}
                          onChange={() =>
                            setHomeSections({
                              ...homeSections,
                              trendingProducts: { ...homeSections.trendingProducts, mode: 'automatic' },
                            })
                          }
                          className="text-rose-600 focus:ring-rose-500"
                        />
                        <span>🔥 Automatic (According to Search Velocity & Trending Signals)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-rose-950">
                        <input
                          type="radio"
                          name="trendingProductsMode"
                          value="manual"
                          checked={homeSections.trendingProducts?.mode === 'manual'}
                          onChange={() =>
                            setHomeSections({
                              ...homeSections,
                              trendingProducts: { ...homeSections.trendingProducts, mode: 'manual' },
                            })
                          }
                          className="text-rose-600 focus:ring-rose-500"
                        />
                        <span>🎯 Manual (Admin Selected Products)</span>
                      </label>
                    </div>

                    <span className="text-[11px] text-rose-800 italic">
                      {homeSections.trendingProducts?.mode === 'manual'
                        ? 'Curate exact products below'
                        : 'Auto-ranked by search query frequency & hot item demand'}
                    </span>
                  </div>

                  {homeSections.trendingProducts?.mode === 'manual' && (
                    <ProductPicker
                      products={availableProducts}
                      selected={homeSections.trendingProducts?.selectedProductIds || []}
                      onChange={(newSelected) =>
                        setHomeSections({
                          ...homeSections,
                          trendingProducts: {
                            ...homeSections.trendingProducts,
                            selectedProductIds: newSelected,
                          },
                        })
                      }
                      limit={homeSections.trendingProducts?.limit || 4}
                      onLimitChange={(lim) =>
                        setHomeSections({
                          ...homeSections,
                          trendingProducts: { ...homeSections.trendingProducts, limit: lim },
                        })
                      }
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 8: Value Propositions & Trust Bar */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  8
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Free Shipping & Support Trust Bar</h3>
                  <p className="text-[11px] text-slate-500">4 trust guarantees displayed on the homepage</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={homeSections.trustBar?.enabled}
                  onChange={(e) =>
                    setHomeSections({
                      ...homeSections,
                      trustBar: { ...homeSections.trustBar, enabled: e.target.checked },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((num) => {
                const key = `item${num}`;
                const item = homeSections.trustBar?.[key] || {};
                return (
                  <div key={key} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Trust Guarantee {num}</span>
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) =>
                        setHomeSections({
                          ...homeSections,
                          trustBar: {
                            ...homeSections.trustBar,
                            [key]: { ...item, title: e.target.value },
                          },
                        })
                      }
                      placeholder="Title"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                    />
                    <textarea
                      rows={2}
                      value={item.desc || ''}
                      onChange={(e) =>
                        setHomeSections({
                          ...homeSections,
                          trustBar: {
                            ...homeSections.trustBar,
                            [key]: { ...item, desc: e.target.value },
                          },
                        })
                      }
                      placeholder="Description"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px]"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: ABOUT US PAGE SECTIONS CONFIGURATOR                                  */}
      {/* ========================================================================= */}
      {isAboutPage && activeTab === 'aboutSections' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-display font-black text-slate-900">
                  About Us Page Settings
                </h2>
                <p className="text-xs text-slate-500">
                  Storefront URL: <span className="font-mono font-bold text-brand-600">/about</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">Status:</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    formData.isPublished
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {formData.isPublished ? 'Published' : 'Draft'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Page Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">URL Slug</label>
                <input
                  type="text"
                  value="about (/about)"
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* 1. Hero Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Hero Banner Section</h3>
                  <p className="text-[11px] text-slate-500">Main value proposition headline and registration buttons</p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={aboutSections.hero?.enabled !== false}
                  onChange={(e) =>
                    setAboutSections({
                      ...aboutSections,
                      hero: { ...aboutSections.hero, enabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700">Enable Section</span>
              </label>
            </div>

            {aboutSections.hero?.enabled !== false && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Badge Pill Text</label>
                    <input
                      type="text"
                      value={aboutSections.hero?.badge || ''}
                      onChange={(e) =>
                        setAboutSections({
                          ...aboutSections,
                          hero: { ...aboutSections.hero, badge: e.target.value },
                        })
                      }
                      placeholder="e.g. Enterprise B2B Hardware Infrastructure"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Background Gradient Style</label>
                    <select
                      value={aboutSections.hero?.bgGradient || 'from-slate-900 via-brand-950 to-slate-900'}
                      onChange={(e) =>
                        setAboutSections({
                          ...aboutSections,
                          hero: { ...aboutSections.hero, bgGradient: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="from-slate-900 via-brand-950 to-slate-900">Dark Slate & Brand (Standard)</option>
                      <option value="from-slate-950 via-indigo-950 to-slate-900">Royal Indigo & Slate</option>
                      <option value="from-slate-900 via-emerald-950 to-slate-900">Deep Emerald & Slate</option>
                      <option value="from-brand-950 via-purple-950 to-slate-900">Cosmic Cyber & Purple</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Hero Main Title (Supports newlines)</label>
                  <textarea
                    rows={2}
                    value={aboutSections.hero?.title || ''}
                    onChange={(e) =>
                      setAboutSections({
                        ...aboutSections,
                        hero: { ...aboutSections.hero, title: e.target.value },
                      })
                    }
                    placeholder="Powering Next-Gen&#10;Wholesale Tech Commerce"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Hero Subtitle / Description</label>
                  <textarea
                    rows={3}
                    value={aboutSections.hero?.subtitle || ''}
                    onChange={(e) =>
                      setAboutSections({
                        ...aboutSections,
                        hero: { ...aboutSections.hero, subtitle: e.target.value },
                      })
                    }
                    placeholder="Brief explanation of the company's B2B ecosystem mission..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Primary CTA Button</span>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-slate-600">Button Label</label>
                      <input
                        type="text"
                        value={aboutSections.hero?.primaryCtaText || ''}
                        onChange={(e) =>
                          setAboutSections({
                            ...aboutSections,
                            hero: { ...aboutSections.hero, primaryCtaText: e.target.value },
                          })
                        }
                        placeholder="Explore Hardware Catalog"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-slate-600">Button Destination URL</label>
                      <input
                        type="text"
                        value={aboutSections.hero?.primaryCtaLink || ''}
                        onChange={(e) =>
                          setAboutSections({
                            ...aboutSections,
                            hero: { ...aboutSections.hero, primaryCtaLink: e.target.value },
                          })
                        }
                        placeholder="/shop"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Secondary CTA Button</span>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-slate-600">Button Label</label>
                      <input
                        type="text"
                        value={aboutSections.hero?.secondaryCtaText || ''}
                        onChange={(e) =>
                          setAboutSections({
                            ...aboutSections,
                            hero: { ...aboutSections.hero, secondaryCtaText: e.target.value },
                          })
                        }
                        placeholder="Register B2B Account"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-slate-600">Button Destination URL</label>
                      <input
                        type="text"
                        value={aboutSections.hero?.secondaryCtaLink || ''}
                        onChange={(e) =>
                          setAboutSections({
                            ...aboutSections,
                            hero: { ...aboutSections.hero, secondaryCtaLink: e.target.value },
                          })
                        }
                        placeholder="/login"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Key Highlights / Metrics */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Key Numerical Highlights (4 Stat Cards)</h3>
                  <p className="text-[11px] text-slate-500">Impressive business statistics to establish credibility</p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={aboutSections.metrics?.enabled !== false}
                  onChange={(e) =>
                    setAboutSections({
                      ...aboutSections,
                      metrics: { ...aboutSections.metrics, enabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700">Enable Section</span>
              </label>
            </div>

            {aboutSections.metrics?.enabled !== false && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {['metric1', 'metric2', 'metric3', 'metric4'].map((mKey, idx) => {
                  const m = aboutSections.metrics?.[mKey] || {};
                  return (
                    <div key={mKey} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Stat Card #{idx + 1}
                      </span>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Metric Value</label>
                        <input
                          type="text"
                          value={m.value || ''}
                          onChange={(e) =>
                            setAboutSections({
                              ...aboutSections,
                              metrics: {
                                ...aboutSections.metrics,
                                [mKey]: { ...m, value: e.target.value },
                              },
                            })
                          }
                          placeholder="e.g. 10,000+"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Label Title</label>
                        <input
                          type="text"
                          value={m.label || ''}
                          onChange={(e) =>
                            setAboutSections({
                              ...aboutSections,
                              metrics: {
                                ...aboutSections.metrics,
                                [mKey]: { ...m, label: e.target.value },
                              },
                            })
                          }
                          placeholder="e.g. Verified Buyers"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Subtext</label>
                        <input
                          type="text"
                          value={m.subtext || ''}
                          onChange={(e) =>
                            setAboutSections({
                              ...aboutSections,
                              metrics: {
                                ...aboutSections.metrics,
                                [mKey]: { ...m, subtext: e.target.value },
                              },
                            })
                          }
                          placeholder="e.g. Across 28 States"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Core Pillars */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Core Operational Pillars (3 Feature Cards)</h3>
                  <p className="text-[11px] text-slate-500">Key differentiators why wholesale buyers choose TradeLogix</p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={aboutSections.pillars?.enabled !== false}
                  onChange={(e) =>
                    setAboutSections({
                      ...aboutSections,
                      pillars: { ...aboutSections.pillars, enabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700">Enable Section</span>
              </label>
            </div>

            {aboutSections.pillars?.enabled !== false && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Section Badge</label>
                    <input
                      type="text"
                      value={aboutSections.pillars?.badge || ''}
                      onChange={(e) =>
                        setAboutSections({
                          ...aboutSections,
                          pillars: { ...aboutSections.pillars, badge: e.target.value },
                        })
                      }
                      placeholder="Our Operational Framework"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Section Title</label>
                    <input
                      type="text"
                      value={aboutSections.pillars?.title || ''}
                      onChange={(e) =>
                        setAboutSections({
                          ...aboutSections,
                          pillars: { ...aboutSections.pillars, title: e.target.value },
                        })
                      }
                      placeholder="Engineered Specifically for Wholesale Buyers"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {['pillar1', 'pillar2', 'pillar3'].map((pKey, idx) => {
                    const p = aboutSections.pillars?.[pKey] || {};
                    return (
                      <div key={pKey} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Pillar #{idx + 1}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600">Material Symbol Icon</label>
                          <input
                            type="text"
                            value={p.icon || ''}
                            onChange={(e) =>
                              setAboutSections({
                                ...aboutSections,
                                pillars: {
                                  ...aboutSections.pillars,
                                  [pKey]: { ...p, icon: e.target.value },
                                },
                              })
                            }
                            placeholder="verified / warehouse / receipt_long"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600">Pillar Title</label>
                          <input
                            type="text"
                            value={p.title || ''}
                            onChange={(e) =>
                              setAboutSections({
                                ...aboutSections,
                                pillars: {
                                  ...aboutSections.pillars,
                                  [pKey]: { ...p, title: e.target.value },
                                },
                              })
                            }
                            placeholder="Pillar headline..."
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600">Pillar Description</label>
                          <textarea
                            rows={4}
                            value={p.description || ''}
                            onChange={(e) =>
                              setAboutSections({
                                ...aboutSections,
                                pillars: {
                                  ...aboutSections.pillars,
                                  [pKey]: { ...p, description: e.target.value },
                                },
                              })
                            }
                            placeholder="Describe how this feature operates..."
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs leading-relaxed"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 4. Corporate Accreditation & Legal ID */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                  4
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Corporate Identification & Accreditation Banner</h3>
                  <p className="text-[11px] text-slate-500">Legal entity details, GSTIN, PAN, CIN, and Registered Address</p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={aboutSections.accreditation?.enabled !== false}
                  onChange={(e) =>
                    setAboutSections({
                      ...aboutSections,
                      accreditation: { ...aboutSections.accreditation, enabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700">Enable Section</span>
              </label>
            </div>

            {aboutSections.accreditation?.enabled !== false && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Section Header Label</label>
                    <input
                      type="text"
                      value={aboutSections.accreditation?.title || ''}
                      onChange={(e) =>
                        setAboutSections({
                          ...aboutSections,
                          accreditation: { ...aboutSections.accreditation, title: e.target.value },
                        })
                      }
                      placeholder="Corporate Identification"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Compliance Subtitle</label>
                    <input
                      type="text"
                      value={aboutSections.accreditation?.subtitle || ''}
                      onChange={(e) =>
                        setAboutSections({
                          ...aboutSections,
                          accreditation: { ...aboutSections.accreditation, subtitle: e.target.value },
                        })
                      }
                      placeholder="Operating under the Ministry of Corporate Affairs..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-900 flex items-start gap-3">
                  <span className="material-symbols-outlined text-indigo-600 text-[20px] shrink-0 mt-0.5">info</span>
                  <div className="space-y-1">
                    <p className="font-bold">Automated Central Corporate Details</p>
                    <p className="text-[11px] text-indigo-800 leading-relaxed">
                      Company Legal Name, GSTIN, PAN, CIN, Registered Dock Office Address, and Fulfillment Node are synchronized live from your central settings. You can edit them anytime under{' '}
                      <a href="/admin/settings" className="font-bold underline hover:text-indigo-950">
                        Admin Settings &gt; Corporate Info
                      </a>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. Bottom CTA Banner */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                  5
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Bottom Call-to-Action (CTA) Banner</h3>
                  <p className="text-[11px] text-slate-500">Footer banner inviting visitors to register or contact sales</p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={aboutSections.ctaBanner?.enabled !== false}
                  onChange={(e) =>
                    setAboutSections({
                      ...aboutSections,
                      ctaBanner: { ...aboutSections.ctaBanner, enabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700">Enable Section</span>
              </label>
            </div>

            {aboutSections.ctaBanner?.enabled !== false && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">CTA Headline</label>
                    <input
                      type="text"
                      value={aboutSections.ctaBanner?.title || ''}
                      onChange={(e) =>
                        setAboutSections({
                          ...aboutSections,
                          ctaBanner: { ...aboutSections.ctaBanner, title: e.target.value },
                        })
                      }
                      placeholder="Ready to scale your wholesale inventory?"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">CTA Subtitle</label>
                    <input
                      type="text"
                      value={aboutSections.ctaBanner?.subtitle || ''}
                      onChange={(e) =>
                        setAboutSections({
                          ...aboutSections,
                          ctaBanner: { ...aboutSections.ctaBanner, subtitle: e.target.value },
                        })
                      }
                      placeholder="Get instant access to wholesale tier pricing..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Primary Action Button</span>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-slate-600">Button Label</label>
                      <input
                        type="text"
                        value={aboutSections.ctaBanner?.primaryBtnText || ''}
                        onChange={(e) =>
                          setAboutSections({
                            ...aboutSections,
                            ctaBanner: { ...aboutSections.ctaBanner, primaryBtnText: e.target.value },
                          })
                        }
                        placeholder="Apply for B2B Account"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-slate-600">Destination URL</label>
                      <input
                        type="text"
                        value={aboutSections.ctaBanner?.primaryBtnLink || ''}
                        onChange={(e) =>
                          setAboutSections({
                            ...aboutSections,
                            ctaBanner: { ...aboutSections.ctaBanner, primaryBtnLink: e.target.value },
                          })
                        }
                        placeholder="/login"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Secondary Action Button</span>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-slate-600">Button Label</label>
                      <input
                        type="text"
                        value={aboutSections.ctaBanner?.secondaryBtnText || ''}
                        onChange={(e) =>
                          setAboutSections({
                            ...aboutSections,
                            ctaBanner: { ...aboutSections.ctaBanner, secondaryBtnText: e.target.value },
                          })
                        }
                        placeholder="Contact Sales Desk"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-slate-600">Destination URL</label>
                      <input
                        type="text"
                        value={aboutSections.ctaBanner?.secondaryBtnLink || ''}
                        onChange={(e) =>
                          setAboutSections({
                            ...aboutSections,
                            ctaBanner: { ...aboutSections.ctaBanner, secondaryBtnLink: e.target.value },
                          })
                        }
                        placeholder="/contact"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: CONTACT US PAGE SECTIONS CONFIGURATOR                                */}
      {/* ========================================================================= */}
      {isContactPage && activeTab === 'contactSections' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-display font-black text-slate-900">
                  Contact Us & Support Hub Settings
                </h2>
                <p className="text-xs text-slate-500">
                  Storefront URL: <span className="font-mono font-bold text-brand-600">/contact</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">Status:</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    formData.isPublished
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {formData.isPublished ? 'Published' : 'Draft'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Page Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">URL Slug</label>
                <input
                  type="text"
                  value="contact (/contact)"
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* 1. Header Banner */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Header Banner Section</h3>
                  <p className="text-[11px] text-slate-500">Top heading and introductory context</p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={contactSections.header?.enabled !== false}
                  onChange={(e) =>
                    setContactSections({
                      ...contactSections,
                      header: { ...contactSections.header, enabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700">Enable Section</span>
              </label>
            </div>

            {contactSections.header?.enabled !== false && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Badge Text</label>
                    <input
                      type="text"
                      value={contactSections.header?.badge || ''}
                      onChange={(e) =>
                        setContactSections({
                          ...contactSections,
                          header: { ...contactSections.header, badge: e.target.value },
                        })
                      }
                      placeholder="e.g. Direct B2B Communication Channels"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Page Headline</label>
                    <input
                      type="text"
                      value={contactSections.header?.title || ''}
                      onChange={(e) =>
                        setContactSections({
                          ...contactSections,
                          header: { ...contactSections.header, title: e.target.value },
                        })
                      }
                      placeholder="Connect With TradeLogix Wholesale"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Subtitle Description</label>
                  <textarea
                    rows={2}
                    value={contactSections.header?.subtitle || ''}
                    onChange={(e) =>
                      setContactSections({
                        ...contactSections,
                        header: { ...contactSections.header, subtitle: e.target.value },
                      })
                    }
                    placeholder="Direct lines to our Wholesale Procurement Specialists, Dealer Onboarding Desk..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Department Cards Configurator */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Department Communication Channels (4 Hubs)</h3>
                  <p className="text-[11px] text-slate-500">Dedicated emails, phone extensions, SLAs, and WhatsApp links</p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={contactSections.departments?.enabled !== false}
                  onChange={(e) =>
                    setContactSections({
                      ...contactSections,
                      departments: { ...contactSections.departments, enabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700">Enable Section</span>
              </label>
            </div>

            {contactSections.departments?.enabled !== false && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'sales', defaultTitle: 'Wholesale Sales & Procurement Desk', badge: 'Sales' },
                  { key: 'onboarding', defaultTitle: 'Dealer & Channel Onboarding', badge: 'Onboarding' },
                  { key: 'accounts', defaultTitle: 'GST Billing & Credit Accounts', badge: 'Accounts' },
                  { key: 'logistics', defaultTitle: 'Fulfillment & Cargo Tracking', badge: 'Logistics' },
                ].map(({ key, defaultTitle, badge }) => {
                  const dept = contactSections.departments?.[key] || {};
                  return (
                    <div key={key} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800 text-[10px] font-bold uppercase tracking-wider">
                          {badge} Department
                        </span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Department Title</label>
                        <input
                          type="text"
                          value={dept.title || ''}
                          onChange={(e) =>
                            setContactSections({
                              ...contactSections,
                              departments: {
                                ...contactSections.departments,
                                [key]: { ...dept, title: e.target.value },
                              },
                            })
                          }
                          placeholder={defaultTitle}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Description</label>
                        <input
                          type="text"
                          value={dept.desc || ''}
                          onChange={(e) =>
                            setContactSections({
                              ...contactSections,
                              departments: {
                                ...contactSections.departments,
                                [key]: { ...dept, desc: e.target.value },
                              },
                            })
                          }
                          placeholder="Purpose of this channel..."
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600">Email Address</label>
                          <input
                            type="email"
                            value={dept.email || ''}
                            onChange={(e) =>
                              setContactSections({
                                ...contactSections,
                                departments: {
                                  ...contactSections.departments,
                                  [key]: { ...dept, email: e.target.value },
                                },
                              })
                            }
                            placeholder="sales@tradelogix.in"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600">Phone Extension</label>
                          <input
                            type="text"
                            value={dept.phone || ''}
                            onChange={(e) =>
                              setContactSections({
                                ...contactSections,
                                departments: {
                                  ...contactSections.departments,
                                  [key]: { ...dept, phone: e.target.value },
                                },
                              })
                            }
                            placeholder="+91 22 6912 3456"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600">Operating Hours / TAT</label>
                          <input
                            type="text"
                            value={dept.hours || ''}
                            onChange={(e) =>
                              setContactSections({
                                ...contactSections,
                                departments: {
                                  ...contactSections.departments,
                                  [key]: { ...dept, hours: e.target.value },
                                },
                              })
                            }
                            placeholder="Mon - Sat, 9:30 AM - 7:00 PM"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600">WhatsApp Desk</label>
                          <input
                            type="text"
                            value={dept.whatsapp || ''}
                            onChange={(e) =>
                              setContactSections({
                                ...contactSections,
                                departments: {
                                  ...contactSections.departments,
                                  [key]: { ...dept, whatsapp: e.target.value },
                                },
                              })
                            }
                            placeholder="+91 98200 12345"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. FAQ Manager */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Frequently Asked Questions (FAQ Manager)</h3>
                  <p className="text-[11px] text-slate-500">Add, edit, or reorder storefront FAQ accordion items</p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={contactSections.faqs?.enabled !== false}
                  onChange={(e) =>
                    setContactSections({
                      ...contactSections,
                      faqs: { ...contactSections.faqs, enabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700">Enable Section</span>
              </label>
            </div>

            {contactSections.faqs?.enabled !== false && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">FAQ Badge</label>
                    <input
                      type="text"
                      value={contactSections.faqs?.badge || ''}
                      onChange={(e) =>
                        setContactSections({
                          ...contactSections,
                          faqs: { ...contactSections.faqs, badge: e.target.value },
                        })
                      }
                      placeholder="Frequently Asked Questions"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">FAQ Title</label>
                    <input
                      type="text"
                      value={contactSections.faqs?.title || ''}
                      onChange={(e) =>
                        setContactSections({
                          ...contactSections,
                          faqs: { ...contactSections.faqs, title: e.target.value },
                        })
                      }
                      placeholder="Frequently Asked Questions"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">FAQ Subtitle</label>
                    <input
                      type="text"
                      value={contactSections.faqs?.subtitle || ''}
                      onChange={(e) =>
                        setContactSections({
                          ...contactSections,
                          faqs: { ...contactSections.faqs, subtitle: e.target.value },
                        })
                      }
                      placeholder="Common questions about TradeLogix B2B wholesale ordering..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>

                {/* FAQ Items List */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Configured FAQ Items ({(contactSections.faqs?.items || []).length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const currentItems = Array.isArray(contactSections.faqs?.items) ? contactSections.faqs.items : [];
                        const newItem = {
                          id: `faq-${Date.now()}`,
                          question: 'New Question Title?',
                          answer: 'Detailed response explanation here.',
                        };
                        setContactSections({
                          ...contactSections,
                          faqs: { ...contactSections.faqs, items: [...currentItems, newItem] },
                        });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      <span>Add New FAQ</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(contactSections.faqs?.items || []).map((faqItem, idx) => (
                      <div key={faqItem.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative group">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-700">
                            FAQ Item #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const currentItems = contactSections.faqs?.items || [];
                              setContactSections({
                                ...contactSections,
                                faqs: {
                                  ...contactSections.faqs,
                                  items: currentItems.filter((_, i) => i !== idx),
                                },
                              });
                            }}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors flex items-center gap-1 text-[11px] font-bold"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                            <span>Remove</span>
                          </button>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600">Question</label>
                          <input
                            type="text"
                            value={faqItem.question || ''}
                            onChange={(e) => {
                              const currentItems = [...(contactSections.faqs?.items || [])];
                              currentItems[idx] = { ...faqItem, question: e.target.value };
                              setContactSections({
                                ...contactSections,
                                faqs: { ...contactSections.faqs, items: currentItems },
                              });
                            }}
                            placeholder="e.g. What is the Minimum Order Quantity (MOQ)?"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600">Answer Text</label>
                          <textarea
                            rows={3}
                            value={faqItem.answer || ''}
                            onChange={(e) => {
                              const currentItems = [...(contactSections.faqs?.items || [])];
                              currentItems[idx] = { ...faqItem, answer: e.target.value };
                              setContactSections({
                                ...contactSections,
                                faqs: { ...contactSections.faqs, items: currentItems },
                              });
                            }}
                            placeholder="Enter detailed answer..."
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs leading-relaxed text-slate-700"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: STANDARD CONTENT EDITOR (CUSTOM NON-STRUCTURED PAGES)                */}
      {/* ========================================================================= */}
      {!isStructuredPage && activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Page Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Terms of Service"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">URL Slug *</label>
                  <div className="flex items-center">
                    <span className="px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-xs font-mono text-slate-500">
                      /
                    </span>
                    <input
                      type="text"
                      value={formData.slug}
                      disabled={formData.isSystemPage}
                      onChange={(e) => setFormData({ ...formData, slug: generateSlugFromTitle(e.target.value) })}
                      placeholder="about"
                      className={`w-full px-3.5 py-2.5 border border-slate-200 rounded-r-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all ${
                        formData.isSystemPage
                          ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                          : 'bg-slate-50 text-slate-900 focus:bg-white'
                      }`}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Page Layout Preset</label>
                  <select
                    value={formData.layout}
                    onChange={(e) => setFormData({ ...formData, layout: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                  >
                    <option value="standard">Standard Article Layout</option>
                    <option value="hero">Hero Header + Wide Container</option>
                    <option value="policy">Legal Policy Layout</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Rich Content Editor with TinyMCE */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-800">Page Body Content</label>
                  <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-bold border border-brand-200">
                    TinyMCE Visual Editor
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {formData.content ? formData.content.length : 0} characters
                </span>
              </div>

              <div className="rounded-2xl overflow-hidden border border-slate-200">
                <Editor
                  tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@6.8.3/tinymce.min.js"
                  value={formData.content || ''}
                  onEditorChange={(newContent) => setFormData((prev) => ({ ...prev, content: newContent }))}
                  init={{
                    height: 550,
                    menubar: 'format tools table',
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'table', 'wordcount', 'codesample'
                    ],
                    toolbar: 'undo redo | blocks fontfamily fontsize | ' +
                      'bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter ' +
                      'alignright alignjustify | bullist numlist outdent indent | ' +
                      'table link | removeformat code fullscreen',
                    content_style: 'body { font-family: Inter, system-ui, -apple-system, sans-serif; font-size: 14px; color: #1e293b; line-height: 1.6; padding: 12px; } h1,h2,h3,h4,h5,h6 { font-family: Outfit, sans-serif; color: #0f172a; font-weight: 700; margin-top: 1.2em; margin-bottom: 0.5em; } p { margin-bottom: 1em; } ul, ol { padding-left: 24px; margin-bottom: 1em; } a { color: #2563eb; text-decoration: underline; } blockquote { border-left: 4px solid #3b82f6; padding-left: 16px; color: #475569; font-style: italic; background: #f8fafc; padding: 12px 16px; border-radius: 8px; } table { border-collapse: collapse; width: 100%; margin-bottom: 1em; } th, td { border: 1px solid #cbd5e1; padding: 8px 12px; } th { background: #f1f5f9; font-weight: 600; }',
                    skin: 'oxide',
                    content_css: 'default',
                    branding: false,
                    promotion: false,
                    statusbar: true,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar Settings (1 col) */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Publishing Status</h3>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-slate-800">Status</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      formData.isPublished
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {formData.isPublished ? 'Published' : 'Draft'}
                  </button>
                </label>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {formData.isPublished
                    ? 'This page is active and publicly accessible on the storefront.'
                    : 'This page is in draft mode and only visible to administrators.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: SEO & METADATA                                                       */}
      {/* ========================================================================= */}
      {activeTab === 'seo' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 max-w-3xl">
          <div className="space-y-1">
            <h2 className="text-base font-display font-black text-slate-900">Search Engine Optimization (SEO)</h2>
            <p className="text-xs text-slate-500">
              Configure how this page appears in Google search engine rankings, social shares, and browser tabs.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">Meta Title (SEO Title)</label>
                <span
                  className={`text-[10px] font-bold ${
                    (formData.metaTitle || '').length > 60 ? 'text-amber-600' : 'text-slate-400'
                  }`}
                >
                  {(formData.metaTitle || '').length}/60 recommended
                </span>
              </div>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                placeholder="e.g. About TradeLogix Wholesale | Hardware Distribution Platform"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">Meta Description</label>
                <span
                  className={`text-[10px] font-bold ${
                    (formData.metaDescription || '').length > 160 ? 'text-amber-600' : 'text-slate-400'
                  }`}
                >
                  {(formData.metaDescription || '').length}/160 recommended
                </span>
              </div>
              <textarea
                rows={3}
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                placeholder="Provide a concise description summarizing the page contents for search indexers..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
              />
            </div>

            {/* Social Share (OpenGraph / Twitter) Image */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-800">Social Share Preview Image (OG Image)</label>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    This image is shown when you share this page URL on WhatsApp, Facebook, LinkedIn, X / Twitter, or Slack.
                  </p>
                </div>
                {formData.metaImage && (
                  <button
                    type="button"
                    onClick={() =>
                      openMediaLibrary((media) => {
                        const cleanUrl = cleanMediaUrl(media);
                        setFormData((prev) => ({ ...prev, metaImage: cleanUrl }));
                      })
                    }
                    className="text-xs text-brand-600 hover:text-brand-700 font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  >
                    <span className="material-symbols-outlined text-[15px]">upload</span>
                    <span>Change Image</span>
                  </button>
                )}
              </div>

              {formData.metaImage ? (
                <div className="flex items-center gap-4 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70">
                  <div className="relative group w-32 h-20 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xs shrink-0">
                    <img
                      src={resolveMediaDisplayUrl(formData.metaImage)}
                      alt="Social Share Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="text-xs font-bold text-slate-800 truncate">{formData.metaImage}</div>
                    <div className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">check_circle</span>
                      <span>Ready for URL social share previews (OpenGraph)</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] pt-0.5">
                      <button
                        type="button"
                        onClick={() =>
                          openMediaLibrary((media) => {
                            const cleanUrl = cleanMediaUrl(media);
                            setFormData((prev) => ({ ...prev, metaImage: cleanUrl }));
                          })
                        }
                        className="text-brand-600 hover:text-brand-700 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                      >
                        <span className="material-symbols-outlined text-[13px]">swap_horiz</span>
                        <span>Replace</span>
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, metaImage: '' }))}
                        className="text-rose-500 hover:text-rose-700 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                      >
                        <span className="material-symbols-outlined text-[13px]">delete</span>
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() =>
                    openMediaLibrary((media) => {
                      const cleanUrl = cleanMediaUrl(media);
                      setFormData((prev) => ({ ...prev, metaImage: cleanUrl }));
                    })
                  }
                  className="border-2 border-dashed border-slate-200 hover:border-brand-400 hover:bg-brand-50/30 rounded-2xl p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3 bg-slate-50/50 cursor-pointer transition-all group select-none"
                >
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs group-hover:scale-105 group-hover:border-brand-200 transition-all">
                    <span className="material-symbols-outlined text-brand-600 text-2xl">upload</span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-700 text-xs group-hover:text-brand-600 transition-colors">
                      Open Media Library
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Click to upload photos or select from existing media files (Recommended: 1200 × 630 px)
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
            {/* Google Search Result Preview */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">search</span>
                <span>Google Search Snippet Preview</span>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-600 flex items-center gap-1 font-sans">
                  <span>https://tradelogix.in</span>
                  {formData.slug && formData.slug !== 'home' && (
                    <>
                      <span>›</span>
                      <span className="text-slate-800 font-mono">{formData.slug}</span>
                    </>
                  )}
                </div>
                <div className="text-sm text-blue-700 font-medium hover:underline cursor-pointer leading-tight">
                  {formData.metaTitle || formData.title || 'TradeLogix Wholesale Commerce'}
                </div>
                <div className="text-[11px] text-slate-600 leading-relaxed">
                  {formData.metaDescription ||
                    (isHomePage
                      ? 'Direct B2B wholesale electronics distribution platform with verified GST ITC invoices and tier volume pricing.'
                      : formData.content?.substring(0, 140)) ||
                    'TradeLogix Wholesale Enterprise B2B hardware distribution and catalog.'}
                </div>
              </div>
            </div>

            {/* Social Share URL Preview Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">share</span>
                <span>Social Share Link Preview (WhatsApp / X / FB)</span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                {formData.metaImage ? (
                  <div className="w-full h-28 bg-slate-100 overflow-hidden border-b border-slate-100">
                    <img
                      src={resolveMediaDisplayUrl(formData.metaImage)}
                      alt="Social Card Banner"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-20 bg-slate-100/80 border-b border-slate-100 flex flex-col items-center justify-center text-slate-400 gap-0.5">
                    <span className="material-symbols-outlined text-lg">image</span>
                    <span className="text-[10px]">No share preview image selected</span>
                  </div>
                )}

                <div className="p-3 space-y-0.5">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    tradelogix.in
                  </div>
                  <div className="text-xs font-bold text-slate-900 line-clamp-1">
                    {formData.metaTitle || formData.title || 'TradeLogix Wholesale Commerce'}
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                    {formData.metaDescription ||
                      (isHomePage
                        ? 'Direct B2B wholesale electronics distribution platform with verified GST ITC invoices and tier volume pricing.'
                        : formData.content?.substring(0, 100)) ||
                      'TradeLogix Wholesale Enterprise B2B hardware distribution and catalog.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: VISUAL PREVIEW (NON-HOME PAGES)                                      */}
      {/* ========================================================================= */}
      {!isHomePage && activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <span className="material-symbols-outlined text-[18px] text-brand-600">visibility</span>
              <span>Viewport Device Simulation:</span>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  previewDevice === 'desktop' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">desktop_windows</span>
                <span>Desktop</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewDevice('tablet')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  previewDevice === 'tablet' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">tablet</span>
                <span>Tablet</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  previewDevice === 'mobile' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">smartphone</span>
                <span>Mobile</span>
              </button>
            </div>
          </div>

          <div className="flex justify-center p-4 bg-slate-100 rounded-3xl border border-slate-200/80 min-h-[450px]">
            <div
              className={`bg-white rounded-2xl shadow-md border border-slate-200 p-8 sm:p-12 transition-all overflow-y-auto ${
                previewDevice === 'desktop'
                  ? 'w-full max-w-4xl'
                  : previewDevice === 'tablet'
                  ? 'w-[768px]'
                  : 'w-[375px]'
              }`}
            >
              <div className="border-b border-slate-100 pb-6 mb-6 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-[10px] font-bold uppercase tracking-wider">
                  <span>TradeLogix Document</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black font-display text-slate-900">{formData.title}</h1>
              </div>

              <div
                className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: formData.content || '<p class="text-slate-400 italic">No content entered.</p>',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Media Library Modal */}
      {showMediaModal && (
        <MediaLibraryModal
          isOpen={showMediaModal}
          onClose={() => {
            setShowMediaModal(false);
            setMediaTargetCallback(null);
          }}
          onSelect={(media) => {
            if (typeof mediaTargetCallback === 'function') {
              mediaTargetCallback(media);
            }
            setShowMediaModal(false);
            setMediaTargetCallback(null);
          }}
        />
      )}
    </div>
  );
}
