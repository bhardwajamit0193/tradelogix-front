export const PRODUCTS = [
  {
    id: 'prod-1',
    name: 'AeroPulse ANC Wireless Headphones',
    slug: 'aeropulse-anc-wireless-headphones',
    category: 'Audio',
    price: 299.99,
    originalPrice: 349.99,
    rating: 4.9,
    reviewCount: 142,
    inStock: true,
    stockCount: 38,
    isFeatured: true,
    isNew: true,
    badge: 'Best Seller',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
    ],
    variants: ['Midnight Black', 'Silver Frost', 'Cyber Blue'],
    description: 'Experience ultra-pure audio with active noise cancellation, 45-hour battery life, spatial audio processing, and ultra-soft memory foam ear cushions.',
    specs: {
      'Driver Size': '40mm Titanium Dynamic',
      'Battery Life': 'Up to 45 Hours',
      'Connectivity': 'Bluetooth 5.3 / 3.5mm Aux',
      'Weight': '250g',
      'ANC Modes': 'Adaptive Noise Control, Transparency',
    },
  },
  {
    id: 'prod-2',
    name: 'OmniView 34" Curved OLED Monitor',
    slug: 'omniview-34-curved-oled-monitor',
    category: 'Displays',
    price: 1199.00,
    originalPrice: 1299.00,
    rating: 4.8,
    reviewCount: 89,
    inStock: true,
    stockCount: 14,
    isFeatured: true,
    isNew: false,
    badge: 'Pro Choice',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800&auto=format&fit=crop&q=80',
    ],
    variants: ['Standard Desk Stand', 'VESA Monitor Arm Bundle'],
    description: 'Ultra-wide 240Hz OLED gaming & workstation display with 0.03ms response time, 99% DCI-P3 color precision, and immersive 1800R curvature.',
    specs: {
      'Resolution': '3440 x 1440 UWQHD',
      'Refresh Rate': '240Hz',
      'Response Time': '0.03ms GTG',
      'HDR': 'DisplayHDR True Black 400',
    },
  },
  {
    id: 'prod-3',
    name: 'CraftKey Pro Mechanical Keyboard',
    slug: 'craftkey-pro-mechanical-keyboard',
    category: 'Peripherals',
    price: 189.50,
    originalPrice: 219.00,
    rating: 4.9,
    reviewCount: 215,
    inStock: true,
    stockCount: 52,
    isFeatured: true,
    isNew: true,
    badge: 'Hot Item',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80',
    ],
    variants: ['Tactile Brown Switches', 'Linear Red Switches', 'Clicky Blue Switches'],
    description: 'Custom gasket-mounted wireless mechanical keyboard featuring CNC aluminum chassis, hot-swappable PCB, and PBT double-shot keycaps.',
    specs: {
      'Layout': '75% Compact',
      'Connectivity': 'Tri-Mode (2.4GHz, BT 5.1, USB-C)',
      'Battery': '4000mAh (Up to 200 hrs RGB off)',
      'Chassis': 'Anodized Aircraft Aluminum',
    },
  },
  {
    id: 'prod-4',
    name: 'PulseBand Ultra Smart Watch',
    slug: 'pulseband-ultra-smart-watch',
    category: 'Wearables',
    price: 349.00,
    originalPrice: 399.00,
    rating: 4.7,
    reviewCount: 94,
    inStock: true,
    stockCount: 22,
    isFeatured: false,
    isNew: true,
    badge: 'New Arrival',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
    ],
    variants: ['Titanium / Sport Loop', 'Graphite / Leather Strap'],
    description: 'Next-gen health monitoring smartwatch with sapphire glass, dual-frequency GPS, ECG tracking, and 7-day extended battery life.',
    specs: {
      'Display': '1.92" LTPO AMOLED 2000 nits',
      'Water Resistance': '100m (10 ATM)',
      'Sensors': 'ECG, SpO2, Optical Heart Rate, Temperature',
    },
  },
  {
    id: 'prod-5',
    name: 'LuminaDesk Ergonomic LED Lamp',
    slug: 'luminadesk-ergonomic-led-lamp',
    category: 'Home & Office',
    price: 89.00,
    originalPrice: 109.00,
    rating: 4.6,
    reviewCount: 68,
    inStock: true,
    stockCount: 60,
    isFeatured: false,
    isNew: false,
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=800&auto=format&fit=crop&q=80',
    ],
    variants: ['Space Gray', 'Matte White'],
    description: 'Smart ambient desk lamp with automatic light sensing, adjustable color temperature (2700K - 6500K), and built-in 15W Qi wireless charger.',
    specs: {
      'Brightness': '1000 Lumens Max',
      'CRI': 'Ra >= 95 Color Rendering',
      'Wireless Charging': '15W Fast Qi Pad',
    },
  },
  {
    id: 'prod-6',
    name: 'NovaStation 7-in-1 USB-C Dock',
    slug: 'novastation-7-in-1-usbc-dock',
    category: 'Peripherals',
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.8,
    reviewCount: 112,
    inStock: true,
    stockCount: 85,
    isFeatured: false,
    isNew: false,
    badge: 'Essential',
    image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800&auto=format&fit=crop&q=80',
    ],
    variants: ['Standard Metal Gray'],
    description: 'High-speed hub offering Dual 4K 60Hz HDMI output, 100W Power Delivery, SD/TF reader, and 10Gbps USB 3.2 Gen 2 transfer rates.',
    specs: {
      'HDMI Output': 'Dual 4K @ 60Hz',
      'Pass-Through Power': '100W PD 3.0',
      'Data Rate': '10 Gbps',
    },
  },
  {
    id: 'prod-7',
    name: 'HyperDrive NVMe Portable SSD 2TB',
    slug: 'hyperdrive-nvme-portable-ssd-2tb',
    category: 'Storage',
    price: 219.00,
    originalPrice: 249.00,
    rating: 4.9,
    reviewCount: 178,
    inStock: true,
    stockCount: 40,
    isFeatured: true,
    isNew: false,
    badge: 'Top Rated',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    ],
    variants: ['1TB Capacity', '2TB Capacity', '4TB Capacity'],
    description: 'Ruggedized shock-resistant external SSD delivering up to 2000 MB/s read speeds, IP65 water resistance, and hardware encryption.',
    specs: {
      'Read Speed': 'Up to 2000 MB/s',
      'Interface': 'USB 3.2 Gen 2x2',
      'Protection': 'IP65 Water/Dust Resistant',
    },
  },
  {
    id: 'prod-8',
    name: 'Vortex Precision Wireless Gaming Mouse',
    slug: 'vortex-precision-wireless-gaming-mouse',
    category: 'Peripherals',
    price: 129.99,
    originalPrice: 149.99,
    rating: 4.7,
    reviewCount: 156,
    inStock: true,
    stockCount: 29,
    isFeatured: false,
    isNew: true,
    badge: 'Esports Ready',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
    ],
    variants: ['Obsidian Black', 'Chalk White'],
    description: 'Ultra-lightweight 49g gaming mouse powered by 30K optical sensor, 8000Hz wireless polling rate, and optical micro-switches.',
    specs: {
      'Weight': '49g Ultra Lightweight',
      'Sensor': '30,000 DPI Optical',
      'Battery': 'Up to 90 Hours',
    },
  },
];

export const CATEGORIES = [
  'All',
  'Audio',
  'Displays',
  'Peripherals',
  'Wearables',
  'Home & Office',
  'Storage',
];

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

    const res = await fetch(`${API_URL}/api/shop/products?${params.toString()}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    const items = json.data || json.items || [];
    if (Array.isArray(items) && items.length > 0) {
      return items.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku || '',
        category: p.category || (p.categories && p.categories[0]?.name) || 'Hardware',
        categories: p.categories || [],
        price: parseFloat(p.price) || 0,
        originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
        rating: p.rating || 4.8,
        reviewCount: p.reviewCount || 42,
        inStock: p.inStock !== false && (p.stockCount === undefined || p.stockCount > 0),
        stockCount: typeof p.stockCount === 'number' ? p.stockCount : (p.stock !== undefined ? parseInt(p.stock, 10) : 50),
        isFeatured: p.isFeatured || false,
        isNew: p.isNew !== undefined ? p.isNew : true,
        badge: p.badge || (p.isNew ? 'New Arrival' : 'Verified OEM'),
        image: p.image || p.featuredImage || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        gallery: p.gallery || p.images || [],
        description: p.description || '',
      }));
    }
  } catch (err) {
    console.warn('[ProductService] Live DB fetch fallback:', err.message);
  }
  return getProducts({ category, search, sortBy, limit });
}

export async function fetchShopCategoriesApi() {
  try {
    const res = await fetch(`${API_URL}/api/all-categories`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    const items = json.data || json || [];
    if (Array.isArray(items) && items.length > 0) {
      return items;
    }
  } catch (err) {
    console.warn('[ProductService] Live category fetch fallback:', err.message);
  }
  return CATEGORIES.filter((c) => c !== 'All').map((name, i) => ({
    id: String(i + 1),
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
  }));
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

export function getProducts({ category = 'All', search = '', sortBy = 'featured', maxPrice = 2000, limit = 50 } = {}) {
  let list = [...PRODUCTS];

  if (category && category !== 'All') {
    list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  if (maxPrice) {
    list = list.filter((p) => p.price <= maxPrice);
  }

  if (sortBy === 'price-low') {
    list.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    list.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'newest') {
    list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
  }

  return list.slice(0, limit);
}

export function getProductBySlug(slug) {
  return PRODUCTS.find((p) => p.slug === slug) || null;
}

export function getFeaturedProducts() {
  return PRODUCTS.filter((p) => p.isFeatured);
}

export function getLatestProducts() {
  return PRODUCTS.filter((p) => p.isNew).slice(0, 4);
}

export function getTopSellingProducts() {
  return PRODUCTS.filter((p) => p.badge?.includes('Seller') || p.rating >= 4.8).slice(0, 4);
}

export function getTrendingProducts() {
  return PRODUCTS.filter((p) => p.badge?.includes('Hot') || p.badge?.includes('Pro') || p.badge?.includes('Esports') || p.rating >= 4.7).slice(0, 4);
}

export function getSectionProducts(sectionConfig = {}, fallbackType = 'latest') {
  const {
    mode = 'automatic',
    selectedCategoryIds = [],
    selectedProductIds = [],
    limit = 4,
    autoCriteria = 'sales',
  } = sectionConfig;

  // 1. Manual Product Selection Mode
  if (mode === 'manual' && Array.isArray(selectedProductIds) && selectedProductIds.length > 0) {
    const matched = PRODUCTS.filter(
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
    const matched = PRODUCTS.filter((p) =>
      selectedCategoryIds.some((cVal) => {
        const cValStr = String(cVal).toLowerCase();
        return (
          (p.category && p.category.toLowerCase() === cValStr) ||
          (p.categoryIds && p.categoryIds.includes(cVal)) ||
          p.id === cVal ||
          p.slug === cVal
        );
      })
    );
    if (matched.length > 0) {
      return matched.slice(0, limit || 4);
    }
  }

  // 3. Automatic Mode / Algorithms
  if (fallbackType === 'top-selling' || autoCriteria === 'sales') {
    return getTopSellingProducts().slice(0, limit || 4);
  }
  if (
    fallbackType === 'trending' ||
    autoCriteria === 'search_velocity' ||
    autoCriteria === 'trending'
  ) {
    return getTrendingProducts().slice(0, limit || 4);
  }
  if (fallbackType === 'featured') {
    return getFeaturedProducts().slice(0, limit || 4);
  }
  return getLatestProducts().slice(0, limit || 4);
}


