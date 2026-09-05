import React, { useState, useEffect } from 'react';
import { userStore } from '../../store/authStore.js';
import {
  Upload, Search, PackageCheck, AlertTriangle, RefreshCw,
  Layers, HardDrive, CheckCircle2, ChevronDown, ChevronUp, FileCode,
  Plus, Edit2, Trash2
} from 'lucide-react';
import { getMockProducts, saveMockProduct, deleteMockProduct } from '../../utils/mockDb.js';

const API_URL = import.meta.env.PUBLIC_API_URL || (typeof window !== 'undefined' && window.__PUBLIC_API_URL__) || 'http://localhost:6543';

export default function ProductManager() {
  const [productList, setProductList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Bulk ingestion state
  const [jsonInput, setJsonInput] = useState('');
  const [fileInput, setFileInput] = useState(null);
  const [ingestStatus, setIngestStatus] = useState(null);
  const [isIngesting, setIsIngesting] = useState(false);
  const [showJsonArea, setShowJsonArea] = useState(false);

  // Expanded variant row tracking
  const [expandedProduct, setExpandedProduct] = useState(null);

  const getAuthToken = () => {
    return userStore.get()?.accessToken || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('tradelogix_user') || '{}')?.accessToken : '') || '';
  };

  // Fetch catalog from backend API or local fallback
  const fetchCatalog = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/api/admin/products`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.data !== undefined ? json.data : json;
        if (Array.isArray(data)) {
          if (data.length > 0) {
            setProductList(data);
            if (typeof window !== 'undefined') {
              localStorage.setItem('tradelogix_products_v4', JSON.stringify(data));
            }
          } else {
            const seed = getMockProducts();
            setProductList(seed);
          }
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // fallback
    }

    try {
      const data = getMockProducts();
      setProductList(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error loading product data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  // Handle file select
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileInput(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setJsonInput(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  // Perform Bulk Ingest locally
  const handleBulkIngest = async () => {
    if (!jsonInput.trim()) {
      alert('Please paste a catalog JSON or upload a file first.');
      return;
    }

    let parsedPayload;
    try {
      parsedPayload = JSON.parse(jsonInput);
      if (Array.isArray(parsedPayload)) {
        parsedPayload = { products: parsedPayload };
      } else if (parsedPayload.products === undefined) {
        parsedPayload = { products: [parsedPayload] };
      }
    } catch (err) {
      alert('Invalid JSON format. Please verify your catalog payload syntax.');
      return;
    }

    setIsIngesting(true);
    setIngestStatus(null);

    try {
      let inserted = 0;
      let updated = 0;
      for (const prod of parsedPayload.products) {
        if (!prod.variants || prod.variants.length === 0) {
          prod.variants = [{
            id: `var-${Date.now()}`,
            sku: `MOCK-${prod.slug || 'prod'}-${Date.now().toString().slice(-4)}`,
            name: 'Default Title',
            stock: 0,
            warehouseStocks: [],
            prices: []
          }];
        }

        const firstVar = prod.variants[0];
        const stockSum = firstVar.warehouseStocks?.reduce((sum, w) => sum + (parseInt(w.stock, 10) || 0), 0) || 0;
        firstVar.stock = stockSum || firstVar.stock || 0;

        saveMockProduct(prod);
        inserted++;
      }

      setIngestStatus({
        success: true,
        data: {
          productsInserted: inserted,
          productsUpdated: updated,
          variantsInserted: inserted,
          variantsUpdated: updated
        }
      });
      setJsonInput('');
      setFileInput(null);

      await fetchCatalog();
    } catch (err) {
      console.error(err);
      setIngestStatus({
        success: false,
        message: err.message || 'Failed to ingest products catalog'
      });
    } finally {
      setIsIngesting(false);
    }
  };

  // Filter products by search query
  const filtered = productList.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute analytics
  const totalProducts = productList.length;
  const totalStockCount = productList.reduce((sum, p) => {
    const cfg = p.pricingConfigurations?.[0];
    if (cfg) return sum + (cfg.totalStock || cfg.warehouseStocks?.reduce((s, w) => s + (w.stock || 0), 0) || 0);
    return sum + (p.variants?.reduce((vSum, v) => vSum + (v.stock || 0), 0) || 0);
  }, 0);

  // Extract accurate product image with fallback
  const getProductImage = (product) => {
    if (!product) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&auto=format&fit=crop&q=80';

    // 1. Array of images
    if (Array.isArray(product.images) && product.images.length > 0) {
      const first = product.images[0];
      if (typeof first === 'string' && first.trim()) return first;
      if (first && typeof first === 'object' && (first.url || first.src)) return first.url || first.src;
    }

    // 2. JSON stringified images
    if (typeof product.images === 'string' && product.images.trim()) {
      try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const item = parsed[0];
          const found = typeof item === 'string' ? item : item.url || item.src;
          if (found) return found;
        }
      } catch {}
      if (product.images.startsWith('http') || product.images.startsWith('/')) return product.images;
    }

    // 3. Single image fields
    if (product.image && typeof product.image === 'string' && product.image.trim()) return product.image;
    if (product.thumbnail && typeof product.thumbnail === 'string' && product.thumbnail.trim()) return product.thumbnail;

    // 4. Default fallback by category/name
    const n = (product.name || '').toLowerCase();
    if (n.includes('headphone') || n.includes('audio') || n.includes('aeropulse')) {
      return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&auto=format&fit=crop&q=80';
    }
    if (n.includes('monitor') || n.includes('display') || n.includes('ultrasharp')) {
      return 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=150&auto=format&fit=crop&q=80';
    }
    if (n.includes('mouse') || n.includes('master') || n.includes('logitech')) {
      return 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=150&auto=format&fit=crop&q=80';
    }
    if (n.includes('key') || n.includes('board')) {
      return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=150&auto=format&fit=crop&q=80';
    }
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&auto=format&fit=crop&q=80';
  };

  return (
    <div className="space-y-6 pb-12">



      {/* Action Bar (Search & Add Product & Refresh) */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-200 bg-white shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog products..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <a
            href="/admin/products/add"
            className="flex-1 sm:flex-initial px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 hover:opacity-90 text-center"
          >
            <Plus className="w-4 h-4" /> Add Product
          </a>

          <button
            onClick={fetchCatalog}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 text-xs font-semibold"
            title="Reload Catalog"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-brand-600" />
            <div className="text-xs font-semibold">Connecting to B2B catalog...</div>
          </div>
        ) : error ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
            <AlertTriangle className="w-10 h-10 text-rose-500" />
            <div className="text-xs font-bold text-slate-700">Catalog connection failed</div>
            <div className="text-[11px] text-slate-400">{error}</div>
            <button
              onClick={fetchCatalog}
              className="mt-2 px-4 py-1.5 bg-brand-600 text-white rounded-lg text-[11px] font-semibold hover:opacity-90 transition-opacity"
            >
              Retry Connection
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 text-center gap-3">
            <Layers className="w-12 h-12 text-slate-300" />
            <div className="text-xs font-bold text-slate-700">No B2B Catalog Items Found</div>
            <div className="text-[11px] max-w-sm text-slate-400">The product catalog is empty. Create a product using the button above or drop a JSON file to sync.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="p-4 pl-6">Product</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Base Pricing</th>
                  <th className="p-4">Aggregate Stock</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((product) => {
                  const isExpanded = expandedProduct === product.id;
                  const cfg = product.pricingConfigurations?.[0];
                  
                  // Compute total stock from product.totalStock or warehouse arrays
                  const currentWhStocks = product.warehouseStocks || cfg?.warehouseStocks || product.variants?.[0]?.warehouseStocks || [];
                  const totalStock = product.totalStock !== undefined && product.totalStock !== null
                    ? parseInt(product.totalStock, 10)
                    : currentWhStocks.reduce((sum, w) => sum + (parseInt(w.stock, 10) || 0), 0);

                  const displaySKU = product.sku || cfg?.sku || product.variants?.[0]?.sku || 'N/A';

                  // Compute base / min price
                  const allPriceList = product.pricestiers || cfg?.pricestiers || product.prices || [];
                  const defaultPriceTier = allPriceList.find(pt => pt.priceGroup === 'Default');
                  const rawMinPrice = defaultPriceTier?.price !== undefined
                    ? defaultPriceTier.price
                    : allPriceList[0]?.price !== undefined
                    ? allPriceList[0].price
                    : product.pricing?.unitPrice || 0;
                  const minPrice = parseFloat(rawMinPrice) || 0;

                  return (
                    <React.Fragment key={product.id}>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 pl-6 flex items-center gap-3">
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-50 shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate max-w-xs">{product.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">ID: {product.id}</div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-slate-500 max-w-[200px] truncate" title={displaySKU}>
                          {displaySKU}
                        </td>
                        <td className="p-4 font-display font-bold text-slate-900 text-sm">
                          {minPrice > 0 ? `₹${minPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'Not configured'}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${totalStock < 25
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                            {totalStock < 25 ? <AlertTriangle className="w-3 h-3" /> : <PackageCheck className="w-3 h-3" />}
                            {totalStock} units
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right flex items-center justify-end gap-2 h-16">
                          <a
                            href={`/admin/products/edit/${product.id}`}
                            className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-brand-500 transition-all flex items-center gap-1 text-[10px] font-bold text-center"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </a>

                          <button
                            onClick={async () => {
                              if (window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
                                try {
                                  const token = getAuthToken();
                                  await fetch(`${API_URL}/api/admin/products/${product.id}`, {
                                    method: 'DELETE',
                                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                                  });
                                } catch {
                                  // fallback
                                }
                                deleteMockProduct(product.id);
                                setProductList(prev => prev.filter(p => p.id !== product.id));
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 hover:border-rose-400 transition-all flex items-center gap-1 text-[10px] font-bold"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>

                          <button
                            onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                            className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-all flex items-center gap-1 text-[10px] font-bold"
                          >
                            {isExpanded ? (
                              <>
                                Hide <ChevronUp className="w-3.5 h-3.5" />
                              </>
                            ) : (
                              <>
                                Stock Breakdown <ChevronDown className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Warehouse Stock Detail Section */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className="bg-slate-50 p-6 pl-12 border-y border-slate-100">
                            <div className="space-y-4">
                              <div className="text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200 pb-1">Warehouse Stock Distribution</div>

                              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-3">
                                <div>
                                  <div className="font-bold text-slate-800">Depot Stock Levels</div>
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {displaySKU}</div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                  {currentWhStocks.length > 0 ? (
                                    currentWhStocks.map((ws) => (
                                      <div key={ws.warehouseId || ws.warehouseCode} className="bg-slate-50 border border-slate-100 p-2 rounded-lg text-center">
                                        <div className="text-[9px] font-bold text-slate-500 truncate" title={ws.warehouseName}>
                                          {ws.warehouseCode || ws.warehouseName}
                                        </div>
                                        <div className="font-mono text-xs font-bold text-slate-800 mt-1">
                                          {ws.stock || 0} units
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="col-span-3 text-[10px] text-slate-400 text-center py-2 bg-slate-50 rounded-lg">
                                      No warehouse distribution seeded. Total: {totalStock} units.
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* B2B Pricing Groups */}
                              {allPriceList.length > 0 && (
                                <div className="space-y-2">
                                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">B2B Group Pricing</div>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {allPriceList.map(pt => (
                                      <div key={pt.priceGroup} className="bg-white border border-slate-200 p-3 rounded-xl text-center relative">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase">{pt.priceGroup}</div>
                                        {pt.compare_at_price && (
                                          <div className="flex items-center justify-center gap-1 mt-1">
                                            <span className="text-[9px] text-slate-400 line-through font-mono">
                                              ₹{parseFloat(pt.compare_at_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </span>
                                            <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1 rounded">
                                              -{Math.round((1 - parseFloat(pt.price) / parseFloat(pt.compare_at_price)) * 100)}%
                                            </span>
                                          </div>
                                        )}
                                        <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                                          ₹{parseFloat(pt.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </div>
                                        {pt.tiers?.length > 0 && (
                                          <div className="text-[9px] text-slate-400 mt-1">{pt.tiers.length} slab(s)</div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
