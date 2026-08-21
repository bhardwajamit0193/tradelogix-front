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
    products[index] = { ...products[index], ...product };
  } else {
    product.id = `prod-${Date.now()}`;
    products.push(product);
  }
  localStorage.setItem('tradelogix_products_v4', JSON.stringify(products));
  return product;
};

export const deleteMockProduct = (productId) => {
  if (typeof window === 'undefined') return;
  const products = getMockProducts();
  const filtered = products.filter(p => p.id !== productId);
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
