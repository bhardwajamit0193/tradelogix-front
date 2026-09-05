import React, { useState, useEffect } from 'react';
import {
  fetchCouponByIdApi,
  createCouponApi,
  updateCouponApi,
  generateCouponCodeApi,
  deleteCouponApi,
  searchCouponProductsApi,
  fetchCouponCategoriesApi,
  fetchCouponCustomersApi,
} from '../../services/couponService.js';
import { PRODUCTS } from '../../services/productService.js';
import {
  Tag,
  Percent,
  ShoppingCart,
  Package,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Trash2,
  Calendar,
  Layers,
  ChevronDown,
  X,
  Plus,
  RefreshCw,
  Search,
  Copy,
  Check,
  ShieldAlert,
  Clock,
  Truck,
  Users,
  Sliders,
  DollarSign,
  Info,
  SlidersHorizontal,
  FileText,
  BadgePercent,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

const API_URL =
  import.meta.env.PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.__PUBLIC_API_URL__) ||
  'http://localhost:6543';

const MONTHS = [
  { val: '0', label: '01-Jan' },
  { val: '1', label: '02-Feb' },
  { val: '2', label: '03-Mar' },
  { val: '3', label: '04-Apr' },
  { val: '4', label: '05-May' },
  { val: '5', label: '06-Jun' },
  { val: '6', label: '07-Jul' },
  { val: '7', label: '08-Aug' },
  { val: '8', label: '09-Sep' },
  { val: '9', label: '10-Oct' },
  { val: '10', label: '11-Nov' },
  { val: '11', label: '12-Dec' },
];

function formatPublishDate(d) {
  if (!d) return '';
  const mNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const m = mNames[d.getMonth()];
  const day = String(d.getDate()).padStart(2, '0');
  const y = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${m} ${day}, ${y} at ${hh}:${mm}`;
}

// ─── MODERN SELECT2 MULTI-PICKER ──────────────────────────────────────────
function ModernSelect2Picker({
  selectedIds = [],
  onChange,
  items = [],
  placeholder = 'Search...',
  requireMinChars = false,
  minChars = 3,
  getItemLabel = (item) => `${item.name || item.firmName || item.email} (#${item.sku || item.id || ''})`,
  selectValueFn = (item) => item.id || item.email,
  allowCustomTag = false,
  asyncSearchFn,
  searchFilter,
  icon: Icon,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [asyncResults, setAsyncResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = React.useRef(null);
  const inputRef = React.useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced live backend search
  useEffect(() => {
    if (asyncSearchFn) {
      if (requireMinChars && searchTerm.trim().length < minChars) {
        setAsyncResults([]);
        return;
      }
      const timer = setTimeout(async () => {
        setIsSearching(true);
        try {
          const res = await asyncSearchFn(searchTerm.trim());
          if (Array.isArray(res)) {
            setAsyncResults(res);
          }
        } catch (e) {
          console.warn('Async search notice:', e);
        } finally {
          setIsSearching(false);
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, asyncSearchFn, requireMinChars, minChars]);

  const defaultFilter = (item, query) => {
    const q = query.toLowerCase();
    const name = (item.name || item.firmName || item.ownerName || '').toLowerCase();
    const sku = (item.sku || '').toLowerCase();
    const email = (item.email || '').toLowerCase();
    const phone = (item.mobileNumber || '').toLowerCase();
    const id = String(item.id || '').toLowerCase();
    return name.includes(q) || sku.includes(q) || email.includes(q) || phone.includes(q) || id.includes(q);
  };

  const filterFn = searchFilter || defaultFilter;

  // Pool of all known items
  const allPool = [...items];
  asyncResults.forEach((ar) => {
    const val = selectValueFn(ar);
    if (!allPool.some((it) => String(selectValueFn(it)) === String(val))) {
      allPool.push(ar);
    }
  });

  const selectedObjects = selectedIds.map((val) => {
    const found = allPool.find(
      (it) =>
        String(selectValueFn(it)) === String(val) ||
        String(it.id) === String(val) ||
        String(it.email) === String(val)
    );
    return {
      _rawVal: val,
      ...(found || { id: val, name: val, email: val }),
    };
  });

  const availableOptions = (asyncSearchFn && searchTerm.trim() ? asyncResults : allPool).filter(
    (it) =>
      !selectedIds.some(
        (sId) => String(sId) === String(selectValueFn(it)) || String(sId) === String(it.id)
      )
  );

  const filteredOptions = asyncSearchFn
    ? availableOptions
    : searchTerm.trim()
    ? availableOptions.filter((it) => filterFn(it, searchTerm.trim()))
    : availableOptions;

  const handleRemove = (rawVal) => {
    onChange(selectedIds.filter((val) => String(val) !== String(rawVal)));
  };

  const handleSelect = (item) => {
    const val = selectValueFn(item);
    if (!selectedIds.some((id) => String(id) === String(val))) {
      onChange([...selectedIds, val]);
    }
    setSearchTerm('');
    setIsOpen(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' && searchTerm === '' && selectedIds.length > 0) {
      handleRemove(selectedObjects[selectedObjects.length - 1]._rawVal);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' && allowCustomTag && searchTerm.trim()) {
      e.preventDefault();
      const customVal = searchTerm.trim();
      if (!selectedIds.includes(customVal)) {
        onChange([...selectedIds, customVal]);
      }
      setSearchTerm('');
      setIsOpen(false);
    }
  };

  const showMinCharsWarning = requireMinChars && searchTerm.trim().length < minChars;

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        onClick={() => {
          setIsOpen(true);
          if (inputRef.current) inputRef.current.focus();
        }}
        className={`w-full min-h-[42px] bg-slate-50/50 hover:bg-white border rounded-xl p-1.5 flex flex-wrap items-center gap-1.5 cursor-text transition-all duration-200 ${
          isOpen
            ? 'bg-white border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        {selectedObjects.map((item, idx) => (
          <span
            key={item.id || idx}
            className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-lg border border-blue-200/60 shadow-2xs select-none transition-all group"
          >
            {Icon && <Icon className="w-3 h-3 text-blue-500 shrink-0" />}
            <span className="truncate max-w-[260px]">{getItemLabel(item)}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(item._rawVal);
              }}
              className="text-blue-400 hover:text-red-600 hover:bg-red-50 p-0.5 rounded-full transition-colors leading-none"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        <div className="flex-1 min-w-[140px] flex items-center gap-1.5 px-1">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={selectedObjects.length === 0 ? placeholder : ''}
            className="w-full bg-transparent border-0 outline-none text-xs text-slate-800 placeholder-slate-400 py-1"
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-100 animate-in fade-in-50 zoom-in-95 duration-100">
          {showMinCharsWarning ? (
            <div className="p-3 text-xs text-slate-500 flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Type {minChars} or more characters to search...</span>
            </div>
          ) : isSearching ? (
            <div className="p-3 text-xs text-blue-600 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>Searching database...</span>
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="p-3 text-xs text-slate-500">
              {allowCustomTag && searchTerm.trim() ? (
                <div
                  onClick={() => {
                    onChange([...selectedIds, searchTerm.trim()]);
                    setSearchTerm('');
                    setIsOpen(false);
                  }}
                  className="cursor-pointer text-blue-600 hover:bg-blue-50 p-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    Add custom whitelist entry: <strong>"{searchTerm.trim()}"</strong>
                  </span>
                </div>
              ) : (
                <div className="text-slate-400 italic text-center py-2">No matching items found</div>
              )}
            </div>
          ) : (
            filteredOptions.map((opt, idx) => (
              <div
                key={opt.id || idx}
                onClick={() => handleSelect(opt)}
                className="px-3.5 py-2.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2 truncate">
                  {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />}
                  <span className="font-medium truncate">{getItemLabel(opt)}</span>
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-blue-500 uppercase tracking-wider font-semibold ml-2 shrink-0">
                  Select
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── MODERN TOOLTIP ──────────────────────────────────────────
function ModernTooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="text-slate-400 hover:text-slate-600 transition-colors p-0.5"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      {show && (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 z-50 w-64 p-2.5 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl pointer-events-none leading-relaxed font-normal animate-in fade-in">
          {text}
        </div>
      )}
    </div>
  );
}

// ─── MODERN TOGGLE SWITCH ──────────────────────────────────────────
function ModernToggle({ checked, onChange, label, description, icon: Icon }) {
  return (
    <label className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition-all duration-150">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
            <Icon className="w-4 h-4 text-slate-600" />
          </div>
        )}
        <div>
          <span className="text-xs font-semibold text-slate-800 block">{label}</span>
          {description && (
            <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="relative inline-flex items-center shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
            checked ? 'bg-blue-600' : 'bg-slate-200'
          }`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out mt-0.5 ml-0.5 ${
              checked ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </div>
      </div>
    </label>
  );
}

// ─── MAIN COUPON FORM COMPONENT ──────────────────────────────────────────
export default function CouponForm({ couponId }) {
  const isEditing = Boolean(couponId);

  // General Properties
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('percent'); // 'percent', 'fixed_cart', 'fixed_product'
  const [amount, setAmount] = useState('0');
  const [allowFreeShipping, setAllowFreeShipping] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');

  // Usage Restrictions
  const [minimumSpend, setMinimumSpend] = useState('');
  const [maximumSpend, setMaximumSpend] = useState('');
  const [individualUse, setIndividualUse] = useState(false);
  const [excludeSaleItems, setExcludeSaleItems] = useState(false);
  const [productIds, setProductIds] = useState([]);
  const [excludeProductIds, setExcludeProductIds] = useState([]);
  const [categoryIds, setCategoryIds] = useState([]);
  const [excludeCategoryIds, setExcludeCategoryIds] = useState([]);
  const [allowedEmails, setAllowedEmails] = useState([]);

  // Usage Limits
  const [usageLimit, setUsageLimit] = useState('');
  const [usageLimitPerUser, setUsageLimitPerUser] = useState('');
  const [usageCount, setUsageCount] = useState(0);

  // Status & Publish Box
  const [status, setStatus] = useState('publish'); // 'publish', 'draft'

  // Publish Schedule Time
  const [publishImmediately, setPublishImmediately] = useState(true);
  const [publishDate, setPublishDate] = useState(new Date());
  const [isEditingPublishTime, setIsEditingPublishTime] = useState(false);

  // Timepicker sub-fields
  const [editMonth, setEditMonth] = useState(String(new Date().getMonth()));
  const [editDay, setEditDay] = useState(String(new Date().getDate()).padStart(2, '0'));
  const [editYear, setEditYear] = useState(String(new Date().getFullYear()));
  const [editHour, setEditHour] = useState(String(new Date().getHours()).padStart(2, '0'));
  const [editMinute, setEditMinute] = useState(String(new Date().getMinutes()).padStart(2, '0'));

  // UI Active Tab: 'general', 'restrictions', 'limits'
  const [activeTab, setActiveTab] = useState('general');

  // State controls
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [notification, setNotification] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [copied, setCopied] = useState(false);

  // Catalog Options loaded dynamically from Postgres
  const [availableProducts, setAvailableProducts] = useState(PRODUCTS || []);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableCustomers, setAvailableCustomers] = useState([]);

  // Load existing coupon if editing
  useEffect(() => {
    if (isEditing) {
      (async () => {
        setLoading(true);
        try {
          const res = await fetchCouponByIdApi(couponId);
          const data = res && res.data !== undefined ? res.data : res;
          if (data) {
            setCode(data.code || '');
            setDescription(data.description || '');
            setDiscountType(data.discountType || 'percent');
            setAmount(String(data.amount || '0'));
            setAllowFreeShipping(Boolean(data.allowFreeShipping));
            if (data.expiryDate) {
              const d = new Date(data.expiryDate);
              setExpiryDate(d.toISOString().split('T')[0]);
            }
            setMinimumSpend(
              data.minimumSpend !== null && data.minimumSpend !== undefined
                ? String(data.minimumSpend)
                : ''
            );
            setMaximumSpend(
              data.maximumSpend !== null && data.maximumSpend !== undefined
                ? String(data.maximumSpend)
                : ''
            );
            setIndividualUse(Boolean(data.individualUse));
            setExcludeSaleItems(Boolean(data.excludeSaleItems));
            setProductIds(data.productIds || []);
            setExcludeProductIds(data.excludeProductIds || []);
            setCategoryIds(data.categoryIds || []);
            setExcludeCategoryIds(data.excludeCategoryIds || []);
            const loadedEmails = Array.isArray(data.emailWhitelist)
              ? data.emailWhitelist
              : Array.isArray(data.allowedEmails)
              ? data.allowedEmails
              : typeof data.emailWhitelist === 'string' && data.emailWhitelist.trim()
              ? data.emailWhitelist.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean)
              : [];
            setAllowedEmails(loadedEmails);
            if (data.publishDate || data.createdAt) {
              const pd = new Date(data.publishDate || data.createdAt);
              setPublishDate(pd);
              setPublishImmediately(false);
              setEditMonth(String(pd.getMonth()));
              setEditDay(String(pd.getDate()).padStart(2, '0'));
              setEditYear(String(pd.getFullYear()));
              setEditHour(String(pd.getHours()).padStart(2, '0'));
              setEditMinute(String(pd.getMinutes()).padStart(2, '0'));
            }
            setUsageLimit(data.usageLimit ? String(data.usageLimit) : '');
            setUsageLimitPerUser(data.usageLimitPerUser ? String(data.usageLimitPerUser) : '');
            setUsageCount(data.usageCount || 0);
            setStatus(data.status || 'publish');
          }
        } catch (err) {
          setErrorMsg('Failed to load coupon details');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [couponId, isEditing]);

  // Fetch real categories, customers, and products dynamically from database
  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        const [cats, custs, prods] = await Promise.all([
          fetchCouponCategoriesApi(),
          fetchCouponCustomersApi(''),
          searchCouponProductsApi('', 50),
        ]);
        if (Array.isArray(cats) && cats.length > 0) setAvailableCategories(cats);
        if (Array.isArray(custs) && custs.length > 0) setAvailableCustomers(custs);
        if (Array.isArray(prods) && prods.length > 0) setAvailableProducts(prods);
      } catch (e) {
        console.warn('Catalog dynamic load notice:', e);
      }
    };
    fetchCatalogData();
  }, []);

  const handleSavePublishTime = () => {
    const y = parseInt(editYear, 10) || new Date().getFullYear();
    const m = parseInt(editMonth, 10) || 0;
    const d = parseInt(editDay, 10) || 1;
    const h = parseInt(editHour, 10) || 0;
    const min = parseInt(editMinute, 10) || 0;
    const newD = new Date(y, m, d, h, min, 0);
    setPublishDate(newD);
    setPublishImmediately(false);
    setIsEditingPublishTime(false);
  };

  const handleCancelPublishTime = () => {
    setEditMonth(String(publishDate.getMonth()));
    setEditDay(String(publishDate.getDate()).padStart(2, '0'));
    setEditYear(String(publishDate.getFullYear()));
    setEditHour(String(publishDate.getHours()).padStart(2, '0'));
    setEditMinute(String(publishDate.getMinutes()).padStart(2, '0'));
    setIsEditingPublishTime(false);
  };

  const handleGenerateCode = async () => {
    setIsGeneratingCode(true);
    try {
      const generated = await generateCouponCodeApi('TLX-');
      setCode(generated);
      showToast(`Generated code: ${generated}`);
    } catch (e) {
      const randNum = Math.floor(1000000 + Math.random() * 9000000);
      setCode(`TLX-${randNum}`);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleCopyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!code.trim()) {
      setErrorMsg('Please enter or generate a coupon code.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const payload = {
      code: code.trim(),
      description: description.trim(),
      discountType,
      amount: parseFloat(amount) || 0,
      allowFreeShipping,
      expiryDate: expiryDate ? new Date(`${expiryDate}T23:59:59Z`).toISOString() : null,
      publishDate: publishImmediately ? new Date().toISOString() : publishDate.toISOString(),
      minimumSpend: minimumSpend.trim() !== '' ? parseFloat(minimumSpend) : null,
      maximumSpend: maximumSpend.trim() !== '' ? parseFloat(maximumSpend) : null,
      individualUse,
      excludeSaleItems,
      productIds,
      excludeProductIds,
      categoryIds,
      excludeCategoryIds,
      emailWhitelist: allowedEmails,
      usageLimit: usageLimit.trim() !== '' ? parseInt(usageLimit, 10) : null,
      usageLimitPerUser: usageLimitPerUser.trim() !== '' ? parseInt(usageLimitPerUser, 10) : null,
      status,
    };

    try {
      if (isEditing) {
        await updateCouponApi(couponId, payload);
        showToast('Coupon updated successfully!');
      } else {
        const created = await createCouponApi(payload);
        showToast('Coupon published successfully!');
        if (created && created.id) {
          setTimeout(() => {
            window.location.href = `/admin/coupons/${created.id}`;
          }, 600);
        } else {
          setTimeout(() => {
            window.location.href = '/admin/coupons';
          }, 600);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while saving the coupon.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete coupon "${code}" permanently?`)) {
      await deleteCouponApi(couponId);
      window.location.href = '/admin/coupons';
    }
  };

  // Quick date helper
  const setQuickExpiry = (days) => {
    if (days === null) {
      setExpiryDate('');
      return;
    }
    const d = new Date();
    d.setDate(d.getDate() + days);
    setExpiryDate(d.toISOString().split('T')[0]);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-slate-500 gap-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold tracking-wide uppercase text-slate-400">
          Loading Coupon Workspace...
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-top-3 border border-slate-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* ─── TOP MODERN APP BAR ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <a
            href="/admin/coupons"
            className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 border border-slate-200/90 shadow-2xs flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all"
            title="Back to coupons"
          >
            <ArrowLeft className="w-4 h-4" />
          </a>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {isEditing ? (
                  <span className="flex items-center gap-2">
                    Edit Coupon <span className="font-mono text-blue-600">#{code || couponId}</span>
                  </span>
                ) : (
                  'Create New Discount Coupon'
                )}
              </h1>
              <span
                className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                  status === 'publish'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {status === 'publish' ? 'Active' : 'Draft'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure discount rules, spend limits, customer whitelists, and usage restrictions.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200/60 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}

          <a
            href="/admin/coupons"
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl transition-all shadow-2xs"
          >
            Cancel
          </a>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Save Changes' : 'Publish Coupon'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 shadow-2xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* ─── HERO CODE GENERATOR & DISCOUNT TYPE HEADER CARD ─── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
        {/* Ambient background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Coupon Code Input & Generator (6 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-widest text-blue-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Coupon Code
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  disabled={isGeneratingCode}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 rounded-lg transition-all"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  {isGeneratingCode ? 'Generating...' : 'Auto-Generate'}
                </button>
                {code && (
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/15 border border-white/10 rounded-lg transition-all"
                    title="Copy code"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="e.g. SUMMER2026 or SAVE15"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full text-xl sm:text-2xl font-mono font-bold text-white bg-white/10 border-2 border-white/20 focus:border-blue-400 focus:bg-white/15 focus:ring-4 focus:ring-blue-500/20 rounded-xl px-4 py-3 outline-none tracking-wider placeholder:text-white/30 transition-all uppercase"
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Short description / internal note (e.g. 15% off for Monsoon Festival Promo)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs text-white/90 placeholder-white/40 bg-white/5 border border-white/10 focus:border-white/30 focus:bg-white/10 rounded-xl px-3.5 py-2.5 outline-none transition-all"
              />
            </div>
          </div>

          {/* Discount Value Quick-Card (5 cols) */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-white/15 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-200 flex items-center gap-1">
                <BadgePercent className="w-3.5 h-3.5" />
                Discount Value
              </span>
              <span className="text-[10px] text-white/60 font-mono">
                {discountType === 'percent'
                  ? 'Percentage off total'
                  : discountType === 'fixed_cart'
                  ? 'Lump sum cart discount'
                  : 'Discount per qualifying item'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full text-2xl sm:text-3xl font-bold text-white bg-black/20 border border-white/20 focus:border-blue-400 rounded-xl px-3.5 py-2 outline-none font-mono"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-blue-300">
                  {discountType === 'percent' ? '%' : '₹'}
                </span>
              </div>
            </div>

            {/* Quick value presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-white/50 font-medium mr-1">Presets:</span>
              {discountType === 'percent'
                ? [5, 10, 15, 20, 25, 50].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(String(val))}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold transition-all ${
                        String(amount) === String(val)
                          ? 'bg-blue-500 text-white shadow-xs'
                          : 'bg-white/10 hover:bg-white/20 text-white/80'
                      }`}
                    >
                      {val}%
                    </button>
                  ))
                : [50, 100, 250, 500, 1000, 2000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(String(val))}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold transition-all ${
                        String(amount) === String(val)
                          ? 'bg-blue-500 text-white shadow-xs'
                          : 'bg-white/10 hover:bg-white/20 text-white/80'
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN 2-COLUMN SETTINGS GRID ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tabbed Settings (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {/* Top Horizontal Tab Header */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50/70 px-2 pt-2 gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-2 px-4 py-3 rounded-t-xl text-xs font-bold transition-all border-t-2 ${
                activeTab === 'general'
                  ? 'bg-white text-blue-600 border-blue-600 shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>General Settings</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('restrictions')}
              className={`flex items-center gap-2 px-4 py-3 rounded-t-xl text-xs font-bold transition-all border-t-2 ${
                activeTab === 'restrictions'
                  ? 'bg-white text-blue-600 border-blue-600 shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Usage Restrictions</span>
              {(productIds.length > 0 ||
                categoryIds.length > 0 ||
                allowedEmails.length > 0 ||
                minimumSpend) && (
                <span className="w-2 h-2 rounded-full bg-blue-600" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('limits')}
              className={`flex items-center gap-2 px-4 py-3 rounded-t-xl text-xs font-bold transition-all border-t-2 ${
                activeTab === 'limits'
                  ? 'bg-white text-blue-600 border-blue-600 shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Usage Limits</span>
              {usageLimit && <span className="w-2 h-2 rounded-full bg-blue-600" />}
            </button>
          </div>

          {/* ─── TAB CONTENT PANELS ─── */}
          <div className="p-6">
            {/* ─── PANEL 1: GENERAL ─── */}
            {activeTab === 'general' && (
              <div className="space-y-6 animate-in fade-in-50 duration-150">
                {/* Discount Type Selector Cards */}
                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2.5">
                    Discount Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Percent Option */}
                    <div
                      onClick={() => setDiscountType('percent')}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                        discountType === 'percent'
                          ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-2 ring-blue-500/10'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Percent
                          className={`w-4 h-4 ${
                            discountType === 'percent' ? 'text-blue-600' : 'text-slate-400'
                          }`}
                        />
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            discountType === 'percent'
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {discountType === 'percent' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <div className="mt-2.5">
                        <div className="text-xs font-bold text-slate-800">Percentage</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Calculates % off qualifying cart value
                        </div>
                      </div>
                    </div>

                    {/* Fixed Cart Option */}
                    <div
                      onClick={() => setDiscountType('fixed_cart')}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                        discountType === 'fixed_cart'
                          ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-2 ring-blue-500/10'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <ShoppingCart
                          className={`w-4 h-4 ${
                            discountType === 'fixed_cart' ? 'text-blue-600' : 'text-slate-400'
                          }`}
                        />
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            discountType === 'fixed_cart'
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {discountType === 'fixed_cart' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <div className="mt-2.5">
                        <div className="text-xs font-bold text-slate-800">Fixed Cart</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Fixed ₹ discount on entire order cart
                        </div>
                      </div>
                    </div>

                    {/* Fixed Product Option */}
                    <div
                      onClick={() => setDiscountType('fixed_product')}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                        discountType === 'fixed_product'
                          ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-2 ring-blue-500/10'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Package
                          className={`w-4 h-4 ${
                            discountType === 'fixed_product' ? 'text-blue-600' : 'text-slate-400'
                          }`}
                        />
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            discountType === 'fixed_product'
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-300'
                          }`}
                        >
                          {discountType === 'fixed_product' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <div className="mt-2.5">
                        <div className="text-xs font-bold text-slate-800">Fixed Product</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Fixed ₹ discount per selected item
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expiry Date Setup */}
                <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Coupon Expiry Date
                      <ModernTooltip text="The coupon will automatically expire on this date at 23:59:59 IST. Leave empty for permanent coupon." />
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setQuickExpiry(7)}
                        className="text-[10px] font-semibold text-slate-600 hover:text-blue-600 bg-white px-2 py-0.5 rounded border border-slate-200"
                      >
                        +7 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickExpiry(30)}
                        className="text-[10px] font-semibold text-slate-600 hover:text-blue-600 bg-white px-2 py-0.5 rounded border border-slate-200"
                      >
                        +30 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickExpiry(90)}
                        className="text-[10px] font-semibold text-slate-600 hover:text-blue-600 bg-white px-2 py-0.5 rounded border border-slate-200"
                      >
                        +90 Days
                      </button>
                      {expiryDate && (
                        <button
                          type="button"
                          onClick={() => setQuickExpiry(null)}
                          className="text-[10px] font-semibold text-rose-600 hover:text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full text-xs font-medium bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                  />
                </div>

                {/* Free Shipping Toggle */}
                <ModernToggle
                  checked={allowFreeShipping}
                  onChange={setAllowFreeShipping}
                  icon={Truck}
                  label="Grant Free Shipping"
                  description="Check this box if the coupon waives shipping fees. A free shipping method must be enabled in your delivery zones."
                />
              </div>
            )}

            {/* ─── PANEL 2: USAGE RESTRICTIONS ─── */}
            {activeTab === 'restrictions' && (
              <div className="space-y-6 animate-in fade-in-50 duration-150">
                {/* Spend Restrictions (Min / Max Spend) */}
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                    Order Spend Requirements
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-700 flex items-center gap-1 mb-1.5">
                        Minimum Spend (₹)
                        <ModernTooltip text="Minimum cart subtotal required to use this coupon." />
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="No minimum spend"
                          value={minimumSpend}
                          onChange={(e) => setMinimumSpend(e.target.value)}
                          className="w-full text-xs bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          ₹
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700 flex items-center gap-1 mb-1.5">
                        Maximum Spend (₹)
                        <ModernTooltip text="Maximum cart subtotal allowed when using this coupon." />
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="No maximum spend"
                          value={maximumSpend}
                          onChange={(e) => setMaximumSpend(e.target.value)}
                          className="w-full text-xs bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          ₹
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stacking & Sale Item Rules */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ModernToggle
                    checked={individualUse}
                    onChange={setIndividualUse}
                    icon={Tag}
                    label="Individual Use Only"
                    description="Prevents this coupon from being stacked or combined with any other coupon."
                  />
                  <ModernToggle
                    checked={excludeSaleItems}
                    onChange={setExcludeSaleItems}
                    icon={Percent}
                    label="Exclude Sale Items"
                    description="Discount will not apply to products already on sale / discounted."
                  />
                </div>

                <div className="border-t border-slate-200/80 pt-5 space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Product & Category Rules
                  </h3>

                  {/* Products Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                    <label className="sm:col-span-4 text-xs font-semibold text-slate-700 pt-2 flex items-center gap-1">
                      Included Products
                      <ModernTooltip text="Products that this coupon will specifically apply to, or that must be in the cart." />
                    </label>
                    <div className="sm:col-span-8">
                      <ModernSelect2Picker
                        selectedIds={productIds}
                        onChange={setProductIds}
                        items={availableProducts}
                        asyncSearchFn={searchCouponProductsApi}
                        placeholder="Search products by name or SKU..."
                        requireMinChars={true}
                        minChars={3}
                        icon={Package}
                        getItemLabel={(p) => `${p.name} (#${p.sku || p.id})`}
                      />
                    </div>
                  </div>

                  {/* Exclude Products */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                    <label className="sm:col-span-4 text-xs font-semibold text-slate-700 pt-2 flex items-center gap-1">
                      Excluded Products
                      <ModernTooltip text="Products that this coupon will NOT apply to." />
                    </label>
                    <div className="sm:col-span-8">
                      <ModernSelect2Picker
                        selectedIds={excludeProductIds}
                        onChange={setExcludeProductIds}
                        items={availableProducts}
                        asyncSearchFn={searchCouponProductsApi}
                        placeholder="Search products to exclude..."
                        requireMinChars={true}
                        minChars={3}
                        icon={Package}
                        getItemLabel={(p) => `${p.name} (#${p.sku || p.id})`}
                      />
                    </div>
                  </div>

                  {/* Product Categories */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                    <label className="sm:col-span-4 text-xs font-semibold text-slate-700 pt-2 flex items-center gap-1">
                      Product Categories
                      <ModernTooltip text="Categories that the coupon will be applied to." />
                    </label>
                    <div className="sm:col-span-8">
                      <ModernSelect2Picker
                        selectedIds={categoryIds}
                        onChange={setCategoryIds}
                        items={availableCategories}
                        placeholder="Any category (No restriction)"
                        requireMinChars={false}
                        icon={Layers}
                        getItemLabel={(c) => c.name}
                      />
                    </div>
                  </div>

                  {/* Exclude Categories */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                    <label className="sm:col-span-4 text-xs font-semibold text-slate-700 pt-2 flex items-center gap-1">
                      Excluded Categories
                      <ModernTooltip text="Categories that the coupon will NOT apply to." />
                    </label>
                    <div className="sm:col-span-8">
                      <ModernSelect2Picker
                        selectedIds={excludeCategoryIds}
                        onChange={setExcludeCategoryIds}
                        items={availableCategories}
                        placeholder="No categories excluded"
                        requireMinChars={false}
                        icon={Layers}
                        getItemLabel={(c) => c.name}
                      />
                    </div>
                  </div>
                </div>

                {/* Customer Account Whitelist */}
                <div className="border-t border-slate-200/80 pt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Allowed Customers / Accounts
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Restrict coupon usage to specific registered businesses or email addresses.
                      </p>
                    </div>
                  </div>

                  <ModernSelect2Picker
                    selectedIds={allowedEmails}
                    onChange={setAllowedEmails}
                    items={availableCustomers}
                    asyncSearchFn={fetchCouponCustomersApi}
                    placeholder="Search customer by firm name, owner, email, or mobile..."
                    requireMinChars={true}
                    minChars={3}
                    allowCustomTag={true}
                    icon={Users}
                    selectValueFn={(c) => c.email || c.id}
                    getItemLabel={(c) => {
                      if (c.firmName) {
                        const extra = [c.ownerName, c.email, c.mobileNumber].filter(Boolean).join(' • ');
                        return `${c.firmName}${extra ? ` (${extra})` : ''}`;
                      }
                      if (c.ownerName) {
                        const extra = [c.email, c.mobileNumber].filter(Boolean).join(' • ');
                        return `${c.ownerName}${extra ? ` (${extra})` : ''}`;
                      }
                      return c.email || c.name || c.id;
                    }}
                  />
                  <p className="text-[11px] text-slate-400">
                    💡 Tip: You can also type wildcard domain patterns like <code>*@example.com</code> and press Enter.
                  </p>
                </div>
              </div>
            )}

            {/* ─── PANEL 3: USAGE LIMITS ─── */}
            {activeTab === 'limits' && (
              <div className="space-y-6 animate-in fade-in-50 duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/80 space-y-2">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                      Usage Limit Per Coupon
                      <ModernTooltip text="How many total times this coupon can be redeemed before becoming invalid." />
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Unlimited usage"
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(e.target.value)}
                      className="w-full text-xs font-medium bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                    />
                    <p className="text-[11px] text-slate-500">
                      Leave blank for unrestricted global redemptions.
                    </p>
                  </div>

                  <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/80 space-y-2">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      Usage Limit Per Customer
                      <ModernTooltip text="How many times an individual customer account or email can use this coupon." />
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Unlimited per customer"
                      value={usageLimitPerUser}
                      onChange={(e) => setUsageLimitPerUser(e.target.value)}
                      className="w-full text-xs font-medium bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                    />
                    <p className="text-[11px] text-slate-500">
                      Typically set to <code>1</code> for welcome or single-use coupons.
                    </p>
                  </div>
                </div>

                {/* Usage Analytics Metric Card */}
                {isEditing && (
                  <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                        {usageCount}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Total Redemptions to Date</div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          {usageLimit ? `${usageCount} of ${usageLimit} max redemptions used` : 'Uncapped total redemptions'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT SIDEBAR (4 cols) ─── */}
        <div className="lg:col-span-4 space-y-5">
          {/* Status & Quick Settings Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2.5 flex items-center justify-between">
              <span>Publishing Status</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  status === 'publish' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('publish')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  status === 'publish'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Active</span>
              </button>
              <button
                type="button"
                onClick={() => setStatus('draft')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  status === 'draft'
                    ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Draft</span>
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              {/* Publish Schedule Line matching WooCommerce */}
              <div className="py-1">
                <div className="flex items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>
                      {publishImmediately ? (
                        <>
                          Publish <strong>immediately</strong>
                        </>
                      ) : publishDate > new Date() ? (
                        <>
                          Schedule for: <strong>{formatPublishDate(publishDate)}</strong>
                        </>
                      ) : (
                        <>
                          Published on: <strong>{formatPublishDate(publishDate)}</strong>
                        </>
                      )}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingPublishTime(!isEditingPublishTime)}
                    className="text-blue-600 hover:underline font-semibold text-xs ml-1 shrink-0 cursor-pointer"
                  >
                    {isEditingPublishTime ? 'Close' : 'Edit'}
                  </button>
                </div>

                {/* Timepicker popup / expanded view */}
                {isEditingPublishTime && (
                  <div className="mt-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in fade-in-50 duration-100">
                    <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-700">
                      {/* Month dropdown */}
                      <select
                        value={editMonth}
                        onChange={(e) => setEditMonth(e.target.value)}
                        className="bg-white border border-slate-300 hover:border-slate-400 rounded-lg px-2 py-1 text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none"
                      >
                        {MONTHS.map((m) => (
                          <option key={m.val} value={m.val}>
                            {m.label}
                          </option>
                        ))}
                      </select>

                      {/* Day */}
                      <input
                        type="text"
                        value={editDay}
                        onChange={(e) => setEditDay(e.target.value)}
                        maxLength={2}
                        className="w-9 bg-white border border-slate-300 hover:border-slate-400 rounded-lg px-1.5 py-1 text-center text-xs font-mono font-medium focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                      <span className="text-slate-400 font-bold">,</span>

                      {/* Year */}
                      <input
                        type="text"
                        value={editYear}
                        onChange={(e) => setEditYear(e.target.value)}
                        maxLength={4}
                        className="w-14 bg-white border border-slate-300 hover:border-slate-400 rounded-lg px-1.5 py-1 text-center text-xs font-mono font-medium focus:ring-1 focus:ring-blue-500 outline-none"
                      />

                      <span className="text-slate-500 text-xs px-0.5">at</span>

                      {/* Hour */}
                      <input
                        type="text"
                        value={editHour}
                        onChange={(e) => setEditHour(e.target.value)}
                        maxLength={2}
                        className="w-9 bg-white border border-slate-300 hover:border-slate-400 rounded-lg px-1 py-1 text-center text-xs font-mono font-medium focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                      <span className="text-slate-400 font-bold">:</span>

                      {/* Minute */}
                      <input
                        type="text"
                        value={editMinute}
                        onChange={(e) => setEditMinute(e.target.value)}
                        maxLength={2}
                        className="w-9 bg-white border border-slate-300 hover:border-slate-400 rounded-lg px-1 py-1 text-center text-xs font-mono font-medium focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleSavePublishTime}
                        className="px-3 py-1 bg-white hover:bg-slate-100 text-blue-600 font-bold border border-blue-600 rounded-lg text-xs transition-all shadow-2xs cursor-pointer"
                      >
                        OK
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelPublishTime}
                        className="text-xs text-blue-600 hover:underline cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Expiry Status:
                </span>
                <span className="font-semibold text-slate-800">
                  {expiryDate ? new Date(expiryDate).toLocaleDateString() : 'Permanent'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" /> Free Shipping:
                </span>
                <span className="font-semibold text-slate-800">
                  {allowFreeShipping ? 'Granted' : 'Standard'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" /> Stacking:
                </span>
                <span className="font-semibold text-slate-800">
                  {individualUse ? 'Solo Only' : 'Stackable'}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {!publishImmediately && publishDate > new Date()
                      ? 'Schedule'
                      : isEditing
                      ? 'Update'
                      : 'Publish'}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* ─── LIVE VOUCHER CARD PREVIEW ─── */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Live Shopper Voucher Preview
            </span>

            <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-5 shadow-lg overflow-hidden border border-blue-500/30">
              {/* Jagged / Cutout notch edges */}
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-100 rounded-full" />
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-100 rounded-full" />

              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-blue-200">
                    TradeLogix Voucher
                  </span>
                  <div className="text-2xl font-black tracking-tight mt-0.5">
                    {discountType === 'percent' ? `${amount || 0}% OFF` : `₹${amount || 0} OFF`}
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                  {discountType === 'percent' ? 'Percentage' : 'Fixed Amount'}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-blue-200">Promo Code</div>
                  <div className="font-mono font-bold text-sm tracking-wider">
                    {code || 'ENTER-CODE'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-blue-200">Valid Till</div>
                  <div className="text-[11px] font-semibold">
                    {expiryDate ? new Date(expiryDate).toLocaleDateString() : 'No Expiry'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
