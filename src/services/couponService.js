const COUPONS_STORAGE_KEY = 'tradelogix_coupons_v1';
const API_URL = import.meta.env.PUBLIC_API_URL || (typeof window !== 'undefined' && window.__PUBLIC_API_URL__) || 'http://localhost:6543';

// Initial Mock Seed Data matching WooCommerce reference screenshot
export const INITIAL_MOCK_COUPONS = [
  {
    id: 'c1-1544666',
    code: 'pm-1544666',
    description: '15% Discount',
    discountType: 'percent',
    amount: 15,
    allowFreeShipping: true,
    expiryDate: '2026-06-15T23:59:59.000Z',
    minimumSpend: 500,
    maximumSpend: 50000,
    individualUse: false,
    excludeSaleItems: false,
    productIds: [],
    excludeProductIds: [],
    categoryIds: [],
    excludeCategoryIds: [],
    brandIds: [],
    excludeBrandIds: [],
    emailWhitelist: [],
    usageLimit: null,
    usageLimitPerUser: 1,
    usageCount: 5,
    status: 'publish',
    createdAt: new Date('2024-01-10').toISOString(),
  },
  {
    id: 'c2-1044661',
    code: 'pm-1044661',
    description: '10% Discount',
    discountType: 'percent',
    amount: 10,
    allowFreeShipping: false,
    expiryDate: '2026-12-31T23:59:59.000Z',
    minimumSpend: 1000,
    maximumSpend: null,
    individualUse: true,
    excludeSaleItems: true,
    productIds: [],
    excludeProductIds: [],
    categoryIds: [],
    excludeCategoryIds: [],
    brandIds: [],
    excludeBrandIds: [],
    emailWhitelist: [],
    usageLimit: null,
    usageLimitPerUser: null,
    usageCount: 0,
    status: 'publish',
    createdAt: new Date('2024-02-14').toISOString(),
  },
  {
    id: 'c3-0544656',
    code: 'pm-0544656',
    description: '5% discount',
    discountType: 'percent',
    amount: 5,
    allowFreeShipping: false,
    expiryDate: '2026-12-31T23:59:59.000Z',
    minimumSpend: null,
    maximumSpend: null,
    individualUse: false,
    excludeSaleItems: false,
    productIds: [],
    excludeProductIds: [],
    categoryIds: [],
    excludeCategoryIds: [],
    brandIds: [],
    excludeBrandIds: [],
    emailWhitelist: [],
    usageLimit: 100,
    usageLimitPerUser: null,
    usageCount: 0,
    status: 'publish',
    createdAt: new Date('2024-03-01').toISOString(),
  },
  {
    id: 'c4-welcome10',
    code: 'welcome-10',
    description: '10%, WELCOME DISCOUNT',
    discountType: 'percent',
    amount: 10,
    allowFreeShipping: false,
    expiryDate: '2026-12-31T23:59:59.000Z',
    minimumSpend: 200,
    maximumSpend: null,
    individualUse: true,
    excludeSaleItems: false,
    productIds: [],
    excludeProductIds: [],
    categoryIds: [],
    excludeCategoryIds: [],
    brandIds: [],
    excludeBrandIds: [],
    emailWhitelist: [],
    usageLimit: null,
    usageLimitPerUser: 1,
    usageCount: 4,
    status: 'publish',
    createdAt: new Date('2024-01-01').toISOString(),
  },
];

export function getLocalCoupons() {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(COUPONS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
      localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_COUPONS));
    } catch (e) {
      console.error('Failed to read local coupons', e);
    }
  }
  return [...INITIAL_MOCK_COUPONS];
}

export function saveLocalCoupons(coupons) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(coupons));
    } catch (e) {
      console.error('Failed to save local coupons', e);
    }
  }
}

/**
 * Fetch all coupons for Admin List View
 */
export async function fetchCouponsApi(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.discountType && params.discountType !== 'all') query.set('discountType', params.discountType);
  if (params.status && params.status !== 'all') query.set('status', params.status);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  try {
    const res = await fetch(`${API_URL}/api/admin/coupons?${query.toString()}`);
    if (res.ok) {
      const raw = await res.json();
      const payload = raw && raw.data !== undefined ? raw.data : raw;
      if (payload) {
        if (Array.isArray(payload)) {
          return {
            coupons: payload,
            total: payload.length,
            counts: {
              all: payload.length,
              publish: payload.filter((c) => c.status === 'publish').length,
              draft: payload.filter((c) => c.status === 'draft').length,
            },
            page: 1,
            limit: 50,
            totalPages: 1,
          };
        }
        if (Array.isArray(payload.coupons)) {
          saveLocalCoupons(payload.coupons);
          return payload;
        }
      }
    }
  } catch (err) {
    console.warn('Backend coupons fetch failed, fallback to local storage:', err);
  }

  // Fallback to local storage
  let items = getLocalCoupons();
  if (params.search) {
    const q = params.search.toLowerCase();
    items = items.filter((c) => c.code.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q));
  }
  if (params.discountType && params.discountType !== 'all') {
    items = items.filter((c) => c.discountType === params.discountType);
  }
  if (params.status && params.status !== 'all') {
    items = items.filter((c) => c.status === params.status);
  }

  const allCoupons = getLocalCoupons();
  return {
    coupons: items,
    total: items.length,
    counts: {
      all: allCoupons.length,
      publish: allCoupons.filter((c) => c.status === 'publish').length,
      draft: allCoupons.filter((c) => c.status === 'draft').length,
    },
    page: 1,
    limit: 50,
    totalPages: 1,
  };
}

/**
 * Fetch a single coupon by ID
 */
export async function fetchCouponByIdApi(id) {
  try {
    const res = await fetch(`${API_URL}/api/admin/coupons/${id}`);
    if (res.ok) {
      const raw = await res.json();
      return raw && raw.data !== undefined ? raw.data : raw;
    }
  } catch (err) {
    console.warn('Backend fetch coupon failed, checking local:', err);
  }

  const items = getLocalCoupons();
  return items.find((c) => c.id === id) || null;
}

/**
 * Create a new coupon
 */
export async function createCouponApi(payload) {
  try {
    const res = await fetch(`${API_URL}/api/admin/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const raw = await res.json();
    if (res.ok) {
      const data = raw && raw.data !== undefined ? raw.data : raw;
      return data;
    }
    throw new Error(raw.message || 'Failed to create coupon');
  } catch (err) {
    console.warn('Backend create coupon failed, creating locally:', err);
    if (err.message && !err.message.includes('fetch')) {
      throw err;
    }
    const newCoupon = {
      ...payload,
      id: `local-${Date.now()}`,
      usageCount: 0,
      createdAt: new Date().toISOString(),
    };
    const items = getLocalCoupons();
    items.unshift(newCoupon);
    saveLocalCoupons(items);
    return newCoupon;
  }
}

/**
 * Update an existing coupon
 */
export async function updateCouponApi(id, payload) {
  try {
    const res = await fetch(`${API_URL}/api/admin/coupons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const raw = await res.json();
    if (res.ok) {
      const data = raw && raw.data !== undefined ? raw.data : raw;
      return data;
    }
    throw new Error(raw.message || 'Failed to update coupon');
  } catch (err) {
    console.warn('Backend update coupon failed, saving locally:', err);
    if (err.message && !err.message.includes('fetch')) {
      throw err;
    }
    const items = getLocalCoupons();
    const index = items.findIndex((c) => c.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...payload, updatedAt: new Date().toISOString() };
      saveLocalCoupons(items);
      return items[index];
    }
    throw err;
  }
}

/**
 * Delete a coupon
 */
export async function deleteCouponApi(id) {
  try {
    const res = await fetch(`${API_URL}/api/admin/coupons/${id}`, { method: 'DELETE' });
    if (res.ok) {
      const items = getLocalCoupons().filter((c) => c.id !== id);
      saveLocalCoupons(items);
      return { success: true };
    }
  } catch (err) {
    console.warn('Backend delete failed, removing locally:', err);
  }
  const items = getLocalCoupons().filter((c) => c.id !== id);
  saveLocalCoupons(items);
  return { success: true };
}

/**
 * Auto-generate a unique coupon code
 */
export async function generateCouponCodeApi(prefix = 'pm-') {
  try {
    const res = await fetch(`${API_URL}/api/admin/coupons/generate-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix }),
    });
    if (res.ok) {
      const raw = await res.json();
      const data = raw && raw.data !== undefined ? raw.data : raw;
      if (data && data.code) return data.code;
    }
  } catch (err) {
    console.warn('Backend code generator unavailable, using local generator:', err);
  }

  // Fallback random 7-digit code generator (e.g. pm-1544666)
  const randNum = Math.floor(1000000 + Math.random() * 9000000);
  return `${prefix}${randNum}`;
}

/**
 * Public / Storefront Cart Coupon Validation Engine API
 */
export async function validateCouponApi(validatePayload) {
  try {
    const res = await fetch(`${API_URL}/api/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatePayload),
    });
    const raw = await res.json();
    if (!res.ok) {
      throw new Error(raw.message || 'Invalid coupon');
    }
    const data = raw && raw.data !== undefined ? raw.data : raw;
    return data;
  } catch (err) {
    // If backend offline, use local validation algorithm
    const cleanCode = (validatePayload.code || '').trim().toUpperCase();
    const all = getLocalCoupons();
    const coupon = all.find((c) => c.code.toUpperCase() === cleanCode);

    if (!coupon) {
      throw new Error(`Coupon "${validatePayload.code}" does not exist.`);
    }

    if (coupon.status !== 'publish') {
      throw new Error(`Coupon "${coupon.code}" is not active.`);
    }

    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      throw new Error(`Coupon "${coupon.code}" has expired.`);
    }

    const subtotal = Number(validatePayload.subtotal || 0);
    if (coupon.minimumSpend && subtotal < Number(coupon.minimumSpend)) {
      throw new Error(`The minimum spend for this coupon is ₹${Number(coupon.minimumSpend).toFixed(2)}.`);
    }

    if (coupon.maximumSpend && subtotal > Number(coupon.maximumSpend)) {
      throw new Error(`The maximum spend for this coupon is ₹${Number(coupon.maximumSpend).toFixed(2)}.`);
    }

    let discount = 0;
    if (coupon.discountType === 'percent') {
      discount = (subtotal * Number(coupon.amount)) / 100;
    } else if (coupon.discountType === 'fixed_cart') {
      discount = Math.min(Number(coupon.amount), subtotal);
    } else if (coupon.discountType === 'fixed_product') {
      const items = validatePayload.items || [];
      discount = items.reduce((acc, it) => acc + Math.min(Number(coupon.amount), it.price) * it.quantity, 0);
    }

    discount = Math.max(0, Math.min(discount, subtotal));
    discount = Math.round(discount * 100) / 100;

    return {
      valid: true,
      code: coupon.code,
      couponId: coupon.id,
      discountType: coupon.discountType,
      amount: Number(coupon.amount),
      discountAmount: discount,
      allowFreeShipping: Boolean(coupon.allowFreeShipping),
      message: `Coupon "${coupon.code}" applied successfully!`,
    };
  }
}

/**
 * Live search products from backend PostgreSQL database
 */
export async function searchCouponProductsApi(searchQuery = '', limit = 50) {
  try {
    const q = encodeURIComponent(searchQuery);
    const res = await fetch(`${API_URL}/api/admin/coupons/catalog/search-products?search=${q}&limit=${limit}`);
    if (res.ok) {
      const raw = await res.json();
      const payload = raw && raw.data !== undefined ? raw.data : raw;
      return Array.isArray(payload) ? payload : (payload.data || []);
    }
  } catch (err) {
    console.warn('Live product search failed, returning empty list:', err);
  }
  return [];
}

/**
 * Fetch all categories from backend PostgreSQL database
 */
export async function fetchCouponCategoriesApi() {
  try {
    const res = await fetch(`${API_URL}/api/admin/coupons/catalog/categories`);
    if (res.ok) {
      const raw = await res.json();
      const payload = raw && raw.data !== undefined ? raw.data : raw;
      return Array.isArray(payload) ? payload : (payload.data || []);
    }
  } catch (err) {
    console.warn('Categories fetch failed:', err);
  }
  return [];
}

/**
 * Fetch all brands from backend PostgreSQL database
 */
export async function fetchCouponBrandsApi() {
  try {
    const res = await fetch(`${API_URL}/api/admin/coupons/catalog/brands`);
    if (res.ok) {
      const raw = await res.json();
      const payload = raw && raw.data !== undefined ? raw.data : raw;
      return Array.isArray(payload) ? payload : (payload.data || []);
    }
  } catch (err) {
    console.warn('Brands fetch failed:', err);
  }
  return [];
}

/**
 * Fetch all customer emails from backend PostgreSQL database
 */
export async function fetchCouponCustomersApi(searchQuery = '') {
  try {
    const q = encodeURIComponent(searchQuery);
    const res = await fetch(`${API_URL}/api/admin/coupons/catalog/customers?search=${q}`);
    if (res.ok) {
      const raw = await res.json();
      const payload = raw && raw.data !== undefined ? raw.data : raw;
      return Array.isArray(payload) ? payload : (payload.data || []);
    }
  } catch (err) {
    console.warn('Customers fetch failed:', err);
  }
  return [];
}
