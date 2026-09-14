const SEED_PRODUCTS = [];

export const getMockProducts = () => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('tradelogix_products_v4');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return [];
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

const SEED_CATEGORIES = [];

export const getCategories = () => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('tradelogix_categories_v1');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return [];
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

const SEED_TAGS = [];

export const getTags = () => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('tradelogix_tags_v1');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return [];
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

const SEED_WAREHOUSES = [];

export const getWarehouses = () => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('tradelogix_warehouses_v1');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return [];
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

const SEED_BRANDS = [];

export const getBrands = () => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('tradelogix_brands_v1');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return [];
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



