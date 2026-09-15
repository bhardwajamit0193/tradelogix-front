export const PRODUCTS = [];

export const CATEGORIES = ['All'];

const API_URL = import.meta.env.PUBLIC_API_URL || (typeof window !== 'undefined' && window.__PUBLIC_API_URL__) || 'http://localhost:6543';

// ─── Live Database API Fetchers ──────────────────────────────────────────────

export async function fetchShopProductsApi({
  category = 'All',
  search = '',
  sortBy = 'featured',
  page = 1,
  limit = 50,
} = {}) {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);
    if (sortBy) params.append('sortBy', sortBy);
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));

    const headers = { 'Content-Type': 'application/json' };
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('tradelogix_user');
        if (raw) {
          const user = JSON.parse(raw);
          if (user?.accessToken) {
            headers['Authorization'] = `Bearer ${user.accessToken}`;
          }
        }
      } catch (e) {}
    }

    const res = await fetch(`${API_URL}/api/shop/products?${params.toString()}`, {
      headers,
      cache: 'no-store',
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    const items = json.data || json.items || [];
    if (Array.isArray(items)) {
      return items.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku || '',
        category: p.category || (p.categories && p.categories[0]?.name) || 'Hardware',
        categories: p.categories || [],
        price: parseFloat(p.price) || 0,
        originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
        pricing: p.pricing || null,
        tiers: (p.pricing?.tiers && Array.isArray(p.pricing.tiers)) ? p.pricing.tiers : (p.tiers || []),
        basePrice: p.pricing?.basePrice ? parseFloat(p.pricing.basePrice) : (parseFloat(p.price) || 0),
        rating: p.rating || 0,
        reviewCount: p.reviewCount || 0,
        inStock: p.inStock !== false && (p.stockCount === undefined || p.stockCount > 0),
        stockCount: typeof p.stockCount === 'number' ? p.stockCount : (p.stock !== undefined ? parseInt(p.stock, 10) : 0),
        isFeatured: p.isFeatured || false,
        isNew: p.isNew !== undefined ? p.isNew : false,
        badge: p.badge || '',
        image: p.image || p.featuredImage || (p.images && p.images[0]) || '/placeholder-product.svg',
        gallery: p.gallery || p.images || [],
        description: p.description || '',
      }));
    }
  } catch (err) {
    console.warn('[ProductService] Live DB fetch error:', err.message);
  }
  return [];
}

export async function fetchShopCategoriesApi() {
  try {
    const res = await fetch(`${API_URL}/api/all-categories`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    const items = json.data || json || [];
    if (Array.isArray(items)) {
      return items;
    }
  } catch (err) {
    console.warn('[ProductService] Live category fetch error:', err.message);
  }
  return [];
}

export async function fetchSectionProducts(sectionConfig = {}, fallbackType = 'latest') {
  const {
    mode = 'automatic',
    selectedCategoryIds = [],
    selectedProductIds = [],
    limit = 4,
    autoCriteria = 'sales',
  } = sectionConfig;

  // Fetch all available products from Database
  const dbProducts = await fetchShopProductsApi({ limit: 50 });

  if (!Array.isArray(dbProducts) || dbProducts.length === 0) {
    return [];
  }

  // 1. Manual Product Selection Mode
  if (mode === 'manual' && Array.isArray(selectedProductIds) && selectedProductIds.length > 0) {
    const matched = dbProducts.filter(
      (p) => selectedProductIds.includes(p.id) || selectedProductIds.includes(p.slug)
    );
    if (matched.length > 0) {
      return matched.slice(0, limit || 4);
    }
  }

  // 2. Category Filter Mode
  if (
    (mode === 'category' || (Array.isArray(selectedCategoryIds) && selectedCategoryIds.length > 0)) &&
    Array.isArray(selectedCategoryIds) &&
    selectedCategoryIds.length > 0
  ) {
    const matched = dbProducts.filter((p) =>
      selectedCategoryIds.some((cVal) => {
        const cValStr = String(cVal).toLowerCase();
        return (
          (p.category && p.category.toLowerCase() === cValStr) ||
          (p.categories && p.categories.some((c) => c.id === cVal || c.name.toLowerCase() === cValStr || c.slug === cValStr)) ||
          p.id === cVal ||
          p.slug === cVal
        );
      })
    );
    if (matched.length > 0) {
      return matched.slice(0, limit || 4);
    }
  }

  // 3. Automatic Mode / Database Sorting
  if (fallbackType === 'top-selling' || autoCriteria === 'sales') {
    const sorted = [...dbProducts].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return sorted.slice(0, limit || 4);
  }
  if (
    fallbackType === 'trending' ||
    autoCriteria === 'search_velocity' ||
    autoCriteria === 'trending'
  ) {
    const sorted = [...dbProducts].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    return sorted.slice(0, limit || 4);
  }
  if (fallbackType === 'featured') {
    const featured = dbProducts.filter((p) => p.isFeatured);
    return (featured.length > 0 ? featured : dbProducts).slice(0, limit || 4);
  }

  // Default latest
  return dbProducts.slice(0, limit || 4);
}

// ─── Synchronous Fallback Methods ─────────────────────────────────────────────

export function getProducts() {
  return [];
}

export function getProductBySlug() {
  return null;
}

export function getFeaturedProducts() {
  return [];
}

export function getLatestProducts() {
  return [];
}

export function getTopSellingProducts() {
  return [];
}

export function getTrendingProducts() {
  return [];
}

export function getSectionProducts() {
  return [];
}


