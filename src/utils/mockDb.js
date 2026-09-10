const SEED_PRODUCTS = [
  {
    id: "prod-1",
    name: "Logitech MX Master 3S",
    description: "Ergonomic wireless mouse with custom options, 8K DPI tracking, and quiet clicks.",
    slug: "logitech-mx-master-3s",
    images: ["https://images.unsplash.com/photo-1527866990279-b0651f66ca1d?w=300&auto=format&fit=crop&q=60"],
    category: "Electronics, Office Supplies",
    tags: ["mouse", "wireless", "logitech", "ergonomic"],
    isActive: true,
    sku: "LOGI-MX3S-BLK",
    productWeight: "0.14",
    countryOfOrigin: "Switzerland",
    hsCode: "8471.60.60",
    specifications: [
      { key: "Sensor Resolution", value: "8,000 DPI Darkfield" },
      { key: "Connectivity", value: "Bluetooth Low Energy & Logi Bolt USB" },
      { key: "Battery Life", value: "Up to 70 days on a full charge" },
      { key: "Scroll Wheel", value: "MagSpeed Electromagnetic SmartShift" },
      { key: "Customizable Buttons", value: "7 buttons (Left/Right-click, Back/Forward, App-Switch, Wheel mode-shift, Middle click)" }
    ],
    pricingConfigurations: [
      {
        totalStock: 120,
        warehouseStocks: [
          { warehouseId: "w-1", warehouseCode: "MUM-01", warehouseName: "Mumbai Central", stock: 50 },
          { warehouseId: "w-2", warehouseCode: "DEL-01", warehouseName: "Delhi Hub", stock: 40 },
          { warehouseId: "w-3", warehouseCode: "BLR-01", warehouseName: "Bengaluru Depot", stock: 30 }
        ],
        pricestiers: [
          { priceGroup: "Default", price: "7999.00", compare_at_price: "9999.00", tiers: [{ minQuantity: 5, price: "7499.00" }, { minQuantity: 10, price: "6999.00" }] },
          { priceGroup: "Dealer", price: "7199.00", tiers: [] },
          { priceGroup: "Distributor", price: "6799.00", tiers: [] },
          { priceGroup: "Special", price: "6399.00", tiers: [] }
        ]
      }
    ]
  },
  {
    id: "prod-2",
    name: "Dell UltraSharp 34 Curved Monitor",
    description: "34-inch WQHD curved monitor with IPS Black technology, USB-C Hub, and KVM switch.",
    slug: "dell-ultrasharp-34",
    images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&auto=format&fit=crop&q=60"],
    category: "Electronics, Displays",
    tags: ["monitor", "dell", "curved", "4k"],
    isActive: true,
    sku: "DELL-U3425WE",
    productWeight: "11.2",
    countryOfOrigin: "Malaysia",
    hsCode: "8528.52.00",
    specifications: [
      { key: "Screen Size", value: "34.14 inches Curved 1900R" },
      { key: "Resolution", value: "WQHD 3440 x 1440 at 60 Hz" },
      { key: "Panel Technology", value: "IPS Black (2000:1 Contrast Ratio)" },
      { key: "Color Gamut", value: "98% DCI-P3, 100% sRGB" },
      { key: "Ports", value: "Thunderbolt 4 (90W PD), HDMI 2.1, DP 1.4, RJ45 Ethernet" }
    ],
    pricingConfigurations: [
      {
        totalStock: 35,
        warehouseStocks: [
          { warehouseId: "w-1", warehouseCode: "MUM-01", warehouseName: "Mumbai Central", stock: 15 },
          { warehouseId: "w-2", warehouseCode: "DEL-01", warehouseName: "Delhi Hub", stock: 10 },
          { warehouseId: "w-3", warehouseCode: "BLR-01", warehouseName: "Bengaluru Depot", stock: 10 }
        ],
        pricestiers: [
          { priceGroup: "Default", price: "84999.00", compare_at_price: "99999.00", tiers: [{ minQuantity: 2, price: "81999.00" }, { minQuantity: 5, price: "78999.00" }] },
          { priceGroup: "Dealer", price: "79999.00", tiers: [] },
          { priceGroup: "Distributor", price: "76999.00", tiers: [] },
          { priceGroup: "Special", price: "74999.00", tiers: [] }
        ]
      }
    ]
  },
  {
    id: "prod-3",
    name: "Keychron K2 Wireless Keyboard",
    description: "75% layout compact mechanical keyboard with Gateron switches, RGB backlight, and Mac layout.",
    slug: "keychron-k2-wireless",
    images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&auto=format&fit=crop&q=60"],
    category: "Electronics, Office Supplies",
    tags: ["keyboard", "mechanical", "wireless", "keychron"],
    isActive: true,
    sku: "KEYC-K2-RGB-BR",
    productWeight: "0.79",
    countryOfOrigin: "China",
    hsCode: "8471.60.20",
    specifications: [
      { key: "Layout", value: "75% Compact (84 keys)" },
      { key: "Switches", value: "Gateron G Pro Brown (Tactile, Hot-Swappable)" },
      { key: "Connectivity", value: "Bluetooth 5.1 & Type-C Cable" },
      { key: "Battery", value: "4000mAh rechargeable Li-polymer" },
      { key: "Operating System", value: "macOS / Windows / iOS / Android" }
    ],
    pricingConfigurations: [
      {
        totalStock: 80,
        warehouseStocks: [
          { warehouseId: "w-1", warehouseCode: "MUM-01", warehouseName: "Mumbai Central", stock: 30 },
          { warehouseId: "w-2", warehouseCode: "DEL-01", warehouseName: "Delhi Hub", stock: 30 },
          { warehouseId: "w-3", warehouseCode: "BLR-01", warehouseName: "Bengaluru Depot", stock: 20 }
        ],
        pricestiers: [
          { priceGroup: "Default", price: "6999.00", compare_at_price: "8499.00", tiers: [{ minQuantity: 10, price: "6499.00" }] },
          { priceGroup: "Dealer", price: "6299.00", tiers: [] },
          { priceGroup: "Distributor", price: "5999.00", tiers: [] },
          { priceGroup: "Special", price: "5699.00", tiers: [] }
        ]
      }
    ]
  },
  {
    id: "prod-4",
    name: "Sony WH-1000XM5 Wireless Headphones",
    description: "Industry-leading noise cancelling headphones with Auto NC Optimizer, crystal clear hands-free calling, and up to 30-hour battery life.",
    slug: "sony-wh-1000xm5",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=60"],
    category: "Electronics, Audio",
    tags: ["headphones", "sony", "noise-cancelling", "wireless"],
    isActive: true,
    sku: "SONY-WH1000XM5-BLK",
    productWeight: "0.25",
    countryOfOrigin: "Japan",
    hsCode: "8518.30.00",
    specifications: [
      { key: "Acoustic Driver", value: "30mm precision carbon fiber composite dome" },
      { key: "Noise Cancellation", value: "HD Noise Cancelling Processor QN1 + Integrated Processor V1 (8 Mics)" },
      { key: "Battery Life", value: "Up to 30 hours (NC ON) / 40 hours (NC OFF)" },
      { key: "Fast Charging", value: "3 mins charge = 3 hours playback (USB-PD)" },
      { key: "Audio Formats", value: "LDAC, AAC, SBC (Hi-Res Audio Wireless)" }
    ],
    pricingConfigurations: [
      {
        totalStock: 60,
        warehouseStocks: [
          { warehouseId: "w-1", warehouseCode: "MUM-01", warehouseName: "Mumbai Central", stock: 25 },
          { warehouseId: "w-2", warehouseCode: "DEL-01", warehouseName: "Delhi Hub", stock: 20 },
          { warehouseId: "w-3", warehouseCode: "BLR-01", warehouseName: "Bengaluru Depot", stock: 15 }
        ],
        pricestiers: [
          { priceGroup: "Default", price: "29999.00", compare_at_price: "34990.00", tiers: [{ minQuantity: 3, price: "28499.00" }, { minQuantity: 10, price: "26999.00" }] },
          { priceGroup: "Dealer", price: "27499.00", tiers: [] },
          { priceGroup: "Distributor", price: "25999.00", tiers: [] },
          { priceGroup: "Special", price: "24499.00", tiers: [] }
        ]
      }
    ]
  }
];

export const getMockProducts = () => {
  if (typeof window === 'undefined') return SEED_PRODUCTS;
  const stored = localStorage.getItem('tradelogix_products_v4');
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem('tradelogix_products_v4', JSON.stringify(SEED_PRODUCTS));
  return SEED_PRODUCTS;
};

export const saveMockProduct = (product) => {
  if (typeof window === 'undefined') return product;
  const products = getMockProducts();
  const index = products.findIndex(p => p.id === product.id || p.slug === product.slug);
  
  if (index !== -1) {
    product.id = products[index].id;
    products[index] = { ...products[index], ...product };
  } else {
    product.id = product.id || `prod-${Date.now()}`;
    products.push(product);
  }

  // ─── Bidirectional Linked Products / Variations Sync ───
  if (product.productType === 'variation' && Array.isArray(product.linkedProducts) && product.linkedProducts.length > 0) {
    const clusterIds = new Set([product.id, ...product.linkedProducts.map(lp => lp.id)]);

    // Update all member products in this cluster
    products.forEach((p, idx) => {
      if (clusterIds.has(p.id)) {
        // Collect other members for this product
        const otherMembers = products
          .filter(op => clusterIds.has(op.id) && op.id !== p.id)
          .map(op => ({
            id: op.id,
            name: op.name,
            sku: op.sku,
            slug: op.slug,
            images: op.images || [],
          }));

        products[idx] = {
          ...p,
          productType: 'variation',
          linkedProducts: otherMembers,
        };
      } else if (Array.isArray(p.linkedProducts) && p.linkedProducts.some(lp => lp.id === product.id)) {
        // If it was previously linked but now removed, uncouple it
        const remaining = p.linkedProducts.filter(lp => lp.id !== product.id);
        products[idx] = {
          ...p,
          linkedProducts: remaining,
          productType: remaining.length > 0 ? 'variation' : 'simple',
        };
      }
    });
  } else if (product.productType === 'simple') {
    // If set to simple, remove this product from all other products' linkedProducts
    products.forEach((p, idx) => {
      if (p.id !== product.id && Array.isArray(p.linkedProducts) && p.linkedProducts.some(lp => lp.id === product.id)) {
        const remaining = p.linkedProducts.filter(lp => lp.id !== product.id);
        products[idx] = {
          ...p,
          linkedProducts: remaining,
          productType: remaining.length > 0 ? 'variation' : 'simple',
        };
      }
    });
  }

  localStorage.setItem('tradelogix_products_v4', JSON.stringify(products));
  return product;
};

export const deleteMockProduct = (productId) => {
  if (typeof window === 'undefined') return;
  const products = getMockProducts();
  const filtered = products.filter(p => p.id !== productId);
  // Clean up references to deleted product in other products' linkedProducts
  filtered.forEach((p, idx) => {
    if (Array.isArray(p.linkedProducts) && p.linkedProducts.some(lp => lp.id === productId)) {
      const remaining = p.linkedProducts.filter(lp => lp.id !== productId);
      filtered[idx] = {
        ...p,
        linkedProducts: remaining,
        productType: remaining.length > 0 ? p.productType : 'simple',
      };
    }
  });
  localStorage.setItem('tradelogix_products_v4', JSON.stringify(filtered));
};

// ─── Category Storage ────────────────────────────────────────────────────────

const SEED_CATEGORIES = [
  { id: 'cat-1', name: 'Electronics', slug: 'electronics', parentId: null, description: 'Electronic gadgets and devices.' },
  { id: 'cat-2', name: 'Office Supplies', slug: 'office-supplies', parentId: null, description: 'Products for your office and workspace.' },
  { id: 'cat-3', name: 'Audio', slug: 'audio', parentId: 'cat-1', description: 'Headphones, speakers and audio equipment.' },
  { id: 'cat-4', name: 'Displays', slug: 'displays', parentId: 'cat-1', description: 'Monitors and display screens.' },
];

export const getCategories = () => {
  if (typeof window === 'undefined') return SEED_CATEGORIES;
  const stored = localStorage.getItem('tradelogix_categories_v1');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('tradelogix_categories_v1', JSON.stringify(SEED_CATEGORIES));
  return SEED_CATEGORIES;
};

export const saveCategory = (cat) => {
  if (typeof window === 'undefined') return cat;
  const cats = getCategories();
  const idx = cats.findIndex(c => c.id === cat.id);
  if (idx !== -1) {
    cats[idx] = { ...cats[idx], ...cat };
  } else {
    cat.id = `cat-${Date.now()}`;
    cats.push(cat);
  }
  localStorage.setItem('tradelogix_categories_v1', JSON.stringify(cats));
  return cat;
};

export const deleteCategory = (catId) => {
  if (typeof window === 'undefined') return;
  const cats = getCategories().filter(c => c.id !== catId);
  localStorage.setItem('tradelogix_categories_v1', JSON.stringify(cats));
};

// ─── Tag Storage ─────────────────────────────────────────────────────────────

const SEED_TAGS = [
  { id: 'tag-1', name: 'Wireless', slug: 'wireless', description: 'Products with wireless connectivity.' },
  { id: 'tag-2', name: 'Ergonomic', slug: 'ergonomic', description: 'Designed for comfort and efficiency.' },
  { id: 'tag-3', name: 'Noise Cancelling', slug: 'noise-cancelling', description: 'Active noise cancellation technology.' },
  { id: 'tag-4', name: 'Mechanical', slug: 'mechanical', description: 'Mechanical switch keyboards and devices.' },
  { id: 'tag-5', name: 'USB-C', slug: 'usb-c', description: 'Products with USB-C connectivity.' },
  { id: 'tag-6', name: '4K', slug: '4k', description: 'Ultra HD 4K resolution displays.' },
];

export const getTags = () => {
  if (typeof window === 'undefined') return SEED_TAGS;
  const stored = localStorage.getItem('tradelogix_tags_v1');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('tradelogix_tags_v1', JSON.stringify(SEED_TAGS));
  return SEED_TAGS;
};

export const saveTag = (tag) => {
  if (typeof window === 'undefined') return tag;
  const tags = getTags();
  const idx = tags.findIndex(t => t.id === tag.id);
  if (idx !== -1) {
    tags[idx] = { ...tags[idx], ...tag };
  } else {
    tag.id = `tag-${Date.now()}`;
    tags.push(tag);
  }
  localStorage.setItem('tradelogix_tags_v1', JSON.stringify(tags));
  return tag;
};

export const deleteTag = (tagId) => {
  if (typeof window === 'undefined') return;
  const tags = getTags().filter(t => t.id !== tagId);
  localStorage.setItem('tradelogix_tags_v1', JSON.stringify(tags));
};

// ─── Warehouse Storage ───────────────────────────────────────────────────────

const SEED_WAREHOUSES = [
  { id: 'wh-1', name: 'Mumbai Central', code: 'MUM-01', city: 'Mumbai', state: 'Maharashtra', createdAt: new Date().toISOString() },
  { id: 'wh-2', name: 'Delhi Hub', code: 'DEL-01', city: 'Delhi', state: 'Delhi', createdAt: new Date().toISOString() },
  { id: 'wh-3', name: 'Bengaluru Depot', code: 'BLR-01', city: 'Bengaluru', state: 'Karnataka', createdAt: new Date().toISOString() },
];

export const getWarehouses = () => {
  if (typeof window === 'undefined') return SEED_WAREHOUSES;
  const stored = localStorage.getItem('tradelogix_warehouses_v1');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('tradelogix_warehouses_v1', JSON.stringify(SEED_WAREHOUSES));
  return SEED_WAREHOUSES;
};

export const saveWarehouse = (wh) => {
  if (typeof window === 'undefined') return wh;
  const list = getWarehouses();
  const idx = list.findIndex(w => w.id === wh.id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...wh };
  } else {
    wh.id = `wh-${Date.now()}`;
    wh.createdAt = wh.createdAt || new Date().toISOString();
    list.unshift(wh);
  }
  localStorage.setItem('tradelogix_warehouses_v1', JSON.stringify(list));
  return wh;
};

export const deleteWarehouse = (whId) => {
  if (typeof window === 'undefined') return;
  const list = getWarehouses().filter(w => w.id !== whId);
  localStorage.setItem('tradelogix_warehouses_v1', JSON.stringify(list));
};

// ─── Brand Storage ──────────────────────────────────────────────────────────

const SEED_BRANDS = [
  { id: 'brand-1', name: 'Logitech', slug: 'logitech', description: 'Swiss manufacturer of computer peripherals and software.' },
  { id: 'brand-2', name: 'Sony', slug: 'sony', description: 'Japanese multinational conglomerate corporation.' },
  { id: 'brand-3', name: 'Samsung', slug: 'samsung', description: 'Global electronics and display technology manufacturer.' },
  { id: 'brand-4', name: 'Dell', slug: 'dell', description: 'American multinational technology company.' },
  { id: 'brand-5', name: 'Apple', slug: 'apple', description: 'Premium consumer electronics and workstations.' },
];

export const getBrands = () => {
  if (typeof window === 'undefined') return SEED_BRANDS;
  const stored = localStorage.getItem('tradelogix_brands_v1');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('tradelogix_brands_v1', JSON.stringify(SEED_BRANDS));
  return SEED_BRANDS;
};

export const saveBrand = (brand) => {
  if (typeof window === 'undefined') return brand;
  const brands = getBrands();
  const idx = brands.findIndex(b => b.id === brand.id);
  if (idx !== -1) {
    brands[idx] = { ...brands[idx], ...brand };
  } else {
    brand.id = `brand-${Date.now()}`;
    brands.push(brand);
  }
  localStorage.setItem('tradelogix_brands_v1', JSON.stringify(brands));
  return brand;
};

export const deleteBrand = (brandId) => {
  if (typeof window === 'undefined') return;
  const brands = getBrands().filter(b => b.id !== brandId);
  localStorage.setItem('tradelogix_brands_v1', JSON.stringify(brands));
};


